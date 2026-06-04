# Security Policy

## Supported Versions

We currently provide security updates only for the active major release of Fake Checker. Due to the rapid iteration cycle of the project, legacy alpha/beta builds are not supported for patches.

| Version | Supported          |
| ------- | ------------------ |
| v1.0.x  | ✅                 |
| < v1.0  | ❌                 |

## Reporting a Vulnerability

**DO NOT create a public GitHub issue for security vulnerabilities.**

If you discover a potential vulnerability within Fake Checker, please report it via email to **security@fakechecker.io**. Or, alternatively, use GitHub's private vulnerability reporting feature against the repository.

Please include the following in your report:
* A detailed description of the vulnerability.
* Step-by-step instructions to reproduce the issue.
* Assessment of the impact (e.g., allows cheating, XSS via modified `cases.json`, etc.).
* Any proof-of-concept code, videos, or screenshots.

## Response Timeline

We take all security reports seriously and commit to the following transparent timeline:
* **Acknowledgement:** Within 48 hours of your report.
* **Initial Assessment:** Within 7 days, detailing the severity and proposed fix plan.
* **Patch or Mitigation:** Within 90 days of confirmation.
* **Public Disclosure:** Published jointly via GitHub Security Advisories once the patched version is released.

## Security Advisories

When a vulnerability is identified and patched, we will publish a detailed summary to the GitHub Security Advisories page for this repository, crediting the reporter and detailing the workaround or patch steps.

## Out of Scope

The following are NOT considered valid security vulnerabilities for this client-side specific project:
* **Game logic circumvention:** Exploiting the React DevTools to pause timers, edit Trust scores, or cheat.
* **Denial of Service (DoS):** Flooding the local Vite dev server.
* **Social Engineering / Phishing:** Attempts originating outside the codebase.
* Reports regarding issues in deprecated or unsupported versions.

## Bug Bounty

At this time, Fake Checker does not offer a monetary bug bounty program for disclosed vulnerabilities. However, reporters will be openly credited and deeply thanked in release notes and advisories.

## Security Best Practices for Contributors

To keep the Ministry safe, all contributors must:
* **Pin Dependencies:** Ensure `package.json` locking is respected. Avoid introducing wildcard upgrades to NPM libraries without deep validation.
* **No Secrets in Source:** Never commit API keys, personal `.env` files, or sensitive logging output.
* **Sanitize Inputs:** Even though `cases.json` is a hardcoded internal string, treat incoming strings as untrusted if they render to the DOM without React's built-in JSX escaping.
