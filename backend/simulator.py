import time
import random
import logging
from typing import Dict, Any, List
from database import db, Patient, VitalRecord, PredictionRecord, TimelineEvent, Alert, Doctor

logger = logging.getLogger("CareSyncAI.Simulator")

# Track which patient has which active override scenario
# "stable", "high_risk", "critical", "predicted_emergency", "escalation"
patient_overrides: Dict[str, str] = {}

def calculate_risk_score(patient: Patient) -> Dict[str, Any]:
    """
    Computes a clinical risk score from 0-100 and yields contributing factors.
    """
    v = patient.vitals
    age = patient.age
    conditions = patient.existing_conditions
    
    score = 0.0
    factors = {}
    reasons = []

    # 1. Oxygen Saturation (SpO2) - The most critical vital sign
    if v.spo2 < 90:
        penalty = 55 + (90 - v.spo2) * 3
        penalty = min(80.0, penalty)
        factors["SpO2 Drop"] = round(penalty, 1)
        score += penalty
        reasons.append(f"Severe hypoxemia (SpO2: {v.spo2}%)")
    elif v.spo2 < 95:
        penalty = 15 + (95 - v.spo2) * 6
        factors["SpO2 Decline"] = round(penalty, 1)
        score += penalty
        reasons.append(f"Moderate hypoxemia (SpO2: {v.spo2}%)")

    # 2. Heart Rate (HR)
    if v.heart_rate > 120:
        penalty = 25 + (v.heart_rate - 120) * 0.8
        factors["Tachycardia Spike"] = round(min(40.0, penalty), 1)
        score += factors["Tachycardia Spike"]
        reasons.append(f"Severe tachycardia (HR: {int(v.heart_rate)} bpm)")
    elif v.heart_rate > 100:
        penalty = 10 + (v.heart_rate - 100) * 0.7
        factors["Elevated Heart Rate"] = round(penalty, 1)
        score += penalty
        reasons.append(f"Mild tachycardia (HR: {int(v.heart_rate)} bpm)")
    elif v.heart_rate < 50:
        penalty = 15 + (50 - v.heart_rate) * 1.0
        factors["Bradycardia"] = round(min(30.0, penalty), 1)
        score += factors["Bradycardia"]
        reasons.append(f"Bradycardia (HR: {int(v.heart_rate)} bpm)")

    # 3. Respiratory Rate (RR)
    if v.respiratory_rate > 28:
        penalty = 30 + (v.respiratory_rate - 28) * 1.5
        factors["Severe Tachypnea"] = round(min(50.0, penalty), 1)
        score += factors["Severe Tachypnea"]
        reasons.append(f"Severe tachypnea (RR: {int(v.respiratory_rate)} breaths/min)")
    elif v.respiratory_rate > 20:
        penalty = 10 + (v.respiratory_rate - 20) * 1.5
        factors["Tachypnea"] = round(penalty, 1)
        score += penalty
        reasons.append(f"Elevated breathing rate (RR: {int(v.respiratory_rate)} breaths/min)")
    elif v.respiratory_rate < 10:
        penalty = 20.0
        factors["Bradypnea"] = penalty
        score += penalty
        reasons.append(f"Bradypnea (RR: {int(v.respiratory_rate)} breaths/min)")

    # 4. Temperature (Temp)
    if v.temperature > 38.5:
        penalty = 12 + (v.temperature - 38.5) * 8
        factors["Hyperthermia (Fever)"] = round(min(35.0, penalty), 1)
        score += factors["Hyperthermia (Fever)"]
        reasons.append(f"High fever (Temp: {v.temperature}°C)")
    elif v.temperature > 37.8:
        penalty = 5.0
        factors["Low Grade Fever"] = penalty
        score += penalty
        reasons.append(f"Low grade fever (Temp: {v.temperature}°C)")
    elif v.temperature < 35.5:
        penalty = 20 + (35.5 - v.temperature) * 10
        factors["Hypothermia"] = round(min(40.0, penalty), 1)
        score += factors["Hypothermia"]
        reasons.append(f"Hypothermia (Temp: {v.temperature}°C)")

    # 5. Blood Pressure (BP) - Systolic
    if v.systolic < 90:
        penalty = 25 + (90 - v.systolic) * 1.0
        factors["Hypotension (Low BP)"] = round(min(45.0, penalty), 1)
        score += factors["Hypotension (Low BP)"]
        reasons.append(f"Severe hypotension (SBP: {int(v.systolic)} mmHg)")
    elif v.systolic > 160:
        penalty = 15 + (v.systolic - 160) * 0.5
        factors["Hypertensive Urgency"] = round(min(30.0, penalty), 1)
        score += factors["Hypertensive Urgency"]
        reasons.append(f"Hypertension (SBP: {int(v.systolic)} mmHg)")

    # 6. Age Factor
    if age > 75:
        factors["Advanced Age Factor"] = 12.0
        score += 12.0
    elif age > 65:
        factors["Age Factor"] = 6.0
        score += 6.0

    # 7. Pre-existing Conditions Complexity
    high_risk_conditions = ["Sepsis", "Severe Sepsis", "Acute Myocardial Infarction", "Decompensated Heart Failure", "Acute Stroke"]
    has_high_risk = any(cond in high_risk_conditions for cond in conditions)
    if has_high_risk:
        factors["Comorbidity Risk"] = 15.0
        score += 15.0
    elif len(conditions) >= 2:
        factors["Multiple Comorbidities"] = 8.0
        score += 8.0

    # Clamp score
    score = min(100.0, max(0.0, score))
    
    # Categorize
    if score >= 85:
        category = "Critical"
    elif score >= 60:
        category = "High Risk"
    elif score >= 35:
        category = "Warning"
    else:
        category = "Stable"

    # Default reason
    if not reasons:
        reason = "All monitored vitals are within normal range."
    else:
        reason = " + ".join(reasons[:3])
        if len(reasons) > 3:
            reason += " and other abnormal vitals"
            
    return {
        "score": round(score, 1),
        "category": category,
        "reason": reason,
        "factors": factors
    }

def generate_digital_twin_predictions(patient: Patient) -> List[PredictionRecord]:
    """
    Simulates predictions at 15m, 30m, and 60m into the future.
    Reflects whether they are deteriorating, stable, or recovering.
    """
    v = patient.vitals
    p_id = patient.id
    override = patient_overrides.get(p_id)
    
    predictions = []
    
    # Check if this patient is currently undergoing a deteriorating scenario
    is_deteriorating = override in ["critical", "escalation"] or (override == "predicted_emergency") or patient.risk_category == "Critical"
    is_warning = override == "high_risk" or patient.risk_category == "High Risk"

    intervals = [15, 30, 60]
    
    for minutes in intervals:
        factor = minutes / 60.0
        
        if is_deteriorating:
            # Predict worse trends
            if p_id == "P103" or override == "predicted_emergency":
                # Matches the specific COPD deterioration prediction (SpO2: 94 -> 91 -> 88 -> 82)
                pred_spo2 = max(80.0, v.spo2 - (minutes * 0.2)) if v.spo2 > 90 else max(75.0, v.spo2 - (minutes * 0.1))
                # Let's override to match example exactly for P103
                if p_id == "P103":
                    if minutes == 15: pred_spo2 = 91.0
                    elif minutes == 30: pred_spo2 = 88.0
                    elif minutes == 60: pred_spo2 = 82.0
                pred_hr = v.heart_rate + (minutes * 0.5)
                pred_sys = max(90.0, v.systolic - (minutes * 0.4))
                status = "Likely Critical" if minutes >= 30 else "Deteriorating"
            else:
                pred_spo2 = max(75.0, v.spo2 - (minutes * 0.25))
                pred_hr = min(150.0, v.heart_rate + (minutes * 0.6))
                pred_sys = max(80.0, v.systolic - (minutes * 0.5))
                status = "Critical Deterioration"
        elif is_warning:
            pred_spo2 = max(88.0, v.spo2 - (minutes * 0.1))
            pred_hr = min(130.0, v.heart_rate + (minutes * 0.3))
            pred_sys = v.systolic + (minutes * 0.2)
            status = "Unstable Trend"
        else:
            # Stable trend
            pred_spo2 = min(100.0, max(95.0, v.spo2 + random.uniform(-0.5, 0.5)))
            pred_hr = min(100.0, max(60.0, v.heart_rate + random.uniform(-1.0, 1.0)))
            pred_sys = min(140.0, max(100.0, v.systolic + random.uniform(-2.0, 2.0)))
            status = "Stable"
            
        predictions.append(PredictionRecord(
            minutes_ahead=minutes,
            heart_rate=round(pred_hr, 1),
            systolic=round(pred_sys, 1),
            diastolic=round(v.diastolic + (pred_sys - v.systolic)*0.6, 1),
            spo2=round(pred_spo2, 1),
            status=status
        ))
        
    return predictions

def auto_assign_doctor(patient: Patient):
    """
    Finds the best available doctor in the matching ward/specialty and assigns them.
    """
    if patient.assigned_doctor_id:
        return # Already assigned
        
    dept_map = {
        "Severe Sepsis": "Critical Care",
        "Sepsis": "Critical Care",
        "Acute Myocardial Infarction": "Cardiology",
        "Decompensated Heart Failure": "Cardiology",
        "COPD Exacerbation": "Pulmonology",
        "Community-Acquired Pneumonia": "Pulmonology",
        "Acute Stroke": "Neurology"
    }
    
    primary_cond = patient.existing_conditions[0] if patient.existing_conditions else ""
    target_dept = dept_map.get(primary_cond, "Emergency Medicine")
    
    # Find doctors in department
    dept_docs = [d for d in db.doctors.values() if d.department == target_dept and d.status == "Available"]
    if not dept_docs:
        # Fallback to general Critical Care or Emergency
        dept_docs = [d for d in db.doctors.values() if d.status == "Available"]
        
    if dept_docs:
        doc = min(dept_docs, key=lambda x: x.workload)
        doc.workload += 1
        doc.status = "Busy"
        patient.assigned_doctor_id = doc.id
        
        # Add timeline event
        patient.timeline.append(TimelineEvent(
            timestamp=time.time(),
            title="Doctor Auto-Assigned",
            description=f"{doc.name} ({doc.department}) assigned automatically. ETA {doc.eta_minutes} min.",
            status="done"
        ))
        logger.info(f"Assigned Doctor {doc.name} to Patient {patient.name}")

def update_escalation_workflow(patient: Patient):
    """
    Handles Feature 8: Emergency Escalation countdown timer.
    """
    if patient.risk_category != "Critical":
        # Reset escalation state if patient stabilizes
        patient.escalation_status = "None"
        patient.escalation_timer = None
        return
        
    if patient.escalation_status == "None":
        # Set to Pending
        patient.escalation_status = "Pending"
        patient.escalation_timer = 30
        patient.timeline.append(TimelineEvent(
            timestamp=time.time(),
            title="Critical Alert Generated",
            description="Emergency alert broadcasted. Awaiting doctor confirmation.",
            status="active"
        ))
        
    elif patient.escalation_status == "Pending":
        if patient.escalation_timer and patient.escalation_timer > 0:
            patient.escalation_timer -= 3 # updates occur roughly every 3s
        else:
            patient.escalation_status = "Escalated_Senior"
            patient.escalation_timer = 30
            # Get doctor name
            doc_name = "Assigned Doctor"
            if patient.assigned_doctor_id:
                doc_name = db.doctors[patient.assigned_doctor_id].name
            patient.timeline.append(TimelineEvent(
                timestamp=time.time(),
                title="Escalated to Senior Doctor",
                description=f"No response from {doc_name} within 30s. Paging Chief of Critical Care.",
                status="active"
            ))
            
    elif patient.escalation_status == "Escalated_Senior":
        if patient.escalation_timer and patient.escalation_timer > 0:
            patient.escalation_timer -= 3
        else:
            patient.escalation_status = "Escalated_ICU"
            patient.escalation_timer = 30
            patient.timeline.append(TimelineEvent(
                timestamp=time.time(),
                title="Escalated to ICU Team",
                description="Senior doctor response pending. Broadcasting alert to full ICU Nursing Station.",
                status="active"
            ))
            
    elif patient.escalation_status == "Escalated_ICU":
        if patient.escalation_timer and patient.escalation_timer > 0:
            patient.escalation_timer -= 3
        else:
            patient.escalation_status = "Escalated_Emergency"
            patient.escalation_timer = None # Final tier
            patient.timeline.append(TimelineEvent(
                timestamp=time.time(),
                title="Code Blue - Rapid Response",
                description="Critical timeout reached. Emergency Crash Cart Team dispatched to Bed.",
                status="active"
            ))

def generate_patient_alerts(patient: Patient):
    """
    Creates Smart Alerts based on current status and groups them.
    """
    # Check if there is an active alert for this patient
    has_active = any(a.patient_id == patient.id and not a.acknowledged for a in db.alerts)
    
    if patient.risk_category in ["Critical", "High Risk"]:
        if not has_active:
            sev = "CRITICAL" if patient.risk_category == "Critical" else "HIGH RISK"
            alert_msg = f"Patient {patient.name} ({patient.id}) risk score spiked to {patient.risk_score}%. Reason: {patient.risk_reason}."
            new_alert = Alert(
                id=f"A{int(time.time())}{random.randint(10,99)}",
                patient_id=patient.id,
                patient_name=patient.name,
                ward=patient.ward,
                severity=sev,
                message=alert_msg,
                timestamp=time.time()
            )
            db.alerts.append(new_alert)
            # Cap alert feed to last 50 alerts
            if len(db.alerts) > 50:
                db.alerts = db.alerts[-50:]
    elif patient.risk_category == "Warning":
        if not has_active and random.random() > 0.7:  # Avoid alert spam, create warning alerts occasionally
            new_alert = Alert(
                id=f"A{int(time.time())}{random.randint(10,99)}",
                patient_id=patient.id,
                patient_name=patient.name,
                ward=patient.ward,
                severity="WARNING",
                message=f"Observation advised: {patient.name} is showing mild vital fluctuations (Risk: {patient.risk_score}%).",
                timestamp=time.time()
            )
            db.alerts.append(new_alert)

def trigger_demo_scenario(scenario_name: str):
    """
    Overrides the patient states to show specific clinical demo flows.
    """
    logger.info(f"Triggering demo scenario: {scenario_name}")
    
    # Clean up old overrides
    patient_overrides.clear()
    
    # Reset doctors to Available/initial workloads
    for doc in db.doctors.values():
        doc.status = "Available"
        doc.workload = 1
    
    # Helper to reset patient to baseline stable
    def reset_patient_stable(p_id: str, bp: str = "120/80", hr: float = 72.0, spo2: float = 98.0, rr: float = 14.0, temp: float = 36.8):
        p = db.patients[p_id]
        p.vitals.heart_rate = hr
        p.vitals.spo2 = spo2
        p.vitals.respiratory_rate = rr
        p.vitals.temperature = temp
        sys, dia = map(float, bp.split("/"))
        p.vitals.systolic = sys
        p.vitals.diastolic = dia
        p.vitals.timestamp = time.time()
        p.risk_score = 12.0
        p.risk_category = "Stable"
        p.risk_reason = "All monitored vitals are within normal range."
        p.contributing_factors = {}
        p.escalation_status = "None"
        p.escalation_timer = None
        # Reset timeline
        p.timeline = [
            TimelineEvent(timestamp=time.time() - 3600, title="Initial Assessment", description="Vitals stable. Patient under observation.", status="done")
        ]
        p.assigned_doctor_id = None
        
    # Reset key scenario patients first
    reset_patient_stable("P101", bp="115/75", hr=76, spo2=97, rr=16, temp=36.9)
    reset_patient_stable("P102", bp="120/80", hr=72, spo2=98, rr=14, temp=36.8)
    reset_patient_stable("P103", bp="118/76", hr=78, spo2=96, rr=15, temp=36.7)
    reset_patient_stable("P104", bp="130/85", hr=82, spo2=95, rr=18, temp=37.0)
    
    # Acknowledge all active alerts to clear screen for the scenario
    for alert in db.alerts:
        alert.acknowledged = True

    if scenario_name == "stable":
        # Scenario 1: Stable Patient Eleanor (P102)
        patient_overrides["P102"] = "stable"
        # Already set to stable above.
        
    elif scenario_name == "high_risk":
        # Scenario 2: High Risk Patient Sofia (P104)
        patient_overrides["P104"] = "high_risk"
        p = db.patients["P104"]
        p.vitals.heart_rate = 114.0
        p.vitals.spo2 = 92.0
        p.vitals.systolic = 158.0
        p.vitals.diastolic = 95.0
        p.vitals.respiratory_rate = 22.0
        p.vitals.temperature = 37.6
        p.vitals.timestamp = time.time()
        
        # Recalculate immediately
        res = calculate_risk_score(p)
        p.risk_score = res["score"]
        p.risk_category = res["category"]
        p.risk_reason = res["reason"]
        p.contributing_factors = res["factors"]
        p.predictions = generate_digital_twin_predictions(p)
        
        # Trigger Doctor auto-assignment
        auto_assign_doctor(p)
        generate_patient_alerts(p)

    elif scenario_name == "critical":
        # Scenario 3: Critical Patient Marcus (P103)
        patient_overrides["P103"] = "critical"
        p = db.patients["P103"]
        p.vitals.heart_rate = 126.0
        p.vitals.spo2 = 88.0
        p.vitals.systolic = 92.0
        p.vitals.diastolic = 58.0
        p.vitals.respiratory_rate = 29.0
        p.vitals.temperature = 38.4
        p.vitals.timestamp = time.time()
        
        res = calculate_risk_score(p)
        p.risk_score = res["score"]
        p.risk_category = res["category"]
        p.risk_reason = res["reason"]
        p.contributing_factors = res["factors"]
        p.predictions = generate_digital_twin_predictions(p)
        
        auto_assign_doctor(p)
        generate_patient_alerts(p)

    elif scenario_name == "predicted_emergency":
        # Scenario 4: Predicted Emergency Marcus (P103)
        # In this scenario, current vitals look warning or slightly stable (SpO2: 94%, HR: 95)
        # But prediction engine forecasts severe deterioration (15m -> 91%, 30m -> 88%, 60m -> 82%)
        patient_overrides["P103"] = "predicted_emergency"
        p = db.patients["P103"]
        p.vitals.heart_rate = 92.0
        p.vitals.spo2 = 94.0  # Appears near normal
        p.vitals.systolic = 112.0
        p.vitals.diastolic = 72.0
        p.vitals.respiratory_rate = 19.0
        p.vitals.temperature = 37.3
        p.vitals.timestamp = time.time()
        
        res = calculate_risk_score(p)
        # Manually tune risk score to reflect predictive warning
        p.risk_score = 52.0
        p.risk_category = "Warning"
        p.risk_reason = "Predictive Radar Alert: High risk of respiratory decompensation within 30 min."
        p.contributing_factors = {
            "SpO2 Decline (Trend)": 25.0,
            "COPD Core Diagnosis": 15.0,
            "Tachypnea Trend": 12.0
        }
        # Force predictions
        p.predictions = generate_digital_twin_predictions(p)
        generate_patient_alerts(p)

    elif scenario_name == "escalation":
        # Scenario 5: Escalation Workflow Robert (P101)
        patient_overrides["P101"] = "escalation"
        p = db.patients["P101"]
        p.vitals.heart_rate = 132.0
        p.vitals.spo2 = 85.0
        p.vitals.systolic = 85.0
        p.vitals.diastolic = 50.0
        p.vitals.respiratory_rate = 32.0
        p.vitals.temperature = 39.2
        p.vitals.timestamp = time.time()
        
        res = calculate_risk_score(p)
        p.risk_score = res["score"]
        p.risk_category = "Critical"
        p.risk_reason = res["reason"]
        p.contributing_factors = res["factors"]
        p.predictions = generate_digital_twin_predictions(p)
        
        # Trigger Escalation Setup
        p.escalation_status = "None"
        update_escalation_workflow(p) # Sets to Pending, timer=30, appends timeline
        auto_assign_doctor(p)
        generate_patient_alerts(p)


def step_simulation():
    """
    Executes a single tick of the simulation.
    Applies small random fluctuations to stable patients,
    computes scores, auto-assigns doctors, updates escalation workflows,
    and calculates priority rankings.
    """
    current_time = time.time()
    
    # 1. Update patient vitals
    for p_id, p in db.patients.items():
        override = patient_overrides.get(p_id)
        
        if override:
            # Overridden patient vitals drift slowly inside their scenario states
            if override == "stable":
                p.vitals.heart_rate = max(60.0, min(100.0, p.vitals.heart_rate + random.uniform(-0.5, 0.5)))
                p.vitals.spo2 = max(95.0, min(100.0, p.vitals.spo2 + random.uniform(-0.1, 0.1)))
                p.vitals.systolic = max(110.0, min(130.0, p.vitals.systolic + random.uniform(-1.0, 1.0)))
            elif override == "high_risk":
                p.vitals.heart_rate = max(100.0, min(130.0, p.vitals.heart_rate + random.uniform(-1.0, 1.0)))
                p.vitals.spo2 = max(89.0, min(94.0, p.vitals.spo2 + random.uniform(-0.2, 0.2)))
                p.vitals.systolic = max(140.0, min(165.0, p.vitals.systolic + random.uniform(-2.0, 2.0)))
            elif override in ["critical", "escalation"]:
                p.vitals.heart_rate = max(115.0, min(145.0, p.vitals.heart_rate + random.uniform(-1.5, 1.5)))
                p.vitals.spo2 = max(78.0, min(89.0, p.vitals.spo2 + random.uniform(-0.3, 0.3)))
                p.vitals.systolic = max(75.0, min(105.0, p.vitals.systolic + random.uniform(-2.0, 2.0)))
            elif override == "predicted_emergency":
                # Current vitals drift slightly near warning range
                p.vitals.heart_rate = max(88.0, min(98.0, p.vitals.heart_rate + random.uniform(-0.5, 0.5)))
                p.vitals.spo2 = max(93.0, min(95.0, p.vitals.spo2 + random.uniform(-0.2, 0.2)))
                p.vitals.systolic = max(105.0, min(120.0, p.vitals.systolic + random.uniform(-1.0, 1.0)))
        else:
            # Standard random drift for all other non-overridden patients
            # 90% chance to stay stable, 10% chance to drift up or down slightly
            drift_prob = random.random()
            if drift_prob > 0.98: # Patient starts to deteriorate slowly
                p.vitals.heart_rate = min(125.0, p.vitals.heart_rate + random.randint(3, 8))
                p.vitals.spo2 = max(90.0, p.vitals.spo2 - random.uniform(0.5, 1.5))
                p.vitals.respiratory_rate = min(24.0, p.vitals.respiratory_rate + random.randint(1, 3))
            elif drift_prob > 0.95: # Patient improves slightly
                p.vitals.heart_rate = max(65.0, p.vitals.heart_rate - random.randint(2, 5))
                p.vitals.spo2 = min(100.0, p.vitals.spo2 + random.uniform(0.2, 1.0))
            else:
                # Normal stable drift
                p.vitals.heart_rate = max(60.0, min(95.0, p.vitals.heart_rate + random.uniform(-0.5, 0.5)))
                p.vitals.spo2 = max(95.0, min(100.0, p.vitals.spo2 + random.uniform(-0.1, 0.1)))
                p.vitals.systolic = max(105.0, min(135.0, p.vitals.systolic + random.uniform(-1.0, 1.0)))
                p.vitals.temperature = round(max(36.2, min(37.4, p.vitals.temperature + random.uniform(-0.05, 0.05))), 1)
                p.vitals.respiratory_rate = max(12.0, min(19.0, p.vitals.respiratory_rate + random.randint(-1, 1)))

        p.vitals.timestamp = current_time
        
        # Append to history, keeping last 20 records
        p.vitals_history.append(VitalRecord(
            heart_rate=p.vitals.heart_rate,
            systolic=p.vitals.systolic,
            diastolic=p.vitals.diastolic,
            spo2=p.vitals.spo2,
            respiratory_rate=p.vitals.respiratory_rate,
            temperature=p.vitals.temperature,
            timestamp=p.vitals.timestamp
        ))
        if len(p.vitals_history) > 20:
            p.vitals_history = p.vitals_history[-20:]
            
        # Calculate Risk and Explainable Factors
        if not override or override != "predicted_emergency":
            # For predicted emergency, we manually hardcode the risk scoring to simulate the radar warning
            res = calculate_risk_score(p)
            p.risk_score = res["score"]
            p.risk_category = res["category"]
            p.risk_reason = res["reason"]
            p.contributing_factors = res["factors"]
            
        # Generate Digital Twin forecasts
        p.predictions = generate_digital_twin_predictions(p)
        
        # Handle Alerts
        generate_patient_alerts(p)
        
        # Auto Assign doctor if critical/high risk
        if p.risk_category in ["Critical", "High Risk"]:
            auto_assign_doctor(p)
            
        # Update escalation countdowns
        update_escalation_workflow(p)

    # 2. Re-prioritize all patients (Feature 5: Prioritization Engine)
    # Sort patients by risk score (descending), trend severity, and ward priority.
    sorted_patients = sorted(db.patients.values(), key=lambda x: (x.risk_score, 1 if x.ward == "ICU" else 0), reverse=True)
    for index, p in enumerate(sorted_patients):
        p.priority_rank = index + 1
        
    # Update global executive metrics
    # Average response time, active emergency cases count, etc.
    crit_count = sum(1 for p in db.patients.values() if p.risk_category == "Critical")
    high_count = sum(1 for p in db.patients.values() if p.risk_category == "High Risk")
    db.analytics["critical_cases_today"] = 14 + crit_count
    db.analytics["predicted_emergencies"] = 18 + sum(1 for p in db.patients.values() if p.risk_score > 50)
