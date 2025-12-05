-- Drop the view that depends on the scheduled_date column
DROP VIEW IF EXISTS active_installations;

-- Change scheduled_date from DATE to TIMESTAMPTZ to store date and time
ALTER TABLE installations
  ALTER COLUMN scheduled_date TYPE TIMESTAMPTZ
  USING scheduled_date::TIMESTAMPTZ;

-- Update the comment to reflect the new type
COMMENT ON COLUMN installations.scheduled_date IS 'Scheduled date and time for the installation';

-- Recreate the view with the updated column type
CREATE VIEW active_installations AS
SELECT *
FROM installations
WHERE archived_at IS NULL;
