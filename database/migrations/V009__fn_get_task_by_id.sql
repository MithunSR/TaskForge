-- =====================================================
-- Author      : Mithun
-- Date        : 2026-07-06
-- Description : Retrieves a single task by its id. Ownership
--               /role authorization is enforced in the C#
--               service layer, not in this function.
-- =====================================================
CREATE OR REPLACE FUNCTION fn_get_task_by_id(p_id UUID)
RETURNS TABLE (id UUID, title TEXT, description TEXT, status_id INT, status_name TEXT, due_date DATE, owner_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT t.id, t.title::TEXT, t.description, t.status_id, ts.name::TEXT, t.due_date, t.owner_id
    FROM tasks t
    JOIN task_statuses ts ON ts.id = t.status_id
    WHERE t.id = p_id;
END;
$$ LANGUAGE plpgsql;