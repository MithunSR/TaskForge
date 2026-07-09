-- =====================================================
-- Author      : Mithun
-- Date        : 2026-07-08
-- Description : Converts tasks.status from the task_status
--               ENUM to a status_id foreign key referencing
--               task_statuses(id). Preserves existing data
--               by mapping each enum value to its matching row.
-- =====================================================

-- 1. Add the new column, nullable for now
ALTER TABLE tasks ADD COLUMN status_id INT REFERENCES task_statuses(id);

-- 2. Backfill existing rows based on their current enum value
UPDATE tasks t
SET status_id = ts.id
FROM task_statuses ts
WHERE t.status::TEXT = ts.name;

-- 3. Now that every row has a value, make it required
ALTER TABLE tasks ALTER COLUMN status_id SET NOT NULL;

-- 4. Drop the old enum column and type — no longer needed
ALTER TABLE tasks DROP COLUMN status;
DROP TYPE IF EXISTS task_status;

-- 5. Index for the same filtering performance the old enum column had
CREATE INDEX idx_tasks_status_id ON tasks(status_id);