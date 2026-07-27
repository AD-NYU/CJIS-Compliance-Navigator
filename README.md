# CJIS Compliance Navigator

A public, read-only policy navigator for CJIS Security Policy v6.0, effective December 27, 2024.

## What it does

- Offers one public, read-only policy catalog without requiring or offering an account.
- Organizes the official policy as Control Family → Control ID → Requirement → Checklist.
- Keeps official policy wording and citations separate from clearly labeled implementation guidance.
- Uses an independently authored four-step checklist for each control, derived from the official CJIS requirement. CJIS-specified frequencies and named conditions are surfaced directly; values the policy leaves open are labeled agency-selected rather than guessed.
- Uses the supplied GovRAMP CJIS overlay only to cross-check control coverage and the SA-15 numbering discrepancy; its assessment wording and structure are not reproduced.
- Does not provide sign-up, sign-in, saved progress, comments, evidence entry, or user-specific storage.

The application is a policy navigation and implementation aid. It does not prove, grant, or imply CJIS compliance or certification, and it must not be used to enter or link to Criminal Justice Information, credentials, case information, or agency-sensitive material.

## Local verification

Use Node.js 22.13 or newer.

```bash
npm install
npm test
npm run build
npm run build:pages
```

The root route always renders the same anonymous, read-only catalog, including when authentication-related headers are present.

## GitHub Pages

The public GitHub Pages deployment is built by [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) whenever `main` changes. The expected URL is:

<https://ad-nyu.github.io/CJIS-Compliance-Navigator/>

The Pages build is a fully client-side, public, read-only application. It has no account, sign-in, status tracking, evidence submission, comments, or customer data storage.
