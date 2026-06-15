import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Patient, Doctor, Alert, ExecutiveAnalytics } from '../types';
import { 
  generateInitialPatients, 
  initialDoctors, 
  initialAnalytics, 
  localCalculateRisk, 
  localGeneratePredictions 
} from '../mockData';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

interface DataContextType {
  patients: Patient[];
  doctors: Doctor[];
  alerts: Alert[];
  analytics: ExecutiveAnalytics;
  isBackendConnected: boolean;
  activeScenario: string | null;
  selectedWard: string | null;
  setSelectedWard: (ward: string | null) => void;
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
  handleSelectScenario: (scenario: string) => Promise<void>;
  handleAcknowledgeAlert: (alertId: string) => Promise<void>;
  handleFetchCopilot: (patientId: string) => Promise<any>;
  handleFetchFamily: (patientId: string) => Promise<string>;
  handleSendMessage: (msg: string) => Promise<string>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const syncToSupabase = async (pList: Patient[], dList: Doctor[], aList: Alert[], analyticsObj: ExecutiveAnalytics) => {
  if (!supabase) return;
  try {
    if (dList.length > 0) {
      await supabase.from('doctors').upsert(dList.map(d => ({
        id: d.id,
        name: d.name,
        department: d.department,
        workload: d.workload,
        eta_minutes: d.eta_minutes,
        status: d.status,
        phone: d.phone
      })));
    }
    if (pList.length > 0) {
      await supabase.from('patients').upsert(pList.map(p => ({
        id: p.id,
        name: p.name,
        age: p.age,
        gender: p.gender,
        ward: p.ward,
        bed_no: p.bed_no,
        existing_conditions: p.existing_conditions,
        vitals: p.vitals,
        vitals_history: p.vitals_history,
        risk_score: p.risk_score,
        risk_category: p.risk_category,
        risk_reason: p.risk_reason,
        contributing_factors: p.contributing_factors,
        assigned_doctor_id: p.assigned_doctor_id || null,
        escalation_status: p.escalation_status,
        escalation_timer: p.escalation_timer !== undefined ? p.escalation_timer : null,
        timeline: p.timeline,
        predictions: p.predictions,
        priority_rank: p.priority_rank
      })));
    }
    if (aList.length > 0) {
      await supabase.from('alerts').upsert(aList.map(a => ({
        id: a.id,
        patient_id: a.patient_id,
        patient_name: a.patient_name,
        ward: a.ward,
        severity: a.severity,
        message: a.message,
        timestamp: a.timestamp,
        acknowledged: a.acknowledged
      })));
    }
    await supabase.from('analytics').upsert({
      key: 'metrics',
      value: analyticsObj
    });
    console.log("CareSync AI: Successfully synced local sandbox state to Supabase.");
  } catch (err) {
    console.error("CareSync AI: Error syncing state to Supabase:", err);
  }
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [analytics, setAnalytics] = useState<ExecutiveAnalytics>(initialAnalytics);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [selectedWard, setSelectedWard] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          console.log("CareSync AI: Fetching initial data from Supabase...");
          const { data: doctorsData, error: docError } = await supabase.from('doctors').select('*');
          const { data: patientsData, error: patError } = await supabase.from('patients').select('*');
          const { data: alertsData, error: alertError } = await supabase.from('alerts').select('*');
          const { data: analyticsData, error: anaError } = await supabase.from('analytics').select('*').eq('key', 'metrics').single();

          if (docError || patError || alertError || (anaError && anaError.code !== 'PGRST116')) {
            console.error("CareSync AI: Error loading initial data from Supabase, falling back to local simulation:", { docError, patError, alertError, anaError });
            loadLocalFallback();
            return;
          }

          if (!patientsData || patientsData.length === 0) {
            console.log("CareSync AI: Supabase is empty. Seeding initial data from frontend...");
            const initialPatients = generateInitialPatients();
            initialPatients.forEach(p => {
              localCalculateRisk(p);
              localGeneratePredictions(p);
            });
            await syncToSupabase(initialPatients, initialDoctors, [], initialAnalytics);
            setPatients(initialPatients);
            setDoctors(initialDoctors);
            setAlerts([]);
            setAnalytics(initialAnalytics);
          } else {
            setDoctors(doctorsData as Doctor[]);
            const formattedPatients = (patientsData as any[]).map(p => ({
              ...p,
            })).sort((a, b) => a.priority_rank - b.priority_rank);
            setPatients(formattedPatients as Patient[]);
            const formattedAlerts = (alertsData as Alert[]).sort((a, b) => b.timestamp - a.timestamp);
            setAlerts(formattedAlerts);
            if (analyticsData && analyticsData.value) {
              setAnalytics(analyticsData.value as ExecutiveAnalytics);
            } else {
              setAnalytics(initialAnalytics);
            }
            console.log("CareSync AI: Loaded state from Supabase successfully.");
          }
        } catch (err) {
          console.error("CareSync AI: Exception loading from Supabase, using local fallback:", err);
          loadLocalFallback();
        }
      } else {
        loadLocalFallback();
      }
    };

    const loadLocalFallback = () => {
      console.log("CareSync AI: Loading local mock data...");
      const initial = generateInitialPatients();
      initial.forEach(p => {
        localCalculateRisk(p);
        localGeneratePredictions(p);
      });
      setPatients(initial);
      setDoctors(initialDoctors);
      setAnalytics(initialAnalytics);
    };

    initializeData();
  }, []);

  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout>;
    const connectWebSocket = () => {
      console.log("CareSync AI: Attempting WebSocket connection to FastAPI...");
      const ws = new WebSocket('ws://localhost:8000/ws');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("CareSync AI: WebSocket connection established.");
        setIsBackendConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.patients) setPatients(payload.patients);
          if (payload.doctors) setDoctors(payload.doctors);
          if (payload.alerts) setAlerts(payload.alerts);
          if (payload.analytics) setAnalytics(payload.analytics);
        } catch (err) {
          console.error("Error parsing WebSocket JSON payload:", err);
        }
      };

      ws.onclose = () => {
        console.log("CareSync AI: WebSocket disconnected. Switching to local sandbox simulation.");
        setIsBackendConnected(false);
        reconnectTimer = setTimeout(connectWebSocket, 6000);
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        ws.close();
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close();
      clearTimeout(reconnectTimer);
    };
  }, []);

  useEffect(() => {
    if (isBackendConnected) return;

    const localSimInterval = setInterval(() => {
      if (patients.length === 0) return;

      const updated = patients.map(p => {
        const newPatient = { ...p };
        const pOverride = activeScenario && (
          (activeScenario === 'stable' && p.id === 'P102') ||
          (activeScenario === 'high_risk' && p.id === 'P104') ||
          (activeScenario === 'critical' && p.id === 'P103') ||
          (activeScenario === 'predicted_emergency' && p.id === 'P103') ||
          (activeScenario === 'escalation' && p.id === 'P101')
        );

        const vitals = { ...newPatient.vitals };
        if (pOverride) {
          if (activeScenario === 'stable') {
            vitals.heart_rate = Math.max(60, Math.min(100, vitals.heart_rate + (Math.random() - 0.5)));
            vitals.spo2 = Math.max(95, Math.min(100, vitals.spo2 + (Math.random() * 0.2 - 0.1)));
            vitals.systolic = Math.max(110, Math.min(130, vitals.systolic + (Math.random() - 0.5)));
          } else if (activeScenario === 'high_risk') {
            vitals.heart_rate = Math.max(100, Math.min(130, vitals.heart_rate + (Math.random() * 2 - 1)));
            vitals.spo2 = Math.max(89, Math.min(94, vitals.spo2 + (Math.random() * 0.4 - 0.2)));
            vitals.systolic = Math.max(140, Math.min(165, vitals.systolic + (Math.random() * 3 - 1.5)));
          } else if (activeScenario === 'critical' || activeScenario === 'escalation') {
            vitals.heart_rate = Math.max(115, Math.min(145, vitals.heart_rate + (Math.random() * 3 - 1.5)));
            vitals.spo2 = Math.max(78, Math.min(89, vitals.spo2 + (Math.random() * 0.6 - 0.3)));
            vitals.systolic = Math.max(75, Math.min(105, vitals.systolic + (Math.random() * 4 - 2)));
          } else if (activeScenario === 'predicted_emergency') {
            vitals.heart_rate = Math.max(88, Math.min(98, vitals.heart_rate + (Math.random() - 0.5)));
            vitals.spo2 = Math.max(93, Math.min(95, vitals.spo2 + (Math.random() * 0.4 - 0.2)));
          }
        } else {
          const prob = Math.random();
          if (prob > 0.985) {
            vitals.heart_rate = Math.min(125, vitals.heart_rate + Math.floor(Math.random() * 5) + 3);
            vitals.spo2 = Math.max(90, vitals.spo2 - Math.random() * 1.5);
          } else if (prob > 0.96) {
            vitals.heart_rate = Math.max(65, vitals.heart_rate - Math.floor(Math.random() * 3) - 2);
            vitals.spo2 = Math.min(100, vitals.spo2 + Math.random());
          } else {
            vitals.heart_rate = Math.max(60, Math.min(95, vitals.heart_rate + (Math.random() - 0.5)));
            vitals.spo2 = Math.max(95, Math.min(100, vitals.spo2 + (Math.random() * 0.2 - 0.1)));
            vitals.systolic = Math.max(105, Math.min(135, vitals.systolic + (Math.random() - 0.5)));
          }
        }
        
        newPatient.vitals = vitals;
        const history = [...newPatient.vitals_history, vitals];
        newPatient.vitals_history = history.slice(-20);

        if (activeScenario === 'predicted_emergency' && p.id === 'P103') {
          newPatient.risk_score = 52.0;
          newPatient.risk_category = "Warning";
          newPatient.risk_reason = "Predictive Radar Alert: High risk of respiratory decompensation within 30 min.";
          newPatient.contributing_factors = {
            "SpO2 Decline (Trend)": 25.0,
            "COPD Core Diagnosis": 15.0,
            "Tachypnea Trend": 12.0
          };
        } else {
          localCalculateRisk(newPatient);
        }
        localGeneratePredictions(newPatient, activeScenario && p.id === (activeScenario === 'escalation' ? 'P101' : activeScenario === 'high_risk' ? 'P104' : 'P103') ? activeScenario : undefined);

        if (activeScenario === 'escalation' && p.id === 'P101') {
          if (newPatient.escalation_status === "None") {
            newPatient.escalation_status = "Pending";
            newPatient.escalation_timer = 30;
            newPatient.timeline = [
              ...newPatient.timeline,
              { timestamp: Date.now()/1000, title: "Critical Alert Generated", description: "Emergency alert broadcasted. Awaiting doctor confirmation.", status: "active" }
            ];
          } else if (newPatient.escalation_status === "Pending") {
            if (newPatient.escalation_timer && newPatient.escalation_timer > 0) {
              newPatient.escalation_timer -= 3;
            } else {
              newPatient.escalation_status = "Escalated_Senior";
              newPatient.escalation_timer = 30;
              newPatient.timeline = [
                ...newPatient.timeline,
                { timestamp: Date.now()/1000, title: "Escalated to Senior Doctor", description: "No response from Dr. Jenkins. Paging Chief of Critical Care.", status: "active" }
              ];
            }
          } else if (newPatient.escalation_status === "Escalated_Senior") {
            if (newPatient.escalation_timer && newPatient.escalation_timer > 0) {
              newPatient.escalation_timer -= 3;
            } else {
              newPatient.escalation_status = "Escalated_ICU";
              newPatient.escalation_timer = 30;
              newPatient.timeline = [
                ...newPatient.timeline,
                { timestamp: Date.now()/1000, title: "Escalated to ICU Team", description: "Broadcasting alert to full ICU Nursing Station.", status: "active" }
              ];
            }
          } else if (newPatient.escalation_status === "Escalated_ICU") {
            if (newPatient.escalation_timer && newPatient.escalation_timer > 0) {
              newPatient.escalation_timer -= 3;
            } else {
              newPatient.escalation_status = "Escalated_Emergency";
              newPatient.escalation_timer = undefined;
              newPatient.timeline = [
                ...newPatient.timeline,
                { timestamp: Date.now()/1000, title: "Code Blue - Rapid Response", description: "Emergency Crash Cart Team dispatched to Bed.", status: "active" }
              ];
            }
          }
        }

        return newPatient;
      });

      let newAlertsList = [...alerts];
      updated.forEach(p => {
        if (p.risk_category === "Critical" || p.risk_category === "High Risk") {
          const hasAlert = newAlertsList.some(a => a.patient_id === p.id && !a.acknowledged);
          if (!hasAlert) {
            const newAlert: Alert = {
              id: `A${Math.floor(Date.now()/1000)}${Math.floor(Math.random()*90)+10}`,
              patient_id: p.id,
              patient_name: p.name,
              ward: p.ward,
              severity: p.risk_category === "Critical" ? "CRITICAL" : "HIGH RISK",
              message: `Patient ${p.name} risk score spiked to ${p.risk_score}%. Reason: ${p.risk_reason}.`,
              timestamp: Date.now()/1000,
              acknowledged: false
            };
            newAlertsList = [newAlert, ...newAlertsList].slice(0, 50);
          }
        }
      });

      const sorted = [...updated].sort((a, b) => b.risk_score - a.risk_score);
      sorted.forEach((p, idx) => {
        p.priority_rank = idx + 1;
      });

      const criticalCount = sorted.filter(p => p.risk_category === 'Critical').length;
      const newAnalytics = {
        ...analytics,
        critical_cases_today: 14 + criticalCount,
        predicted_emergencies: 18 + sorted.filter(p => p.risk_score > 50).length
      };

      setPatients(sorted);
      setAlerts(newAlertsList);
      setAnalytics(newAnalytics);

      if (isSupabaseConfigured) {
        syncToSupabase(sorted, doctors, newAlertsList, newAnalytics);
      }
    }, 3000);

    return () => clearInterval(localSimInterval);
  }, [isBackendConnected, activeScenario, patients, alerts, doctors, analytics]);

  const handleSelectScenario = async (scenario: string) => {
    setActiveScenario(scenario);
    if (isBackendConnected) {
      try {
        await fetch(`http://localhost:8000/api/scenarios/${scenario}`, { method: 'POST' });
      } catch (err) {
        console.error("API error triggering scenario:", err);
      }
    } else {
      const nextAlerts = alerts.map(a => ({ ...a, acknowledged: true }));
      setAlerts(nextAlerts);
      
      const initial = generateInitialPatients();
      initial.forEach(p => {
        localCalculateRisk(p);
        localGeneratePredictions(p);
      });

      if (scenario === 'stable') {
        const p102 = initial.find(p => p.id === 'P102')!;
        p102.vitals = { heart_rate: 72, systolic: 120, diastolic: 80, spo2: 98, respiratory_rate: 14, temperature: 36.8, timestamp: Date.now()/1000 };
        localCalculateRisk(p102);
      } else if (scenario === 'high_risk') {
        const p104 = initial.find(p => p.id === 'P104')!;
        p104.vitals = { heart_rate: 114, systolic: 158, diastolic: 95, spo2: 92, respiratory_rate: 22, temperature: 37.6, timestamp: Date.now()/1000 };
        p104.assigned_doctor_id = 'D102';
        localCalculateRisk(p104);
        localGeneratePredictions(p104, 'high_risk');
      } else if (scenario === 'critical') {
        const p103 = initial.find(p => p.id === 'P103')!;
        p103.vitals = { heart_rate: 126, systolic: 92, diastolic: 58, spo2: 88, respiratory_rate: 29, temperature: 38.4, timestamp: Date.now()/1000 };
        p103.assigned_doctor_id = 'D103';
        localCalculateRisk(p103);
        localGeneratePredictions(p103, 'critical');
      } else if (scenario === 'predicted_emergency') {
        const p103 = initial.find(p => p.id === 'P103')!;
        p103.vitals = { heart_rate: 92, systolic: 112, diastolic: 72, spo2: 94, respiratory_rate: 19, temperature: 37.3, timestamp: Date.now()/1000 };
        p103.risk_score = 52.0;
        p103.risk_category = "Warning";
        p103.risk_reason = "Predictive Radar Alert: High risk of respiratory decompensation within 30 min.";
        p103.contributing_factors = { "SpO2 Decline (Trend)": 25.0, "COPD Core Diagnosis": 15.0 };
        localGeneratePredictions(p103, 'predicted_emergency');
      } else if (scenario === 'escalation') {
        const p101 = initial.find(p => p.id === 'P101')!;
        p101.vitals = { heart_rate: 132, systolic: 85, diastolic: 50, spo2: 85, respiratory_rate: 32, temperature: 39.2, timestamp: Date.now()/1000 };
        p101.assigned_doctor_id = 'D101';
        p101.risk_score = 96.0;
        p101.risk_category = "Critical";
        p101.risk_reason = "Severe Septic Shock + profound acidosis";
        p101.contributing_factors = { "SpO2 Drop": 40.0, "Sepsis Shock": 30.0, "High Temp": 15.0 };
        p101.escalation_status = 'Pending';
        p101.escalation_timer = 30;
        p101.timeline = [
          ...p101.timeline,
          { timestamp: Date.now()/1000, title: "Critical Alert Generated", description: "Emergency alert broadcasted. Awaiting doctor confirmation.", status: "active" }
        ];
        localGeneratePredictions(p101, 'escalation');
      }

      const sorted = [...initial].sort((a, b) => b.risk_score - a.risk_score);
      sorted.forEach((p, idx) => { p.priority_rank = idx + 1; });
      setPatients(sorted);

      if (isSupabaseConfigured) {
        syncToSupabase(sorted, doctors, nextAlerts, analytics);
      }
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    if (isBackendConnected) {
      try {
        await fetch(`http://localhost:8000/api/alerts/${alertId}/acknowledge`, { method: 'POST' });
      } catch (err) {
        console.error("API error acknowledging alert:", err);
      }
    } else {
      const nextAlerts = alerts.map(a => a.id === alertId ? { ...a, acknowledged: true } : a);
      setAlerts(nextAlerts);
      const targetAlert = alerts.find(a => a.id === alertId);
      if (targetAlert) {
        const nextPatients = patients.map(p => {
          if (p.id === targetAlert.patient_id) {
            return {
              ...p,
              escalation_status: 'None' as const,
              escalation_timer: undefined,
              timeline: [
                ...p.timeline,
                { timestamp: Date.now()/1000, title: "Alert Acknowledged", description: "Dr. Sarah Jenkins confirmed attendance. Resuscitation protocol active.", status: "done" as const },
                { timestamp: Date.now()/1000 + 5, title: "Condition Stabilized", description: "Vitals normalized under clinical intervention.", status: "done" as const }
              ]
            };
          }
          return p;
        });
        setPatients(nextPatients);
        if (isSupabaseConfigured) {
          syncToSupabase(nextPatients, doctors, nextAlerts, analytics);
        }
      } else {
        if (isSupabaseConfigured) {
          syncToSupabase(patients, doctors, nextAlerts, analytics);
        }
      }
    }
  };

  const handleFetchCopilot = async (patientId: string) => {
    if (isBackendConnected) {
      try {
        const res = await fetch(`http://localhost:8000/api/copilot/${patientId}`, { method: 'POST' });
        return await res.json();
      } catch (err) {
        console.error("API Error fetching copilot support:", err);
      }
    }

    const offlineCopilotTemplates: Record<string, any> = {
      "P101": {
        likely_condition: "Severe Septic Shock & Acute Kidney Injury",
        probable_cause: "Systemic bacterial infection leading to profound vasodilation, microvascular hypoperfusion, and secondary organ failure (renal dysfunction).",
        urgency_level: "CRITICAL",
        suggested_actions: [
          "Initiate aggressive fluid resuscitation (30 mL/kg crystalloids immediately).",
          "Administer broad-spectrum IV antibiotics (e.g., Piperacillin/Tazobactam) within 1 hour.",
          "Start vasopressor support (Norepinephrine first-line) to maintain MAP > 65 mmHg.",
          "Insert Foley catheter to monitor hourly urine output; draw serial lactate levels."
        ]
      },
      "P103": {
        likely_condition: "Acute Hypercapnic Respiratory Failure",
        probable_cause: "Severe COPD Exacerbation with ventilation-perfusion mismatch and acute respiratory acidosis due to airway obstruction.",
        urgency_level: "CRITICAL",
        suggested_actions: [
          "Apply Non-Invasive Positive Pressure Ventilation (BiPAP) with titrated FiO2 to maintain SpO2 88-92%.",
          "Administer nebulized Short-Acting Beta-Agonists (Albuterol) and Anticholinergics.",
          "Give IV corticosteroids (Methylprednisolone 40mg) and initiate empiric antibiotics.",
          "Prepare for rapid sequence intubation if mental status deteriorates."
        ]
      },
      "P104": {
        likely_condition: "Acute Coronary Syndrome or Paroxysmal AFib with Rapid Ventricular Response",
        probable_cause: "Myocardial ischemia or tachycardia-induced cardiomyopathy due to uncontrolled atrial fibrillation, exacerbating hypertension.",
        urgency_level: "HIGH RISK",
        suggested_actions: [
          "Perform immediate 12-lead ECG and obtain stat serial Troponin levels.",
          "Initiate rate control therapy (e.g., IV Metoprolol or Diltiazem) if hemodynamically stable.",
          "Administer supplemental oxygen if SpO2 < 90% and initiate aspirin 324mg PO.",
          "Establish continuous cardiac telemetry monitoring and prepare for echocardiogram."
        ]
      }
    };
    return offlineCopilotTemplates[patientId] || {
      likely_condition: "Acute Cardiopulmonary Deterioration",
      probable_cause: "Impaired oxygenation or circulatory insufficiency secondary to physiological stress.",
      urgency_level: "HIGH RISK",
      suggested_actions: [
        "Perform bedside clinical assessment and obtain immediate manual vital signs.",
        "Apply supplemental oxygen and check airway patency.",
        "Verify intravenous access and draw emergency labs.",
        "Notify the attending physician and the Rapid Response Team (RRT)."
      ]
    };
  };

  const handleFetchFamily = async (patientId: string) => {
    if (isBackendConnected) {
      try {
        const res = await fetch(`http://localhost:8000/api/family/${patientId}`, { method: 'POST' });
        const data = await res.json();
        return data.family_update;
      } catch (err) {
        console.error("API error generating family explanation:", err);
      }
    }

    const offlineFamilyTemplates: Record<string, string> = {
      "P101": "Robert is currently in our Intensive Care Unit receiving comprehensive treatment for a severe infection. Our specialized team is actively managing his blood pressure and supporting his kidney function with fluids and medications. He is being monitored continuously, and we are working to stabilize his condition.",
      "P102": "Eleanor is doing very well after her hip surgery. Her vital signs are stable, and she is resting comfortably. The nursing staff is monitoring her pain levels and encouraging her to rest. We expect her to begin gentle physical therapy soon.",
      "P103": "Marcus is experiencing a temporary flare-up of his chronic lung condition (COPD), which has caused his oxygen levels to decrease. We have placed him on a breathing support mask (BiPAP) to help him breathe more easily and have given him medications to open up his airways. We are monitoring his response closely.",
      "P104": "Sofia is being monitored closely in our general ward due to an irregular heart rhythm and elevated blood pressure. We are conducting tests, including heart traces and blood work, to determine the cause and have started medications to help regulate her heart rate."
    };
    return offlineFamilyTemplates[patientId] || "The patient is resting comfortably. All clinical vitals are currently stable and under continuous telemetry observation. We will update you immediately of any changes.";
  };

  const handleSendMessage = async (msg: string): Promise<string> => {
    if (isBackendConnected) {
      const res = await fetch(`http://localhost:8000/api/nurse/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      });
      const data = await res.json();
      return data.response;
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const q = msg.toLowerCase();
        if (q.includes("highest") || q.includes("priority 1") || q.includes("worst")) {
          const top = patients[0];
          resolve(`The highest-risk patient currently is **${top?.name}** (Bed ${top?.bed_no}, ${top?.ward}) with a risk score of **${top?.risk_score}%** (${top?.risk_category}) due to *${top?.risk_reason}*.`);
        } else if (q.includes("p101") || q.includes("robert")) {
          resolve(`**Robert Carter (P101)** is in critical condition (**${patients.find(p=>p.id==='P101')?.risk_score}%** risk) due to severe sepsis. Vitals reflect tachycardia and hypoxemia. Level 1 escalation is pending confirmation.`);
        } else if (q.includes("p103") || q.includes("marcus")) {
          const p103 = patients.find(p=>p.id==='P103');
          resolve(`**Marcus Miller (P103)** is currently under **${p103?.risk_category}** status. The Digital Twin forecasts a decline in SpO2 to **82%** in the next 60m unless clinical breathing support (BiPAP) is initiated.`);
        } else if (q.includes("alert") || q.includes("warning")) {
          const active = alerts.filter(a => !a.acknowledged);
          resolve(`Current Active Alerts: **${active.length}**. Critical active cases: ${patients.filter(p=>p.risk_category==='Critical').length} (Robert Carter, Marcus Miller under scenarios).`);
        } else if (q.includes("predict") || q.includes("emergency") || q.includes("radar")) {
          resolve(`**Predictive Emergency Radar Warning:** Robert Carter (P101) reflects high code probability. Marcus Miller (P103) shows a high-risk respiratory trajectory within 35 minutes.`);
        } else {
          resolve("I am the CareSync AI command assistant. Try asking: 'Who is the highest-risk patient?', 'Why is patient P101 critical?', or 'Show active alerts'.");
        }
      }, 800);
    });
  };

  return (
    <DataContext.Provider value={{
      patients,
      doctors,
      alerts,
      analytics,
      isBackendConnected,
      activeScenario,
      selectedWard,
      setSelectedWard,
      selectedPatientId,
      setSelectedPatientId,
      handleSelectScenario,
      handleAcknowledgeAlert,
      handleFetchCopilot,
      handleFetchFamily,
      handleSendMessage
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
