-- The current registration flow stores one display name. Legacy name columns
-- must remain available for existing data, but cannot be required for new accounts.
BEGIN;

DO $legacy_name_columns$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'adherents'
          AND column_name = 'nom'
    ) THEN
        ALTER TABLE public.adherents ALTER COLUMN nom DROP NOT NULL;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'adherents'
          AND column_name = 'prenom'
    ) THEN
        ALTER TABLE public.adherents ALTER COLUMN prenom DROP NOT NULL;
    END IF;
END
$legacy_name_columns$;

COMMIT;
