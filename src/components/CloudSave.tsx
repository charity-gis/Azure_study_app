import { Fragment, createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Cloud, CloudOff, LogOut, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { applySnapshot, cloudStudySchema, emptySnapshot, mergeStudy, readSnapshot, type CloudStudy } from "@/lib/cloud-study";
import { setStudyOwner, STUDY_CHANGED, STUDY_REFRESHED } from "@/lib/device-storage";

type SaveContext = { userId: string | null; status: string; sync: () => void; importGuest: () => void; signOut: () => Promise<void> };
const Context = createContext<SaveContext>({ userId: null, status: "Checking account…", sync: () => {}, importGuest: () => {}, signOut: async () => {} });
export function useCloudSave() { return useContext(Context); }

export function CloudSaveProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState("Checking account…");
  const [revision, setRevision] = useState(0);
  const [ready, setReady] = useState(false);
  const active = useRef<string | null>(null);
  const importData = useRef<CloudStudy | null>(null);
  const guest = useRef<CloudStudy | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();
  const navigate = useNavigate();
  useEffect(() => {
    let disposed = false;
    let identityRevision = 0;
    try { guest.current = readSnapshot(); } catch { guest.current = emptySnapshot(); }
    const refreshUI = () => window.dispatchEvent(new Event(STUDY_REFRESHED));
    const setIdentity = (id: string | null) => {
      if (disposed || active.current === id && status !== "Checking account…") return;
      active.current = id; setStudyOwner(id); importData.current = null;
      setReady(true);
      setUserId(id); setStatus(id ? "Syncing…" : "Saved on this device"); refreshUI();
    };
    const verify = async () => {
      const version = ++identityRevision;
      const { data } = await supabase.auth.getUser();
      if (!disposed && version === identityRevision) setIdentity(data.user?.id ?? null);
    };
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (!["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event)) return;
      identityRevision++;
      if (event === "SIGNED_OUT") { setIdentity(null); queryClient.clear(); }
      else { void verify(); void queryClient.invalidateQueries(); }
      void router.invalidate();
    });
    void verify();
    return () => { disposed = true; listener.subscription.unsubscribe(); active.current = null; setStudyOwner(null); };
  }, [queryClient, router]);

  useEffect(() => {
    if (!userId) return;
    let disposed = false;
    let busy = false;
    let queued = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const sync = async () => {
      if (disposed || active.current !== userId) return;
      if (busy) { queued = true; return; }
      busy = true; setStatus("Syncing…");
      try {
        const snapshot = importData.current ? mergeStudy(readSnapshot(), importData.current) : readSnapshot();
        const { data, error } = await supabase.rpc("sync_study_state", { incoming: JSON.parse(JSON.stringify(snapshot)) });
        if (error) throw error;
        if (disposed || active.current !== userId) return;
        const remote = cloudStudySchema.parse(data);
        const merged = mergeStudy(remote, readSnapshot());
        // Keep new local writes made while the request was in flight.
        const latest = merged.runs.at(-1);
        merged.progress.lastScore = latest?.score ?? remote.progress.lastScore;
        merged.progress.attempts = Math.max(remote.progress.attempts, merged.runs.length);
        applySnapshot(merged); importData.current = null;
        window.dispatchEvent(new Event(STUDY_REFRESHED)); setStatus("Saved to cloud");
      } catch {
        if (!disposed && active.current === userId) setStatus("Not synced · Retry when online");
      } finally {
        busy = false;
        if (queued && !disposed) { queued = false; void sync(); }
      }
    };
    const schedule = () => { clearTimeout(timer); timer = setTimeout(() => void sync(), 350); };
    const onVisible = () => { if (document.visibilityState === "visible") void sync(); };
    void sync();
    window.addEventListener(STUDY_CHANGED, schedule);
    window.addEventListener("az900-sync-now", schedule);
    window.addEventListener("online", schedule);
    window.addEventListener("focus", schedule);
    document.addEventListener("visibilitychange", onVisible);
    const poll = setInterval(() => { if (document.visibilityState === "visible") void sync(); }, 30000);
    return () => { disposed = true; clearTimeout(timer); clearInterval(poll); window.removeEventListener(STUDY_CHANGED, schedule); window.removeEventListener("az900-sync-now", schedule); window.removeEventListener("online", schedule); window.removeEventListener("focus", schedule); document.removeEventListener("visibilitychange", onVisible); };
  }, [userId, revision]);
  const sync = () => window.dispatchEvent(new Event("az900-sync-now"));
  const importGuest = () => { importData.current = guest.current; sync(); };
  const signOut = async () => {
    await queryClient.cancelQueries(); queryClient.clear();
    const { error } = await supabase.auth.signOut();
    if (error) { setStatus("Could not sign out · Try again"); return; }
    active.current = null; setStudyOwner(null); setUserId(null); setRevision((value) => value + 1);
    await navigate({ to: "/auth", replace: true });
  };
  return <Context.Provider value={{ userId, status, sync, importGuest, signOut }}>{ready ? <Fragment key={userId ?? "guest"}>{children}</Fragment> : <p role="status" className="p-5 text-sm text-muted-foreground">Checking account…</p>}</Context.Provider>;
}

export function CloudSaveBar() {
  const { userId, status, sync, signOut } = useCloudSave();
  return <div className="mx-auto flex w-full max-w-md items-center justify-between gap-2 border-b px-5 py-2">
    <span role="status" className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">{userId ? <Cloud className="h-4 w-4 shrink-0 text-primary" /> : <CloudOff className="h-4 w-4 shrink-0" />}{status}</span>
    {userId ? <div className="flex shrink-0 gap-1"><Button variant="ghost" size="icon" title="Sync now" aria-label="Sync now" onClick={sync}><RefreshCw /></Button><Button variant="ghost" size="icon" title="Sign out" aria-label="Sign out" onClick={() => void signOut()}><LogOut /></Button></div> : <Button asChild variant="link" className="shrink-0 px-0 text-xs"><Link to="/auth">Sign in to save</Link></Button>}
  </div>;
}