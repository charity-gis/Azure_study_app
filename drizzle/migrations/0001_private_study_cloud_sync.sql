CREATE TABLE public.study_cloud_state (
 user_id uuid PRIMARY KEY,
 state jsonb NOT NULL DEFAULT '{"plan":null,"planUpdatedAt":null,"activity":{"cards":[],"answered":[],"correct":[]},"progress":{"lastScore":null,"attempts":0,"cardsSeen":0},"runs":[]}'::jsonb,
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.study_cloud_state TO authenticated;
GRANT ALL ON public.study_cloud_state TO service_role;
ALTER TABLE public.study_cloud_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own study state" ON public.study_cloud_state FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Insert own study state" ON public.study_cloud_state FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Update own study state" ON public.study_cloud_state FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE FUNCTION public.sync_study_state(incoming jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE old_state jsonb; merged jsonb; merged_activity jsonb := '{}'::jsonb; runs jsonb; key text; selected_plan jsonb; progress jsonb; latest_score jsonb;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
 IF jsonb_typeof(incoming) IS DISTINCT FROM 'object' OR length(incoming::text) > 2000000 OR jsonb_typeof(incoming->'activity') IS DISTINCT FROM 'object' OR jsonb_typeof(incoming->'runs') IS DISTINCT FROM 'array' OR jsonb_typeof(incoming->'progress') IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'Invalid study state'; END IF;
 INSERT INTO public.study_cloud_state(user_id) VALUES(auth.uid()) ON CONFLICT(user_id) DO NOTHING;
 SELECT state INTO old_state FROM public.study_cloud_state WHERE user_id = auth.uid() FOR UPDATE;
 FOREACH key IN ARRAY ARRAY['cards','answered','correct'] LOOP
 IF jsonb_typeof(incoming->'activity'->key) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Invalid activity'; END IF;
 merged_activity := merged_activity || jsonb_build_object(key, (SELECT coalesce(jsonb_agg(value ORDER BY value),'[]'::jsonb) FROM (SELECT DISTINCT value FROM jsonb_array_elements(coalesce(old_state->'activity'->key,'[]'::jsonb) || (incoming->'activity'->key))) items));
 END LOOP;
 SELECT coalesce(jsonb_agg(item ORDER BY item->>'at',item->>'id'),'[]'::jsonb) INTO runs FROM (SELECT DISTINCT ON (item->>'id') item FROM jsonb_array_elements(coalesce(old_state->'runs','[]'::jsonb) || (incoming->'runs')) item ORDER BY item->>'id',item->>'at' DESC) unique_runs;
 selected_plan := CASE WHEN coalesce(incoming->>'planUpdatedAt','') > coalesce(old_state->>'planUpdatedAt','') THEN incoming ELSE old_state END;
 SELECT item->'score' INTO latest_score FROM jsonb_array_elements(runs) item ORDER BY item->>'at' DESC,item->>'id' DESC LIMIT 1;
 progress := jsonb_build_object('cardsSeen',greatest(coalesce((old_state->'progress'->>'cardsSeen')::int,0),coalesce((incoming->'progress'->>'cardsSeen')::int,0)), 'attempts', greatest(jsonb_array_length(runs),coalesce((old_state->'progress'->>'attempts')::int,0),coalesce((incoming->'progress'->>'attempts')::int,0)), 'lastScore',coalesce(latest_score,nullif(old_state->'progress'->'lastScore','null'::jsonb),incoming->'progress'->'lastScore','null'::jsonb));
 merged := jsonb_build_object('plan',selected_plan->'plan','planUpdatedAt',selected_plan->'planUpdatedAt','activity',merged_activity,'progress',progress,'runs',runs);
 UPDATE public.study_cloud_state SET state=merged,updated_at=now() WHERE user_id=auth.uid();
 RETURN merged;
END;
$$;
REVOKE ALL ON FUNCTION public.sync_study_state(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sync_study_state(jsonb) TO authenticated;