### 0.1.1

_Released 2025 Jun 29_

#### Fixes

- The action now correctly interprets responses when uploading bundles as text
  rather than JSON.
- The content type is now set explicitly for `application/gzip` bundles.


---

### 0.1.0

_Released 2025 Jun 27_

#### Overview

A set of [GitHub Actions](https://github.com/features/actions) to automate
publishing to Maven Central. Each action provides access to a primitive
operation for interacting with the [Portal Publisher API](https://central.sonatype.org/publish/publish-portal-api/)
of the new Central Portal.
