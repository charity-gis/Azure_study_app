# Verification and known limitations

## Checks performed on 24 October 2026

- `bunx vitest run`: **27 tests passed in 6 files**.
- Fresh browser visits to dashboard, flashcards, quiz builder and coach completed with **zero captured page runtime errors**.
- Screenshots were captured from the running development app at 1280 × 1800.
- Source export excludes environment secrets, Git metadata, dependency directories and generated build output.

This documentation-only change does not alter the app's learning behavior. The browser captures verify those pages open; they do not constitute a new full quiz interaction, authentication, notification or cross-device test.

## Automated coverage

| Test file | Tests | Coverage |
|---|---:|---|
| coach.test.ts | 5 | Local topic notes, unknown-topic/input rejection. |
| syllabus.test.ts | 4 | Domain mappings and filters. |
| practice.test.ts | 3 | Question selection and session-scoped missed retries. |
| study-plan.test.ts | 9 | Validation, scheduling and unique-item coverage. |
| cloud-study.test.ts | 5 | Client merge rules and guest/account-cache isolation. |
| app-routing.test.tsx | 1 | Home route matching. |

## Not yet verified end to end

- Live same-account cloud save/read-back across two devices.
- All OAuth provider behavior and hosted sign-in settings.
- Timer reminders after a full interval, mobile notifications and background tab scheduling.
- Comprehensive accessibility and learner usability testing.
- Independent factual audit of every note against the latest exam guide.
- Production build/hosting portability on an unrelated host.
- Final published demo parity with the latest repository snapshot.

## Product limits

The bank is small and static; domain outline coverage is broader than practice coverage. Quiz ordering is deterministic rather than adaptive AI selection. Local explanations do not use live generation. The timer is manual, device-only and uses UTC day boundaries; it cannot prove active reading or reliably notify after a page is closed. Browser storage can be cleared. Readiness indicators are study summaries, not exam guarantees. No learner adoption, retention or pass-rate study has been completed.
