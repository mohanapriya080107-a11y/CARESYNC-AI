export interface VitalRecord {
  heart_rate: number;
  systolic: number;
  diastolic: number;
  spo2: number;
  respiratory_rate: number;
  temperature: number;
  timestamp: number;
}

export interface PredictionRecord {
  minutes_ahead: number;
  heart_rate: number;
  systolic: number;
  diastolic: number;
  spo2: number;
  status: string;
}

export interface TimelineEvent {
  timestamp: number;
  title: string;
  description: string;
  status: 'done' | 'pending' | 'active';
}

export interface Doctor {
  id: string;
  name: string;
  department: string;
  workload: number;
  eta_minutes: number;
  status: 'Available' | 'Busy';
  phone: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  ward: 'ICU' | 'Emergency Ward' | 'General Ward' | 'Recovery Ward';
  bed_no: string;
  existing_conditions: string[];
  vitals: VitalRecord;
  vitals_history: VitalRecord[];
  risk_score: number;
  risk_category: 'Stable' | 'Warning' | 'High Risk' | 'Critical';
  risk_reason: string;
  contributing_factors: Record<string, number>;
  assigned_doctor_id?: string;
  escalation_status: 'None' | 'Pending' | 'Escalated_Senior' | 'Escalated_ICU' | 'Escalated_Emergency';
  escalation_timer?: number; // seconds remaining
  timeline: TimelineEvent[];
  predictions: PredictionRecord[];
  priority_rank: number;
}

export interface Alert {
  id: string;
  patient_id: string;
  patient_name: string;
  ward: string;
  severity: 'INFO' | 'WARNING' | 'HIGH RISK' | 'CRITICAL';
  message: string;
  timestamp: number;
  acknowledged: boolean;
}

export interface ExecutiveAnalytics {
  avg_response_time: number;
  critical_cases_today: number;
  lives_saved_today: number;
  alert_accuracy: number;
  predicted_emergencies: number;
  ai_recommendations_generated: number;
}

export interface HospitalState {
  patients: Patient[];
  doctors: Doctor[];
  alerts: Alert[];
  analytics: ExecutiveAnalytics;
}
