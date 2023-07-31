# How to build a pull request and deploy on Openshift Dev environment

## Register the redirect url on SSO Console

* Open a brower to https://bcgov.github.io/sso-requests
* My Dashboard -> My Projects: edit project "Zeva on Gold"
* Add a new redirect url for Development environment, https://zeva-dev-<pr number>.apps.silver.devops.gov.bc.ca/*
* Submit the change

Notes: the change may take about 20 minutes to be promoted to Zeva development environment on Openshift

## Add the build-on-dev to the end of pull request's title

The "Build PR on Dev" pipeline will be triggered when it identified pull request's title ends with "build-on-dev"

# Post production release

## Merge the tracking pull request and create the new release branch

* Squash merge the tracking pull request to master
* Create the release on GitHub from master branch
* Create the new release branch from master branch
* Change the new release branch as the default branch in the repo and update the branch protection rules https://github.com/bcgov/zeva/settings/branches

## Updates for the new release branch

* dev-build.yaml 
  * on -> push -> branches
  * env -> PR_NUMBER
  * env -> VERSION
  * jobs -> call-unit-test -> with -> pr-number
* Update frontend/package.json version and create the new tracking pull request
* Update release-build.yaml
  * name
  * on -> push -> branches
  * env -> PR_NUMBER
  * env -> VERSION
  * jobs -> call-unit-test -> with -> pr-numb

# Pipelines

## Primary Pipelines

* build-on-dev.yaml (Build PR on Dev): Build pull request if the string build-on-dev is appended at the end of pull request title
* dev-build.yaml (Dev Build 1.48.0): Every commit on the current release branch is automatically released to Dev.
* release-build.yaml (Release Build 1.48.0): This is a manually managed pipeline. It needs to be triggered manually to build the current release branch and deploy on Test and further on Prod.

## Other Pipelines

* cleanup-cron-workflow-runs.yaml (Scheduled cleanup old workflow runs): a cron job running periodically to cleanup old workflow runs
* cleanup-workflow-runs.yaml (Cleanup old workflow runs): manually cleanup the workflow runs
* emergency-release-build.yaml (Emergency Release Build 1.47.1): the pipeline built for emergency release 1.47.1
* pr-build-template.yaml (PR Build Template): a pipeline template for pull request build
* pr-lable.yaml (Label PR): ignore this one for now, it is automatically triggered after the pull request is merged or closed
* pr-teardown.yaml (Teardown PR on Dev): remove the deployed pull request on Dev
* release-build.yaml (Release Build 1.48.0): a pipeline to build release branch
* unit-test-template.yaml (Unit Test Template): a pipeline template for unit test
