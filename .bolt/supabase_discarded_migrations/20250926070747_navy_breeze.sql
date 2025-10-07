/*
  # Add Business Hours Table

  1. New Tables
    - `business_hours`
      - `id` (uuid, primary key)
      - `business_id` (uuid, foreign key to businesses)
      - `day_of_week` (integer, 0-6 where 0 is Sunday)
      - `open_time` (time)
      - `close_time` (time)
      - `is_open` (boolean)

  2. Security
    - Enable RLS on `business_hours` table
    - Add policies for business owners to manage their hours
    - Add policy for public to view business hours

  3. Indexes
    - Add index on business_id for faster queries
    - Add unique constraint on business_id + day_of_week
*/

CREATE TABLE IF NOT EXISTS business_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time time NOT NULL,
  close_time time NOT NULL,
  is_open boolean DEFAULT true,
  UNIQUE(business_id, day_of_week)
);

-- Enable RLS
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_business_hours_business_id ON business_hours(business_id);

-- RLS Policies
CREATE POLICY "Anyone can view business hours"
  ON business_hours
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users can manage business hours for their businesses"
  ON business_hours
  FOR ALL
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- Insert sample business hours for existing businesses
DO $$
DECLARE
  business_record RECORD;
BEGIN
  FOR business_record IN SELECT id FROM businesses LOOP
    -- Insert standard business hours (Mon-Fri 9-5) if none exist
    IF NOT EXISTS (SELECT 1 FROM business_hours WHERE business_id = business_record.id) THEN
      INSERT INTO business_hours (business_id, day_of_week, open_time, close_time, is_open) VALUES
        (business_record.id, 0, '10:00', '16:00', false), -- Sunday - closed
        (business_record.id, 1, '09:00', '17:00', true),  -- Monday
        (business_record.id, 2, '09:00', '17:00', true),  -- Tuesday
        (business_record.id, 3, '09:00', '17:00', true),  -- Wednesday
        (business_record.id, 4, '09:00', '17:00', true),  -- Thursday
        (business_record.id, 5, '09:00', '17:00', true),  -- Friday
        (business_record.id, 6, '10:00', '16:00', false); -- Saturday - closed
    END IF;
  END LOOP;
END $$;