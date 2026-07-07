-- =====================================================
-- Author      : Mithun
-- Date        : 2026-07-06
-- Description : Returns a paginated, optionally filtered
--               list of tasks. p_owner_id and p_status are
--               nullable — pass NULL to skip that filter.
--               total_count (via COUNT(*) OVER()) lets the
--               API compute total pages for the frontend.
-- =====================================================
CREATE OR REPLACE FUNCTION fn_get_tasks_paged(
    p_owner_id UUID, p_status TEXT, p_page INT, p_page_size INT
) RETURNS TABLE (
    id UUID, title TEXT, description TEXT, status TEXT,
    due_date DATE, owner_id UUID, total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT t.id, t.title::TEXT, t.description, t.status::TEXT, t.due_date, t.owner_id,
           COUNT(*) OVER() AS total_count
    FROM tasks t
    WHERE (p_owner_id IS NULL OR t.owner_id = p_owner_id)
      AND (p_status IS NULL OR t.status::TEXT = p_status)
    ORDER BY t.due_date NULLS LAST
    OFFSET (p_page - 1) * p_page_size LIMIT p_page_size;
END;
$$ LANGUAGE plpgsql;