CREATE TABLE public.ai_coach_access_state (
  id text PRIMARY KEY,
  status integer NOT NULL,
  message text NOT NULL,
  kind text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.ai_coach_access_state TO service_role;
ALTER TABLE public.ai_coach_access_state ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.ai_coach_access_state IS 'Server-only persistent circuit breaker for terminal AI gateway access blocks; no learner data.';