CREATE OR REPLACE FUNCTION public.find_contact_optimized(contact_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
    parent_id UUID;
BEGIN
    SELECT linkedId INTO parent_id FROM contacts WHERE id = contact_id;
    IF parent_id IS NOT NULL AND parent_id != contact_id THEN
        parent_id := find_contact_optimized(parent_id);
        UPDATE contacts SET linkedId = parent_id WHERE id = contact_id;
    END IF;
    RETURN COALESCE(parent_id, contact_id);
END;
$function$
