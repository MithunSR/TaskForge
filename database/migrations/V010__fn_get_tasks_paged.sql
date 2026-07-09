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
    p_owner_id UUID, p_status_id INT, p_page INT, p_page_size INT
) RETURNS TABLE (
    id UUID, title TEXT, description TEXT, status_id INT, status_name TEXT,
    due_date DATE, owner_id UUID, total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT t.id, t.title::TEXT, t.description, t.status_id, ts.name::TEXT, t.due_date, t.owner_id,
           COUNT(*) OVER() AS total_count
    FROM tasks t
    JOIN task_statuses ts ON ts.id = t.status_id
    WHERE (p_owner_id IS NULL OR t.owner_id = p_owner_id)
      AND (p_status_id IS NULL OR t.status_id = p_status_id)
    ORDER BY t.due_date NULLS LAST
    OFFSET (p_page - 1) * p_page_size LIMIT p_page_size;
END;
$$ LANGUAGE plpgsql;CREATE OR REPLACE FUNCTION fn_get_tasks_paged(
    p_owner_id UUID, p_status_id INT, p_page INT, p_page_size INT
) RETURNS TABLE (
    id UUID, title TEXT, description TEXT, status_id INT, status_name TEXT,
    due_date DATE, owner_id UUID, total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT t.id, t.title::TEXT, t.description, t.status_id, ts.name::TEXT, t.due_date, t.owner_id,
           COUNT(*) OVER() AS total_count
    FROM tasks t
    JOIN task_statuses ts ON ts.id = t.status_id
    WHERE (p_owner_id IS NULL OR t.owner_id = p_owner_id)
      AND (p_status_id IS NULL OR t.status_id = p_status_id)
    ORDER BY t.due_date NULLS LAST
    OFFSET (p_page - 1) * p_page_size LIMIT p_page_size;
END;
$$ LANGUAGE plpgsql;