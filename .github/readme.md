# How to build a pull request and deploy on Openshift Dev environment

## Register the redirect url on SSO Console

- Open a brower to https://bcgov.github.io/sso-requests
- My Dashboard -> My Projects: edit project "Zeva on Gold"
- Add a new redirect url for Development environment, https://zeva-dev-<pr number>.apps.silver.devops.gov.bc.ca/\*
- Submit the change

Notes: the change may take about 20 minutes to be promoted to Zeva development environment on Openshift

# Pipelines

## Primary Pipelines

- dev-ci.yaml: Build the tracking pull request and delpoy on Dev
- test-ci.yaml: Tag the running images on Dev to Test and delpoy on Test
- prod-ci.yaml: Tag the running images on Test to Test and delpoy on Prod

## Other Pipelines

- cleanup-cron-workflow-runs.yaml (Scheduled cleanup old workflow runs): a cron job running periodically to cleanup old workflow runs
- cleanup-workflow-runs.yaml (Cleanup old workflow runs): manually cleanup the workflow runs
- emergency-release-build.yaml (Emergency Release Build 1.47.1): the pipeline built for emergency release 1.47.1

# Post production release

## Merge the tracking pull request and create the new release branch

- Squash and merge the tracking pull request to master
- Create the release on GitHub from master branch
- Create the new release branch from master branch (this is done automatically by pipeline create-release.yaml)
- Change the new release branch as the default branch in the repo and update the branch protection rules https://github.com/bcgov/zeva/settings/branches

## Updates for the new release branch

- Update frontend/package.json version in the new release branch
- Create the new tracking pull request to merge the nre release branch to master
