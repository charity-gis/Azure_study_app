import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Cloud, LogIn } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import "@lovable.dev/cloud-auth-js/styles.css";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useCloudSave } from "@/components/CloudSave";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Cloud Save Sign In — AZ-900 Study Coach" },
    { name: "description", content: "Sign in to keep your Azure Fundamentals study plan, flashcards and quiz results synced across your devices." },
    { property: "og:title", content: "Cloud Save Sign In — AZ-900 Study Coach" },
    { property: "og:description", content: "Keep your study plan and progress together on phone and laptop." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: AuthPage,
});
function AuthPage() {
  const { userId, status, importGuest } = useCloudSave();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [imported, setImported] = useState(false);
  const signIn = async (provider: "google" | "lovable") => {
    setBusy(true); setError("");
    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/auth` });
      if (result.error) setError("Sign-in did not finish. Please try again.");
    } catch { setError("Sign-in is unavailable right now. Please try again."); }
    finally { setBusy(false); }
  };
  return <div className="space-y-6 pb-6"><PageHeader title="Cloud save" right={<Cloud className="h-5 w-5 text-primary" />} />
    {userId ? <section className="space-y-4"><h2 className="text-xl font-semibold">You’re signed in</h2><p className="text-sm text-muted-foreground">{status}</p><Button disabled={imported} className="h-auto min-h-12 w-full whitespace-normal" onClick={() => { importGuest(); setImported(true); }}>Add this device’s previous study progress</Button>{imported && <p className="text-sm text-muted-foreground">Your previous progress is queued for cloud saving.</p>}</section> : <section className="space-y-4"><h2 className="text-xl font-semibold">Your study, on every device</h2><p className="text-sm leading-relaxed text-muted-foreground">Use the same account on your phone and laptop for your plan, flashcards and quiz results.</p><Button disabled={busy} className="h-12 w-full" variant="outline" onClick={() => void signIn("google")}><LogIn /> Continue with Google</Button><Button disabled={busy} className="lovable-auth-button w-full" onClick={() => void signIn("lovable")}>Continue with Lovable</Button></section>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <p className="text-xs leading-relaxed text-muted-foreground">Signed-out study stays on this device. Previous device progress is added only when you choose to import it.</p>
  </div>;
}