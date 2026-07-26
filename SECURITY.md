# Security Policy

## Scope

This is a static, client-only web app: it has no backend and no server-side storage. Diagram state lives entirely in the URL (compressed diagram source + theme) and in the visitor's own browser. The main security-relevant surfaces are:

- Compilation/rendering of user-supplied D2 diagram source (via `@terrastruct/d2`'s WASM build, running in a Web Worker)
- Third-party dependencies (npm packages, GitHub Actions)

## Reporting a Vulnerability

Please **do not** open a public issue for security vulnerabilities.

Instead, use GitHub's [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability) for this repository (**Security** tab → **Report a vulnerability**). This opens a private conversation with the maintainers before any details become public.

We'll do our best to acknowledge reports promptly, but please note this is an unofficial, community-maintained proof of concept without a formal SLA.

## Supported Versions

This project doesn't maintain multiple release branches — only the latest version deployed from `main` is supported. Fixes land as new commits/deployments rather than backported patches.
