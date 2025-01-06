CREATE OR REPLACE FUNCTION public.union_contacts_optimized(contact_id1 uuid, contact_id2 uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    root1 UUID;
    root2 UUID;
    rank1 INT;
    rank2 INT;
BEGIN
    root1 := find_contact_optimized(contact_id1);
    root2 := find_contact_optimized(contact_id2);

    IF root1 != root2 THEN
        SELECT sz INTO rank1 FROM contacts WHERE id = root1;
        SELECT sz INTO rank2 FROM contacts WHERE id = root2;

        IF rank1 < rank2 THEN
            UPDATE contacts 
            SET linkedId = root2,
                linkPrecedence = 'secondary'  
            WHERE id = root1;

            UPDATE contacts
            SET sz = rank1 + rank2
            WHERE id = root2;

        ELSE
            UPDATE contacts 
            SET linkedId = root1,
                linkPrecedence = 'secondary'  
            WHERE id = root2;

            UPDATE contacts
            SET sz = rank1 + rank2
            WHERE id = root1;
        END IF;
    END IF;
END;
$function$
