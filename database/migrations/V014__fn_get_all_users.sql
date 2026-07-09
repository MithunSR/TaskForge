CREATE OR REPLACE FUNCTION fn_get_all_users()
RETURNS TABLE (id UUID, name TEXT, email TEXT, role_name TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.name::TEXT, u.email::TEXT, r.name::TEXT
    FROM users u
    JOIN roles r ON r.id = u.role_id
    ORDER BY u.name;
END;
$$ LANGUAGE plpgsql;