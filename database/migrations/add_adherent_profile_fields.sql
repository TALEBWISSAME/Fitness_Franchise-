-- Profile fields for an adherent. This migration is additive and can be run more than once.
-- All fields remain optional so existing accounts are preserved unchanged.

BEGIN;

ALTER TABLE public.adherents
    ADD COLUMN IF NOT EXISTS city VARCHAR(100),
    ADD COLUMN IF NOT EXISTS gender VARCHAR(32),
    ADD COLUMN IF NOT EXISTS sport_objective VARCHAR(64);

-- Values are optional. When supplied, they must come from the profile choices
-- approved for Fitness Franchise.
DO $profile_constraints$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'public.adherents'::regclass
          AND conname = 'adherents_gender_allowed'
    ) THEN
        ALTER TABLE public.adherents
            ADD CONSTRAINT adherents_gender_allowed
            CHECK (gender IS NULL OR gender IN (
                'Femme',
                'Homme',
                'Autre',
                'Préfère ne pas répondre'
            ));
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'public.adherents'::regclass
          AND conname = 'adherents_sport_objective_allowed'
    ) THEN
        ALTER TABLE public.adherents
            ADD CONSTRAINT adherents_sport_objective_allowed
            CHECK (sport_objective IS NULL OR sport_objective IN (
                'Remise en forme',
                'Endurance',
                'Renforcement musculaire',
                'Mobilité',
                'Bien-être'
            ));
    END IF;
END
$profile_constraints$;

COMMIT;
