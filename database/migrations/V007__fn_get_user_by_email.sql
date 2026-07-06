-- =====================================================
-- Author      : Mithun
-- Date        : 2026-07-06
-- Description : Looks up a single user by email, joined
--               with their role name. Used by the login
--               flow to fetch the password hash for
--               verification and the role for the JWT claim.
-- =====================================================
CREATE OR REPLACE FUNCTION fn_get_user_by_email(p_email TEXT)
RETURNS TABLE (id UUID, name TEXT, email TEXT, password_hash TEXT, role_name TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.name, u.email, u.password_hash, r.name
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE u.email = p_email;
END;
$$ LANGUAGE plpgsql;