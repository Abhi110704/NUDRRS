/*
  # Initial NUDRRS Database Schema

  1. New Tables
    - `profiles` - User profiles with roles (user, admin, responder)
    - `sos_reports` - Emergency SOS reports from citizens
    - `disaster_alerts` - Official disaster alerts and warnings

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Users can only see their own data unless they're admin/responder

  3. Features
    - Geospatial support for location tracking
    - Multi-role user system
    - Real-time emergency reporting
    - Admin dashboard capabilities
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'responder')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- SOS Reports table
CREATE TABLE IF NOT EXISTS sos_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  emergency_type text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  latitude decimal,
  longitude decimal,
  urgency text NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'false_alarm')),
  media_urls text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Disaster Alerts table
CREATE TABLE IF NOT EXISTS disaster_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  location text NOT NULL,
  latitude decimal NOT NULL,
  longitude decimal NOT NULL,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'monitoring', 'resolved')),
  affected_count integer DEFAULT 0,
  description text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE disaster_alerts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- SOS Reports policies
CREATE POLICY "Users can insert own reports"
  ON sos_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own reports"
  ON sos_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins and responders can read all reports"
  ON sos_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'responder')
    )
  );

CREATE POLICY "Admins and responders can update reports"
  ON sos_reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'responder')
    )
  );

-- Disaster Alerts policies
CREATE POLICY "Everyone can read disaster alerts"
  ON disaster_alerts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage disaster alerts"
  ON disaster_alerts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert sample data
INSERT INTO disaster_alerts (type, location, latitude, longitude, severity, status, affected_count, description) VALUES
  ('flood', 'Kochi, Kerala', 9.9312, 76.2673, 'high', 'active', 15000, 'Severe flooding in urban areas due to heavy monsoon rains'),
  ('earthquake', 'Dehradun, Uttarakhand', 30.3165, 78.0322, 'medium', 'monitoring', 8500, 'Moderate earthquake detected, monitoring for aftershocks'),
  ('cyclone', 'Bhubaneswar, Odisha', 20.2961, 85.8245, 'high', 'active', 25000, 'Cyclone approaching coastal areas, evacuation in progress'),
  ('heat_wave', 'Jodhpur, Rajasthan', 26.2389, 73.0243, 'medium', 'active', 12000, 'Extreme heat wave conditions, health advisory issued');

-- Create admin user (this will be handled by the application)
-- The admin user should be created through the signup process with email: admin@nudrrs.gov.in