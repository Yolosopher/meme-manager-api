DO
$$
DECLARE
    tables text;
BEGIN
    -- Fetch all table names from the public schema
    SELECT string_agg('"' || table_name || '"', ', ')
    INTO tables
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
    
    -- Execute the dynamic truncate statement
    EXECUTE 'TRUNCATE TABLE ' || tables || ' RESTART IDENTITY CASCADE;';
END
$$;
