-- Migration to add the use_registration_token function

CREATE OR REPLACE FUNCTION use_registration_token(
    token TEXT,
    unit_number TEXT,
    hoa_last4 TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    token_id UUID;
BEGIN
    -- Validate the token exists and is unused
    SELECT id INTO token_id
    FROM registration_tokens
    WHERE token = $1 AND unit_number = $2 AND hoa_last4 = $3 AND used = FALSE;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Mark the token as used
    UPDATE registration_tokens
    SET used = TRUE, used_at = NOW()
    WHERE id = token_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
