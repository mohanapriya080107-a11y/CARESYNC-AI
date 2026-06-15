import type { Patient, Doctor, ExecutiveAnalytics, VitalRecord, PredictionRecord, TimelineEvent } from './types';

// Pre-defined doctors
export const initialDoctors: Doctor[] = [
  { id: "D101", name: "Dr. Sarah Jenkins", department: "Critical Care", workload: 2, eta_minutes: 2, status: "Available", phone: "+1 (555) 019-2831" },
  { id: "D102", name: "Dr. Marcus Vance", department: "Cardiology", workload: 4, eta_minutes: 5, status: "Available", phone: "+1 (555) 019-2832" },
  { id: "D103", name: "Dr. Elena Rostova", department: "Pulmonology", workload: 1, eta_minutes: 3, status: "Available", phone: "+1 (555) 019-2833" },
  { id: "D104", name: "Dr. Amit Patel", department: "Emergency Medicine", workload: 3, eta_minutes: 1, status: "Available", phone: "+1 (555) 019-2834" },
  { id: "D105", name: "Dr. Chloe Dubois", department: "Neurology", workload: 2, eta_minutes: 6, status: "Busy", phone: "+1 (555) 019-2835" },
  { id: "D106", name: "Dr. Robert Kim", department: "Critical Care", workload: 3, eta_minutes: 4, status: "Available", phone: "+1 (555) 019-2836" },
];

export const initialAnalytics: ExecutiveAnalytics = {
  avg_response_time: 4.2,
  critical_cases_today: 14,
  lives_saved_today: 9,
  alert_accuracy: 94.6,
  predicted_emergencies: 18,
  ai_recommendations_generated: 142
};

function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function generateInitialPatients(): Patient[] {
  const diagnoses = [
    { diag: "COPD Exacerbation", cond: ["Chronic Bronchitis", "Hypertension"] },
    { diag: "Acute Myocardial Infarction", cond: ["Coronary Artery Disease", "Type 2 Diabetes"] },
    { diag: "Post-Op Coronary Bypass", cond: ["Hypertension", "Hyperlipidemia"] },
    { diag: "Sepsis", cond: ["Kidney Disease", "Diabetes"] },
    { diag: "Community-Acquired Pneumonia", cond: ["Asthma"] },
    { diag: "Decompensated Heart Failure", cond: ["Atrial Fibrillation", "Chronic Kidney Disease"] },
    { diag: "Acute Stroke", cond: ["Hypertension", "Atrial Fibrillation"] },
    { diag: "Diabetic Ketoacidosis", cond: ["Type 1 Diabetes"] },
    { diag: "Post-Op Hip Replacement", cond: ["Osteoarthritis"] },
    { diag: "Asthma Exacerbation", cond: ["Allergies", "GERD"] },
  ];

  const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Elizabeth", "William", "Linda",
    "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen",
    "Christopher", "Nancy", "Daniel", "Lisa", "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra"];

  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
    "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];

  const patients: Patient[] = [];
  const currentTime = Date.now() / 1000;

  for (let i = 1; i <= 100; i++) {
    const seed = i * 4.2;
    const p_id = `P${100 + i}`;

    const firstName = firstNames[Math.floor(seededRandom(seed) * firstNames.length)];
    const lastName = lastNames[Math.floor(seededRandom(seed + 1) * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const age = Math.floor(seededRandom(seed + 2) * 75) + 18;
    const gender = seededRandom(seed + 3) > 0.5 ? "Male" : "Female";

    let ward: 'ICU' | 'Emergency Ward' | 'General Ward' | 'Recovery Ward';
    if (i <= 20) ward = "ICU";
    else if (i <= 45) ward = "Emergency Ward";
    else if (i <= 80) ward = "General Ward";
    else ward = "Recovery Ward";

    const bed_no = `${ward[0]}-${Math.floor(seededRandom(seed + 4) * 90) + 101}`;
    const diagChoice = diagnoses[Math.floor(seededRandom(seed + 5) * diagnoses.length)];
    const existing_conditions = [diagChoice.diag, ...diagChoice.cond];

    const heart_rate = Math.floor(seededRandom(seed + 6) * 20) + 65;
    const systolic = Math.floor(seededRandom(seed + 7) * 20) + 110;
    const diastolic = Math.floor(seededRandom(seed + 8) * 15) + 70;
    const spo2 = Math.floor(seededRandom(seed + 9) * 4) + 96;
    const respiratory_rate = Math.floor(seededRandom(seed + 10) * 6) + 12;
    const temperature = Math.round((seededRandom(seed + 11) * 0.8 + 36.4) * 10) / 10;

    const vitals: VitalRecord = { heart_rate, systolic, diastolic, spo2, respiratory_rate, temperature, timestamp: currentTime };

    const vitals_history: VitalRecord[] = [];
    for (let h = 5; h >= 0; h--) {
      const hTime = currentTime - h * 60;
      const hSeed = seed + h;
      vitals_history.push({
        heart_rate: heart_rate + Math.floor(seededRandom(hSeed) * 6) - 3,
        systolic: systolic + Math.floor(seededRandom(hSeed + 1) * 10) - 5,
        diastolic: diastolic + Math.floor(seededRandom(hSeed + 2) * 6) - 3,
        spo2: Math.min(100, spo2 + Math.floor(seededRandom(hSeed + 3) * 2) - 1),
        respiratory_rate: respiratory_rate + Math.floor(seededRandom(hSeed + 4) * 2) - 1,
        temperature: Math.round((temperature + (seededRandom(hSeed + 5) * 0.4 - 0.2)) * 10) / 10,
        timestamp: hTime
      });
    }

    const timeline: TimelineEvent[] = [
      { timestamp: currentTime - 7200, title: "Patient Admitted", description: `Admitted to ${ward} with diagnosis of ${diagChoice.diag}.`, status: "done" },
      { timestamp: currentTime - 3600, title: "Initial Assessment", description: "Vitals stable. Initial clinical assessment completed.", status: "done" }
    ];

    const p: Patient = {
      id: p_id, name, age, gender, ward, bed_no, existing_conditions,
      vitals, vitals_history,
      risk_score: 0.0, risk_category: "Stable",
      risk_reason: "All vitals within normal parameters.",
      contributing_factors: {},
      assigned_doctor_id: initialDoctors[Math.floor(seededRandom(seed + 12) * initialDoctors.length)].id,
      escalation_status: "None",
      timeline, predictions: [], priority_rank: i
    };
    patients.push(p);
  }

  // Named scenario patients
  const p101 = patients.find(p => p.id === "P101")!;
  p101.name = "Robert Carter"; p101.age = 68; p101.gender = "Male";
  p101.ward = "ICU"; p101.bed_no = "ICU-101";
  p101.existing_conditions = ["Severe Sepsis", "Type 2 Diabetes", "Chronic Kidney Disease"];

  const p102 = patients.find(p => p.id === "P102")!;
  p102.name = "Eleanor Thompson"; p102.age = 54; p102.gender = "Female";
  p102.ward = "Recovery Ward"; p102.bed_no = "REC-102";
  p102.existing_conditions = ["Post-Op Hip Replacement", "Hypertension"];

  const p103 = patients.find(p => p.id === "P103")!;
  p103.name = "Marcus Miller"; p103.age = 75; p103.gender = "Male";
  p103.ward = "Emergency Ward"; p103.bed_no = "ER-103";
  p103.existing_conditions = ["COPD Exacerbation", "Coronary Artery Disease"];

  const p104 = patients.find(p => p.id === "P104")!;
  p104.name = "Sofia Martinez"; p104.age = 62; p104.gender = "Female";
  p104.ward = "General Ward"; p104.bed_no = "GW-104";
  p104.existing_conditions = ["Atrial Fibrillation", "Hypertension", "Hyperlipidemia"];

  return patients;
}

export function localCalculateRisk(patient: Patient): void {
  const v = patient.vitals;
  const conditions = patient.existing_conditions;
  let score = 0;
  const factors: Record<string, number> = {};
  const reasons: string[] = [];

  if (v.spo2 < 90) {
    const penalty = Math.min(80, 55 + (90 - v.spo2) * 3);
    factors["SpO2 Drop"] = Math.round(penalty);
    score += penalty;
    reasons.push(`Severe hypoxemia (SpO2: ${v.spo2}%)`);
  } else if (v.spo2 < 95) {
    const penalty = 15 + (95 - v.spo2) * 6;
    factors["SpO2 Decline"] = Math.round(penalty);
    score += penalty;
    reasons.push(`Moderate hypoxemia (SpO2: ${v.spo2}%)`);
  }

  if (v.heart_rate > 120) {
    const penalty = Math.min(40, 25 + (v.heart_rate - 120) * 0.8);
    factors["Tachycardia Spike"] = Math.round(penalty);
    score += penalty;
    reasons.push(`Severe tachycardia (HR: ${Math.round(v.heart_rate)} bpm)`);
  } else if (v.heart_rate > 100) {
    const penalty = 10 + (v.heart_rate - 100) * 0.7;
    factors["Elevated Heart Rate"] = Math.round(penalty);
    score += penalty;
    reasons.push(`Mild tachycardia (HR: ${Math.round(v.heart_rate)} bpm)`);
  } else if (v.heart_rate < 50) {
    const penalty = Math.min(30, 15 + (50 - v.heart_rate));
    factors["Bradycardia"] = Math.round(penalty);
    score += penalty;
    reasons.push(`Bradycardia (HR: ${Math.round(v.heart_rate)} bpm)`);
  }

  if (v.respiratory_rate > 28) {
    const penalty = Math.min(50, 30 + (v.respiratory_rate - 28) * 1.5);
    factors["Severe Tachypnea"] = Math.round(penalty);
    score += penalty;
    reasons.push(`Severe tachypnea (RR: ${Math.round(v.respiratory_rate)} breaths/min)`);
  } else if (v.respiratory_rate > 20) {
    const penalty = 10 + (v.respiratory_rate - 20) * 1.5;
    factors["Tachypnea"] = Math.round(penalty);
    score += penalty;
    reasons.push(`Elevated breathing rate (RR: ${Math.round(v.respiratory_rate)} breaths/min)`);
  }

  if (v.temperature > 38.5) {
    const penalty = Math.min(35, 12 + (v.temperature - 38.5) * 8);
    factors["Hyperthermia (Fever)"] = Math.round(penalty);
    score += penalty;
    reasons.push(`High fever (Temp: ${v.temperature}°C)`);
  }

  if (v.systolic < 90) {
    const penalty = Math.min(45, 25 + (90 - v.systolic));
    factors["Hypotension (Low BP)"] = Math.round(penalty);
    score += penalty;
    reasons.push(`Severe hypotension (SBP: ${Math.round(v.systolic)} mmHg)`);
  } else if (v.systolic > 160) {
    factors["Hypertensive Urgency"] = 15;
    score += 15;
    reasons.push(`Hypertension (SBP: ${Math.round(v.systolic)} mmHg)`);
  }

  if (patient.age > 75) { factors["Advanced Age Factor"] = 12; score += 12; }
  else if (patient.age > 65) { factors["Age Factor"] = 6; score += 6; }

  const highRiskConditions = ["Sepsis", "Severe Sepsis", "Acute Myocardial Infarction", "Decompensated Heart Failure"];
  if (conditions.some(c => highRiskConditions.includes(c))) {
    factors["Comorbidity Risk"] = 15; score += 15;
  } else if (conditions.length >= 2) {
    factors["Multiple Comorbidities"] = 8; score += 8;
  }

  score = Math.min(100, Math.max(0, score));
  patient.risk_score = Math.round(score * 10) / 10;
  patient.contributing_factors = factors;

  if (score >= 85) patient.risk_category = "Critical";
  else if (score >= 60) patient.risk_category = "High Risk";
  else if (score >= 35) patient.risk_category = "Warning";
  else patient.risk_category = "Stable";

  patient.risk_reason = reasons.length > 0 ? reasons.slice(0, 3).join(" + ") : "All monitored vitals are within normal range.";
}

export function localGeneratePredictions(patient: Patient, override?: string): void {
  const v = patient.vitals;
  const scenariosWithDet = ["critical", "escalation"];
  const isDeteriorating = scenariosWithDet.includes(override ?? '') || override === "predicted_emergency" || patient.risk_category === "Critical";
  const isWarning = override === "high_risk" || patient.risk_category === "High Risk";

  const predictions: PredictionRecord[] = [];

  for (const minutes of [15, 30, 60]) {
    let pred_spo2: number, pred_hr: number, pred_sys: number, status: string;

    if (isDeteriorating) {
      if (patient.id === "P103" || override === "predicted_emergency") {
        if (patient.id === "P103") {
          if (minutes === 15) pred_spo2 = 91;
          else if (minutes === 30) pred_spo2 = 88;
          else pred_spo2 = 82;
        } else {
          pred_spo2 = Math.max(80, v.spo2 - minutes * 0.2);
        }
        pred_hr = v.heart_rate + minutes * 0.5;
        pred_sys = Math.max(90, v.systolic - minutes * 0.4);
        status = minutes >= 30 ? "Likely Critical" : "Deteriorating";
      } else {
        pred_spo2 = Math.max(75, v.spo2 - minutes * 0.25);
        pred_hr = Math.min(150, v.heart_rate + minutes * 0.6);
        pred_sys = Math.max(80, v.systolic - minutes * 0.5);
        status = "Critical Deterioration";
      }
    } else if (isWarning) {
      pred_spo2 = Math.max(88, v.spo2 - minutes * 0.1);
      pred_hr = Math.min(130, v.heart_rate + minutes * 0.3);
      pred_sys = v.systolic + minutes * 0.2;
      status = "Unstable Trend";
    } else {
      pred_spo2 = Math.min(100, Math.max(95, v.spo2 + (Math.random() - 0.5)));
      pred_hr = Math.min(100, Math.max(60, v.heart_rate + (Math.random() * 2 - 1)));
      pred_sys = Math.min(140, Math.max(100, v.systolic + (Math.random() * 4 - 2)));
      status = "Stable";
    }

    predictions.push({
      minutes_ahead: minutes,
      heart_rate: Math.round(pred_hr * 10) / 10,
      systolic: Math.round(pred_sys * 10) / 10,
      diastolic: Math.round((v.diastolic + (pred_sys - v.systolic) * 0.6) * 10) / 10,
      spo2: Math.round(pred_spo2 * 10) / 10,
      status
    });
  }

  patient.predictions = predictions;
}
