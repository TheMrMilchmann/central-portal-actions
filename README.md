# central-portal-actions

[![License](https://img.shields.io/badge/license-MIT-green.svg?style=for-the-badge&label=License)](https://github.com/TheMrMilchmann/central-portal-actions/blob/master/LICENSE)

A set of [GitHub Actions](https://github.com/features/actions) to automate
publishing to Maven Central. Each action provides access to a primitive
operation for interacting with the [Central Portal] via the [Portal Publisher
API](https://central.sonatype.org/publish/publish-portal-api/).


## Actions

Each action takes a "username" and a "password" input to authenticate against
the Central Portal. The username and password (or user token) can be managed in
the [Central Portal](https://central.sonatype.org/publish/generate-portal-token/).


### Upload Deployment

Creates a new deployment by uploading a bundle.

```yaml
steps:
  - id: upload 
    uses: TheMrMilchmann/central-portal-actions/upload-deployment@v1
    with:
      username: ...
      password: ...
      bundle: ...
      
outputs:
  deployment-id: ${{ steps.upload.outputs.deployment-id }}
```

By default, deployments are configured to automatically be published once they
have passed validation. In case where more control over publishing is required,
`publishing-type` may be set to `user-managed` instead. User-managed deployments
must be manually published. This can be done using the publish-deployment action
(below).


#### Inputs

| Input                | Description                                                                     | Default                           |
|----------------------|---------------------------------------------------------------------------------|-----------------------------------|
| `username`           | The username to use to authenticate against the Central Portal.                 |                                   |
| `password`           | The password to use to authenticate against the Central Portal.                 |                                   |
| `bundle`             | The path to the bundle to upload.                                               |                                   |
| `publishing-type`    | The strategy for publishing the deployment. One of: `automatic`, `user-managed` | `"automatic"`                     |
| `validation-timeout` | The time (in seconds) to wait for validation of the deployment before failing.  | `600`                             |
| `base-url`           | The base URL of the Central Portal.                                             | `"https://central.sonatype.com/"` |
| `name`               | An optional name for the deployment.                                            |                                   |

#### Outputs

| Output          | Description                             |
|-----------------|-----------------------------------------|
| `deployment-id` | The ID of the newly created deployment. |


### Publish Deployment

Publishes a deployment.

```yaml
steps:
  - uses:  TheMrMilchmann/central-portal-actions/publish-deployment@v1
    with:
      username: ...
      password: ...
      deployment-id: ...
```

#### Inputs

| Input           | Description                                                     | Default                           |
|-----------------|-----------------------------------------------------------------|-----------------------------------|
| `username`      | The username to use to authenticate against the Central Portal. |                                   |
| `password`      | The password to use to authenticate against the Central Portal. |                                   |
| `deployment-id` | The ID of the deployment.                                       |                                   |
| `base-url`      | The base URL of the Central Portal.                             | `"https://central.sonatype.com/"` |


### Drop Deployment

Drops a (not yet published) deployment.

```yaml
steps:
  - uses: TheMrMilchmann/central-portal-actions/drop-deployment@v1
    with:
      username: ...
      password: ...
      deployment-id: ...
```

#### Inputs

| Input           | Description                                                     | Default                           |
|-----------------|-----------------------------------------------------------------|-----------------------------------|
| `username`      | The username to use to authenticate against the Central Portal. |                                   |
| `password`      | The password to use to authenticate against the Central Portal. |                                   |
| `deployment-id` | The ID of the deployment.                                       |                                   |
| `base-url`      | The base URL of the Central Portal.                             | `"https://central.sonatype.com/"` |


## Versioning

This action is strictly following [SemVer 2.0.0](https://semver.org/spec/v2.0.0.html).
Thus, it is recommended to pin the action against specific MAJOR version. This
can be achieved by using the `v${MAJOR}` branch.

To get an overview about the action's versions, see the [changelog](docs/changelog/README.md).


## Credits & History

This set of actions is a continuation of [TheMrMilchmann/nexus-actions](https://github.com/TheMrMilchmann/nexus-actions)
updated to support publishing via the new Portal Publisher API.
The previous action was inspired by the [Gradle Nexus Publish Plugin](https://github.com/gradle-nexus/publish-plugin)
and the [GitHub Actions provided by the nexus-actions group](https://github.com/nexus-actions).
Since the former is limited in flexibility due to being a Gradle plugin and the
latter combines closing and promoting (which can be hindering), I decided to
create these actions. They expose the four primitive operations to interact with
staging Nexus repositories and optionally provide select handful shortcuts.


## License

```
Copyright (c) 2025 Leon Linhart

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
