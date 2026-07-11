# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.x     | :white_check_mark: |
| 1.x     | :x:                |

## Reporting a Vulnerability

Please **do not report security vulnerabilities through public GitHub issues.**

Instead, report them privately using
[GitHub's private vulnerability reporting](https://github.com/hamzamekk/react-native-turbo-preferences/security/advisories/new)
(Security tab → "Report a vulnerability"), or by email to
**hamza.mekkoudi@gmail.com** with the subject line `[SECURITY] react-native-turbo-preferences`.

Please include:

- A description of the vulnerability and its potential impact
- Steps to reproduce, or a proof of concept
- The affected version(s) and platform (iOS / Android)

You can expect an acknowledgement within 72 hours. Once the issue is confirmed,
a fix will be prepared and released as soon as practical, and you will be
credited in the advisory unless you prefer to remain anonymous.

## Scope

This library stores data in `NSUserDefaults` (iOS) and `SharedPreferences`
(Android). Note that these stores are **not encrypted** — they are not intended
for secrets such as tokens or passwords, and reports about that inherent
platform behavior are not considered vulnerabilities. Anything that allows
reading or writing data outside the configured store, crashes exploitable from
untrusted input, or supply-chain issues in the published package is in scope.
