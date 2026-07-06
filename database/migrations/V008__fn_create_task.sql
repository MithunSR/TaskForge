-- =====================================================
-- Author      : Mithun
-- Date        : 2026-07-06
-- Description : Inserts a new task and returns the created
--               row, so the API can respond with the full
--               task object (including its generated id)
--               in a single round trip.
-- =====================================================
CREATE OR REPLACE FUNCTION fn_create_task(
    p_title TEXT, p_description TEXT, p_status TEXT, p_due_date DATE, p_owner_id UUID
) RETURNS TABLE (id UUID, title TEXT, description TEXT, status TEXT, due_date DATE, owner_id UUID) AS $$
BEGIN
    RETURN QUERY
    INSERT INTO tasks (title, description, status, due_date, owner_id)
    VALUES (p_title, p_description, p_status::task_status, p_due_date, p_owner_id)
    RETURNING tasks.id, tasks.title, tasks.description, tasks.status::TEXT, tasks.due_date, tasks.owner_id;
END;
$$ LANGUAGE plpgsql;