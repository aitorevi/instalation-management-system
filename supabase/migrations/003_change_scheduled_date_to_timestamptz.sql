-- Change scheduled_date from DATE to TIMESTAMPTZ to store both date and time
-- This allows installers to schedule specific times for installations

ALTER TABLE installations
ALTER COLUMN scheduled_date TYPE TIMESTAMPTZ USING scheduled_date::TIMESTAMPTZ;

COMMENT ON COLUMN installations.scheduled_date IS 'Scheduled date and time for the installation (with timezone)';
