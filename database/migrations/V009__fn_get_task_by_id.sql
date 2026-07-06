-- =====================================================
-- Author      : Mithun
-- Date        : 2026-07-06
-- Description : Retrieves a single task by its id. Ownership
--               /role authorization is enforced in the C#
--               service layer, not in this function.
-- =====================================================
CREATE OR REPLACE FUNCTION fn_get_task_by_id(p_id UUID)
RETURNS TABLE (id UUID, title TEXT, description TEXT, status TEXT, due_date DATE, owner_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT t.id, t.title, t.description, t.status::TEXT, t.due_date, t.owner_id
    FROM tasks t
    WHERE t.id = p_id;
END;
$$ LANGUAGE plpgsql;