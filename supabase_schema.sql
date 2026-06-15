-- SQL SCHEMA FOR CARESYNC AI (Supabase Integration)
-- Run this in your Supabase SQL Editor to initialize the database tables.

-- Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS analytics;

-- Create doctors table
CREATE TABLE doctors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    workload INTEGER NOT NULL DEFAULT 0,
    eta_minutes INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Available',
    phone TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create patients table
CREATE TABLE patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL,
    ward TEXT NOT NULL,
    bed_no TEXT NOT NULL,
    existing_conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
    vitals JSONB NOT NULL,
    vitals_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    risk_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    risk_category TEXT NOT NULL DEFAULT 'Stable',
    risk_reason TEXT NOT NULL DEFAULT 'All vitals within normal parameters.',
    contributing_factors JSONB NOT NULL DEFAULT '{}'::jsonb,
    assigned_doctor_id TEXT REFERENCES doctors(id) ON DELETE SET NULL,
    escalation_status TEXT NOT NULL DEFAULT 'None',
    escalation_timer INTEGER,
    timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
    predictions JSONB NOT NULL DEFAULT '[]'::jsonb,
    priority_rank INTEGER NOT NULL DEFAULT 100,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create alerts table
CREATE TABLE alerts (
    id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES patients(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    ward TEXT NOT NULL,
    severity TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp DOUBLE PRECISION NOT NULL,
    acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create analytics table
CREATE TABLE analytics (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable Row Level Security (RLS) on all tables for seamless hackathon development
ALTER TABLE doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics DISABLE ROW LEVEL SECURITY;

-- Insert initial analytics keys if not exist
INSERT INTO analytics (key, value) VALUES 
('metrics', '{"avg_response_time": 4.2, "critical_cases_today": 14, "lives_saved_today": 9, "alert_accuracy": 94.6, "predicted_emergencies": 18, "ai_recommendations_generated": 142}'::jsonb)
ON CONFLICT (key) DO NOTHING;
