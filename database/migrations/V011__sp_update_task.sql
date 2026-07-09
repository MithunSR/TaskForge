-- =====================================================
-- Author      : Mithun
-- Date        : 2026-07-06
-- Description : Updates an existing task's editable fields
--               and refreshes updated_at. A procedure, not
--               a function, since the API only needs to know
--               success/failure — no row needs to be returned.
-- =====================================================
CREATE OR REPLACE PROCEDURE sp_update_task(
    p_id UUID, p_title TEXT, p_description TEXT, p_status_id INT, p_due_date DATE
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE tasks
    SET title = p_title,
        description = p_description,
        status_id = p_status_id,
        due_date = p_due_date,
        updated_at = now()
    WHERE id = p_id;
END;
$$;