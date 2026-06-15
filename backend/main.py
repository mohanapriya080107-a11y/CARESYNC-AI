import asyncio
import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import db
import simulator
import ai_engine

# Setup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("CareSyncAI.Main")

app = FastAPI(title="CareSync AI Backend", version="1.0.0")

# Setup CORS to allow React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Open for hackathon dev environment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active WebSocket connections
active_connections: list[WebSocket] = []

# --- BACKGROUND SIMULATION LOOP ---

async def run_simulation_loop():
    """
    Background worker that runs the patient simulator and pushes
    live updates to all connected WebSockets every 3 seconds.
    """
    logger.info("CareSync AI Simulation loop started.")
    while True:
        try:
            # Step the simulation
            simulator.step_simulation()
            
            # Sync to Supabase in a background thread to prevent event loop blocking
            if db.supabase_client:
                await asyncio.to_thread(db.sync_to_supabase)
            
            # Broadcast the updated state to all connected WebSockets
            if active_connections:
                payload = {
                    "patients": [p.model_dump() for p in db.patients.values()],
                    "doctors": [d.model_dump() for d in db.doctors.values()],
                    "alerts": [a.model_dump() for a in db.alerts],
                    "analytics": db.analytics
                }
                
                # Create a list of tasks to broadcast in parallel
                disconnects = []
                for connection in active_connections:
                    try:
                        await connection.send_json(payload)
                    except Exception as e:
                        logger.warning(f"Error sending WebSocket updates: {e}")
                        disconnects.append(connection)
                        
                # Remove stale connections
                for conn in disconnects:
                    if conn in active_connections:
                        active_connections.remove(conn)
                        
        except Exception as e:
            logger.error(f"Error in simulation loop: {e}", exc_info=True)
            
        await asyncio.sleep(3.0)

@app.on_event("startup")
async def startup_event():
    # Start simulation loop in the background of FastAPI
    asyncio.create_task(run_simulation_loop())

# --- WEBSOCKET ENDPOINT ---

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    logger.info(f"Client connected. Active WebSocket clients: {len(active_connections)}")
    
    # Send initial data immediately
    try:
        payload = {
            "patients": [p.model_dump() for p in db.patients.values()],
            "doctors": [d.model_dump() for d in db.doctors.values()],
            "alerts": [a.model_dump() for a in db.alerts],
            "analytics": db.analytics
        }
        await websocket.send_json(payload)
    except Exception as e:
        logger.error(f"Error sending initial state: {e}")
        
    try:
        while True:
            # We listen for messages from client (e.g. commands, acknowledgements), but mostly it's a push server
            data = await websocket.receive_text()
            logger.info(f"Received from client: {data}")
    except WebSocketDisconnect:
        if websocket in active_connections:
            active_connections.remove(websocket)
        logger.info(f"Client disconnected. Active WebSocket clients: {len(active_connections)}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        if websocket in active_connections:
            active_connections.remove(websocket)

# --- REST API ENDPOINTS ---

@app.get("/api/patients")
async def get_patients():
    """
    Returns all patients sorted by priority rank.
    """
    # Sort patients by priority rank
    sorted_patients = sorted(db.patients.values(), key=lambda x: x.priority_rank)
    return [p.model_dump() for p in sorted_patients]

@app.get("/api/patients/{patient_id}")
async def get_patient_detail(patient_id: str):
    """
    Returns details of a single patient.
    """
    if patient_id not in db.patients:
        raise HTTPException(status_code=404, detail="Patient not found")
    return db.patients[patient_id].model_dump()

@app.get("/api/doctors")
async def get_doctors():
    """
    Returns lists of all doctors.
    """
    return [d.model_dump() for d in db.doctors.values()]

class ScenarioRequest(BaseModel):
    scenario: str

@app.post("/api/scenarios/{scenario_name}")
async def trigger_scenario(scenario_name: str):
    """
    Endpoint to trigger specific demo scenarios.
    """
    valid_scenarios = ["stable", "high_risk", "critical", "predicted_emergency", "escalation"]
    if scenario_name not in valid_scenarios:
        raise HTTPException(status_code=400, detail=f"Invalid scenario. Choose from: {valid_scenarios}")
        
    simulator.trigger_demo_scenario(scenario_name)
    if db.supabase_client:
        await asyncio.to_thread(db.sync_to_supabase)
    return {"status": "success", "message": f"Scenario {scenario_name} triggered."}

@app.post("/api/copilot/{patient_id}")
async def get_copilot_recommendations(patient_id: str):
    """
    Features 6: AI Emergency Copilot decision support generation.
    """
    if patient_id not in db.patients:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    patient_data = db.patients[patient_id].model_dump()
    copilot_insight = ai_engine.generate_emergency_copilot(patient_data)
    
    # Track recommendation generation in analytics
    db.analytics["ai_recommendations_generated"] += 1
    
    return copilot_insight

@app.post("/api/family/{patient_id}")
async def get_family_explanation(patient_id: str):
    """
    Feature 12: Family Communication Generator.
    """
    if patient_id not in db.patients:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    patient_data = db.patients[patient_id].model_dump()
    family_msg = ai_engine.generate_family_update(patient_data)
    return {"family_update": family_msg}

class ChatRequest(BaseModel):
    message: str

@app.post("/api/nurse/chat")
async def chat_nurse_assistant(req: ChatRequest):
    """
    Feature 11: AI Nurse Assistant chat interface.
    """
    critical_patients = [p.model_dump() for p in db.patients.values() if p.risk_category == "Critical"]
    all_patients = [p.model_dump() for p in db.patients.values()]
    
    answer = ai_engine.answer_nurse_question(req.message, critical_patients, all_patients)
    return {"response": answer}

@app.post("/api/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str):
    """
    Acknowledge a patient alert.
    """
    for alert in db.alerts:
        if alert.id == alert_id:
            alert.acknowledged = True
            
            # If the patient is P101 (Escalation) or in critical state, acknowledge confirm on timeline too
            p_id = alert.patient_id
            if p_id in db.patients:
                p = db.patients[p_id]
                # Acknowledge doctor arrival
                p.escalation_status = "None"
                p.escalation_timer = None
                p.timeline.append(TimelineEvent(
                    timestamp=time.time(),
                    title="Alert Acknowledged",
                    description="Doctor confirmed attendance. Treatment protocol initiated.",
                    status="done"
                ))
                p.timeline.append(TimelineEvent(
                    timestamp=time.time() + 5, # Simulated future state
                    title="Condition Stabilized",
                    description="Vitals normalized under intervention.",
                    status="done"
                ))
            if db.supabase_client:
                await asyncio.to_thread(db.sync_to_supabase)
            return {"status": "success", "message": f"Alert {alert_id} acknowledged."}
            
    raise HTTPException(status_code=404, detail="Alert not found or already acknowledged")

import time # Required for timeline event timestamp override
