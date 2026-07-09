-- =====================================================
-- Author      : Mithun
-- Date        : 2026-07-08
-- Description : Returns all valid task statuses. Used by
--               the frontend to populate the status dropdown
--               dynamically instead of hardcoding values.
-- =====================================================
CREATE OR REPLACE FUNCTION fn_get_task_statuses()
RETURNS TABLE (id INT, name TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT ts.id, ts.name::TEXT
    FROM task_statuses ts
    ORDER BY ts.id;
END;
$$ LANGUAGE plpgsql;