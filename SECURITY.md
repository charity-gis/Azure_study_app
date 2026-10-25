# Security and privacy

Core guest study data is stored in the browser. Optional cloud save stores private account study state, including plans, activity and quiz runs. Account caches are separated from guest storage; importing guest progress is an explicit action. The timer is stored separately on the device.

Database migrations define owner-scoped row security and restrict guest access. Unit tests for client merging do not replace live database permission tests.

## Reporting

Do not post tokens, personal study records or exploitation details in public issues. If the repository offers GitHub's **Report a vulnerability** action, use it. Otherwise open a minimal issue requesting a private contact method without disclosing the vulnerability itself.

## Safe configuration

- `.env` is excluded from the repository export. Use `.env.example` for names only.
- Browser publishable keys are public by design; private server credentials never belong in `VITE_` variables.
- No learner-data export is included in this repository.
- A source snapshot does not include managed backend credentials or provider configuration.
- Keep dependencies updated and review auth/ownership behavior after changes.
