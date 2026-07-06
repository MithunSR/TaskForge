-- =====================================================
-- Author      : Mithun
-- Date        : 2026-07-06
-- Description : Permanently deletes a task by id. Ownership
--               /role authorization is enforced in the C#
--               service layer before this is ever called.
-- =====================================================
CREATE OR REPLACE PROCEDURE sp_delete_task(p_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM tasks WHERE id = p_id;
END;
$$;