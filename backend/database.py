import random
import time
import os
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# --- PYDANTIC SCHEMAS ---

class VitalRecord(BaseModel):
    heart_rate: float
    systolic: float
    diastolic: float
    spo2: float
    respiratory_rate: float
    temperature: float
    timestamp: float

class PredictionRecord(BaseModel):
    minutes_ahead: int
    heart_rate: float
    systolic: float
    diastolic: float
    spo2: float
    status: str

class TimelineEvent(BaseModel):
    timestamp: float
    title: str
    description: str
    status: str  # "done", "pending", "active"

class Doctor(BaseModel):
    id: str
    name: str
    department: str
    workload: int
    eta_minutes: int
    status: str  # "Available", "Busy"
    phone: str

class Patient(BaseModel):
    id: str
    name: str
    age: int
    gender: str
    ward: str  # "ICU", "Emergency Ward", "General Ward", "Recovery Ward"
    bed_no: str
    existing_conditions: List[str]
    vitals: VitalRecord
    vitals_history: List[VitalRecord] = []
    risk_score: float = 0.0
    risk_category: str = "Stable"  # "Stable", "Warning", "High Risk", "Critical"
    risk_reason: str = "All vitals within normal parameters."
    contributing_factors: Dict[str, float] = {}
    assigned_doctor_id: Optional[str] = None
    escalation_status: str = "None"  # "None", "Pending", "Escalated_Senior", "Escalated_ICU", "Escalated_Emergency"
    escalation_timer: Optional[int] = None  # seconds remaining
    timeline: List[TimelineEvent] = []
    predictions: List[PredictionRecord] = []
    priority_rank: int = 100

class Alert(BaseModel):
    id: str
    patient_id: str
    patient_name: str
    ward: str
    severity: str  # "INFO", "WARNING", "HIGH RISK", "CRITICAL"
    message: str
    timestamp: float
    acknowledged: bool = False

# --- DATABASE ENGINE ---

class CareSyncDB:
    def __init__(self):
        self.patients: Dict[str, Patient] = {}
        self.doctors: Dict[str, Doctor] = {}
        self.alerts: List[Alert] = []
        self.analytics: Dict[str, Any] = {
            "avg_response_time": 4.2,  # minutes
            "critical_cases_today": 14,
            "lives_saved_today": 9,
            "alert_accuracy": 94.6,
            "predicted_emergencies": 18,
            "ai_recommendations_generated": 142
        }
        
        # Initialize Supabase client if credentials are provided
        self.supabase_client = None
        if SUPABASE_URL and SUPABASE_KEY:
            try:
                self.supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
                print("CareSync AI: Connected to Supabase successfully!")
            except Exception as e:
                print(f"CareSync AI: Failed to connect to Supabase: {e}")
                
        # Try to load state from Supabase, fallback to initial seeding if empty/disabled
        loaded = False
        if self.supabase_client:
            loaded = self.load_from_supabase()
            
        if not loaded or not self.patients:
            self.initialize_doctors()
            self.initialize_patients()
            if self.supabase_client:
                print("CareSync AI: Database is empty. Seeding initial state to Supabase...")
                self.sync_to_supabase()

    def load_from_supabase(self) -> bool:
        if not self.supabase_client:
            return False
            
        try:
            # 1. Load Doctors
            doc_res = self.supabase_client.table("doctors").select("*").execute()
            if doc_res.data:
                self.doctors = {}
                for d in doc_res.data:
                    # Remove database extra fields if present
                    d.pop("updated_at", None)
                    self.doctors[d["id"]] = Doctor(**d)
                    
            # 2. Load Patients
            pat_res = self.supabase_client.table("patients").select("*").execute()
            if pat_res.data:
                self.patients = {}
                for p in pat_res.data:
                    p.pop("updated_at", None)
                    
                    # Robust check to prevent crash if vitals is malformed (e.g. an integer)
                    if not isinstance(p.get("vitals"), dict):
                        print(f"CareSync AI: Skipping malformed patient {p.get('id')} (vitals is not a dict: {p.get('vitals')})")
                        continue
                        
                    try:
                        # Convert JSONB fields back into objects
                        p["vitals"] = VitalRecord(**p["vitals"])
                        p["vitals_history"] = [VitalRecord(**vh) for vh in p["vitals_history"] if isinstance(vh, dict)]
                        p["timeline"] = [TimelineEvent(**t) for t in p["timeline"] if isinstance(t, dict)]
                        p["predictions"] = [PredictionRecord(**pr) for pr in p["predictions"] if isinstance(pr, dict)]
                        self.patients[p["id"]] = Patient(**p)
                    except Exception as row_err:
                        print(f"CareSync AI: Skipping malformed patient row {p.get('id')}: {row_err}")
                    
            # 3. Load Alerts
            alert_res = self.supabase_client.table("alerts").select("*").execute()
            if alert_res.data:
                self.alerts = []
                for a in alert_res.data:
                    a.pop("created_at", None)
                    self.alerts.append(Alert(**a))
                    
            # 4. Load Analytics
            ana_res = self.supabase_client.table("analytics").select("*").filter("key", "eq", "metrics").execute()
            if ana_res.data:
                self.analytics = ana_res.data[0]["value"]
                
            print(f"CareSync AI: Successfully loaded state from Supabase ({len(self.patients)} patients, {len(self.doctors)} doctors).")
            return True
        except Exception as e:
            print(f"CareSync AI: Error loading from Supabase: {e}")
            return False

    def sync_to_supabase(self):
        if not self.supabase_client:
            return
            
        try:
            # 1. Sync Doctors
            doctor_records = []
            for d in self.doctors.values():
                doctor_records.append({
                    "id": d.id,
                    "name": d.name,
                    "department": d.department,
                    "workload": d.workload,
                    "eta_minutes": d.eta_minutes,
                    "status": d.status,
                    "phone": d.phone
                })
            if doctor_records:
                self.supabase_client.table("doctors").upsert(doctor_records).execute()
                
            # 2. Sync Patients
            patient_records = []
            for p in self.patients.values():
                patient_records.append({
                    "id": p.id,
                    "name": p.name,
                    "age": p.age,
                    "gender": p.gender,
                    "ward": p.ward,
                    "bed_no": p.bed_no,
                    "existing_conditions": p.existing_conditions,
                    "vitals": p.vitals.model_dump(),
                    "vitals_history": [v.model_dump() for v in p.vitals_history],
                    "risk_score": p.risk_score,
                    "risk_category": p.risk_category,
                    "risk_reason": p.risk_reason,
                    "contributing_factors": p.contributing_factors,
                    "assigned_doctor_id": p.assigned_doctor_id,
                    "escalation_status": p.escalation_status,
                    "escalation_timer": p.escalation_timer,
                    "timeline": [t.model_dump() for t in p.timeline],
                    "predictions": [pr.model_dump() for pr in p.predictions],
                    "priority_rank": p.priority_rank
                })
            if patient_records:
                self.supabase_client.table("patients").upsert(patient_records).execute()
                
            # 3. Sync Alerts
            alert_records = []
            for a in self.alerts:
                alert_records.append({
                    "id": a.id,
                    "patient_id": a.patient_id,
                    "patient_name": a.patient_name,
                    "ward": a.ward,
                    "severity": a.severity,
                    "message": a.message,
                    "timestamp": a.timestamp,
                    "acknowledged": a.acknowledged
                })
            if alert_records:
                self.supabase_client.table("alerts").upsert(alert_records).execute()
                
            # 4. Sync Analytics
            self.supabase_client.table("analytics").upsert({
                "key": "metrics",
                "value": self.analytics
            }).execute()
            
        except Exception as e:
            print(f"CareSync AI: Error syncing to Supabase: {e}")

    def initialize_doctors(self):
        docs = [
            Doctor(id="D101", name="Dr. Sarah Jenkins", department="Critical Care", workload=2, eta_minutes=2, status="Available", phone="+1 (555) 019-2831"),
            Doctor(id="D102", name="Dr. Marcus Vance", department="Cardiology", workload=4, eta_minutes=5, status="Available", phone="+1 (555) 019-2832"),
            Doctor(id="D103", name="Dr. Elena Rostova", department="Pulmonology", workload=1, eta_minutes=3, status="Available", phone="+1 (555) 019-2833"),
            Doctor(id="D104", name="Dr. Amit Patel", department="Emergency Medicine", workload=3, eta_minutes=1, status="Available", phone="+1 (555) 019-2834"),
            Doctor(id="D105", name="Dr. Chloe Dubois", department="Neurology", workload=2, eta_minutes=6, status="Busy", phone="+1 (555) 019-2835"),
            Doctor(id="D106", name="Dr. Robert Kim", department="Critical Care", workload=3, eta_minutes=4, status="Available", phone="+1 (555) 019-2836"),
        ]
        for d in docs:
            self.doctors[d.id] = d

    def initialize_patients(self):
        wards = ["ICU", "Emergency Ward", "General Ward", "Recovery Ward"]
        diagnoses = [
            ("COPD Exacerbation", ["Chronic Bronchitis", "Hypertension"]),
            ("Acute Myocardial Infarction", ["Coronary Artery Disease", "Type 2 Diabetes"]),
            ("Post-Op Coronary Bypass", ["Hypertension", "Hyperlipidemia"]),
            ("Sepsis", ["Kidney Disease", "Diabetes"]),
            ("Community-Acquired Pneumonia", ["Asthma"]),
            ("Decompensated Heart Failure", ["Atrial Fibrillation", "Chronic Kidney Disease"]),
            ("Acute Stroke", ["Hypertension", "Atrial Fibrillation"]),
            ("Diabetic Ketoacidosis", ["Type 1 Diabetes"]),
            ("Post-Op Hip Replacement", ["Osteoarthritis"]),
            ("Asthma Exacerbation", ["Allergies", "GERD"]),
            ("Gastrointestinal Bleed", ["Anemia", "Alcoholic Liver Disease"]),
            ("Pulmonary Embolism", ["Deep Vein Thrombosis"]),
            ("Stable Observation", ["Hypertension"]),
        ]
        
        first_names = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Elizabeth", "William", "Linda", 
                       "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen", 
                       "Christopher", "Nancy", "Daniel", "Lisa", "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra",
                       "Donald", "Ashley", "Steven", "Dorothy", "Paul", "Kimberly", "Andrew", "Emily", "Joshua", "Donna",
                       "Kenneth", "Michelle", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa", "Timothy", "Deborah"]
        
        last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", 
                      "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", 
                      "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", 
                      "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", 
                      "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"]

        # Ensure seed reproducibility for baseline synthetic data
        random.seed(42)
        
        # We will initialize 100 patients
        for i in range(1, 101):
            p_id = f"P{100 + i}"
            name = f"{random.choice(first_names)} {random.choice(last_names)}"
            age = random.randint(18, 92)
            gender = random.choice(["Male", "Female"])
            
            # Wards distribution
            if i <= 20:
                ward = "ICU"
            elif i <= 45:
                ward = "Emergency Ward"
            elif i <= 80:
                ward = "General Ward"
            else:
                ward = "Recovery Ward"
                
            bed_no = f"{ward[0]}-{random.randint(101, 199)}"
            diag, conditions = random.choice(diagnoses)
            
            # Generate baseline vitals: make some patients critical by default (every 20th patient)
            is_critical_init = (i % 20 == 0)
            
            if is_critical_init:
                hr = float(random.randint(110, 130))
                sys = float(random.randint(80, 95))
                dia = float(random.randint(50, 60))
                spo2 = float(random.randint(82, 88))
                rr = float(random.randint(25, 30))
                temp = round(random.uniform(38.0, 39.5), 1)
            else:
                hr = float(random.randint(65, 85))
                sys = float(random.randint(110, 130))
                dia = float(random.randint(70, 85))
                spo2 = float(random.randint(96, 100))
                rr = float(random.randint(12, 18))
                temp = round(random.uniform(36.4, 37.2), 1)
            
            current_time = time.time()
            vitals = VitalRecord(
                heart_rate=hr,
                sys=sys, # wait, systolic is the field name! Let's check VitalRecord schema
                systolic=sys,
                diastolic=dia,
                spo2=spo2,
                respiratory_rate=rr,
                temperature=temp,
                timestamp=current_time
            )
            
            # Build history (5 data points in the past)
            history = []
            for h_idx in range(5, 0, -1):
                hist_time = current_time - (h_idx * 60)
                history.append(VitalRecord(
                    heart_rate=hr + random.randint(-3, 3),
                    systolic=sys + random.randint(-5, 5),
                    diastolic=dia + random.randint(-3, 3),
                    spo2=min(100.0, spo2 + random.randint(-1, 0)),
                    respiratory_rate=rr + random.randint(-1, 1),
                    temperature=round(temp + random.uniform(-0.2, 0.2), 1),
                    timestamp=hist_time
                ))
            history.append(vitals)

            # Standard Timeline
            timeline = [
                TimelineEvent(timestamp=current_time - 7200, title="Patient Admitted", description=f"Admitted to {ward} with primary diagnosis of {diag}.", status="done"),
                TimelineEvent(timestamp=current_time - 3600, title="Initial Assessment", description="Vitals stable. Initial clinical assessment completed.", status="done"),
            ]

            p = Patient(
                id=p_id,
                name=name,
                age=age,
                gender=gender,
                ward=ward,
                bed_no=bed_no,
                existing_conditions=[diag] + conditions,
                vitals=vitals,
                vitals_history=history,
                timeline=timeline,
                assigned_doctor_id=random.choice(list(self.doctors.keys())) if random.random() > 0.4 else None
            )
            
            if is_critical_init:
                p.risk_score = 85.0
                p.risk_category = "Critical"
                p.risk_reason = "Severe hypoxemia and tachypnea detected."
                p.contributing_factors = {"SpO2 Drop": 55.0, "Severe Tachypnea": 30.0}
                
            self.patients[p_id] = p
            
        # Manually create a couple of highly recognizable patients for scenarios
        self._setup_preset_patients()
        
    def _setup_preset_patients(self):
        # Patient P101: The Escalation & Critical Patient Scenario (e.g. Severe Sepsis)
        p101 = self.patients["P101"]
        p101.name = "Robert Carter"
        p101.age = 68
        p101.gender = "Male"
        p101.ward = "ICU"
        p101.bed_no = "ICU-101"
        p101.existing_conditions = ["Severe Sepsis", "Type 2 Diabetes", "Chronic Kidney Disease"]
        p101.vitals = VitalRecord(
            heart_rate=132.0,
            systolic=85.0,
            diastolic=50.0,
            spo2=85.0,
            respiratory_rate=32.0,
            temperature=39.2,
            timestamp=time.time()
        )
        p101.risk_score = 96.0
        p101.risk_category = "Critical"
        p101.risk_reason = "Severe Septic Shock + profound acidosis"
        p101.contributing_factors = { "SpO2 Drop": 40.0, "Sepsis Shock": 30.0, "High Temp": 15.0 }
        
        # Patient P102: Stable Patient
        p102 = self.patients["P102"]
        p102.name = "Eleanor Thompson"
        p102.age = 54
        p102.gender = "Female"
        p102.ward = "Recovery Ward"
        p102.bed_no = "REC-102"
        p102.existing_conditions = ["Post-Op Hip Replacement", "Hypertension"]
        
        # Patient P103: Predicted Emergency Scenario (e.g. Acute Respiratory Distress / COPD deterioration)
        p103 = self.patients["P103"]
        p103.name = "Marcus Miller"
        p103.age = 75
        p103.gender = "Male"
        p103.ward = "Emergency Ward"
        p103.bed_no = "ER-103"
        p103.existing_conditions = ["COPD Exacerbation", "Coronary Artery Disease"]
        p103.vitals = VitalRecord(
            heart_rate=126.0,
            systolic=92.0,
            diastolic=58.0,
            spo2=88.0,
            respiratory_rate=29.0,
            temperature=38.4,
            timestamp=time.time()
        )
        p103.risk_score = 82.0
        p103.risk_category = "Critical"
        p103.risk_reason = "Severe bronchospasm with high risk of respiratory failure"
        p103.contributing_factors = { "SpO2 Drop": 35.0, "Severe Tachypnea": 25.0, "Tachycardia": 15.0 }

        # Patient P104: High Risk Patient (e.g. Cardiac arrhythmia warning)
        p104 = self.patients["P104"]
        p104.name = "Sofia Martinez"
        p104.age = 62
        p104.gender = "Female"
        p104.ward = "General Ward"
        p104.bed_no = "GW-104"
        p104.existing_conditions = ["Atrial Fibrillation", "Hypertension", "Hyperlipidemia"]

# Instantiate the global db singleton
db = CareSyncDB()
