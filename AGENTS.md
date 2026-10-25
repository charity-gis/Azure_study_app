<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep question selection and missed-answer filtering in a browser-safe practice module so the quiz and tests share the same rules.
- Missed-question retries are scoped to the current quiz session; preserve the existing device-only progress behavior unless shared persistence is explicitly introduced.
- Topic explanations are browser-safe local study content shared by the coach and tests; no gateway request is made for explanations.
- Keep syllabus domain mappings and validated domain search parameters in a browser-safe study module; flashcards and practice share these filters so syllabus links open matching sets.
- Keep study-plan validation, calendar scheduling and unique-item coverage in a shared browser-safe module; record cards only when explanations are revealed and questions when answered, so visits and retries cannot inflate coverage.
- Cloud study sync uses a private RLS-protected state row and atomic invoker RPC; merge unique activity and quiz run IDs, resolve plan edits by latest timestamp, isolate account caches from guest storage, and require explicit guest import to avoid cross-account leakage.
- Persist terminal AI access blocks in a server-only operational table; learners cannot read or modify that state.
