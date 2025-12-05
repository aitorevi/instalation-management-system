-- Change scheduled_date from DATE to TIMESTAMPTZ to store both date and time
-- This allows installers to schedule specific times for installations

-- Step 1: Drop the view that depends on scheduled_date
DROP VIEW IF EXISTS active_installations;

-- Step 2: Change the column type
ALTER TABLE installations
ALTER COLUMN scheduled_date TYPE TIMESTAMPTZ USING scheduled_date::TIMESTAMPTZ;

COMMENT ON COLUMN installations.scheduled_date IS 'Scheduled date and time for the installation (with timezone)';

-- Step 3: Recreate the view with the updated column type
CREATE VIEW active_installations AS
SELECT *
FROM installations
WHERE archived_at IS NULL;
