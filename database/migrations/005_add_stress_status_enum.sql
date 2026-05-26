DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stress_status_enum') THEN
    CREATE TYPE stress_status_enum AS ENUM ('exhausted', 'normal', 'relaxed');
  END IF;
END $$;

ALTER TABLE histories
ADD COLUMN IF NOT EXISTS stress_status stress_status_enum;

UPDATE histories
SET stress_status = CASE
  WHEN stress_level >= 7 THEN 'exhausted'::stress_status_enum
  WHEN stress_level >= 4 THEN 'normal'::stress_status_enum
  ELSE 'relaxed'::stress_status_enum
END
WHERE stress_status IS NULL;

ALTER TABLE histories
ALTER COLUMN stress_status SET DEFAULT 'normal';

ALTER TABLE histories
ALTER COLUMN stress_status SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_histories_stress_status ON histories(stress_status);
