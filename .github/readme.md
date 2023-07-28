# How to build a pull request and deploy on Openshift Dev environment

## Register the redirect url on SSO Console

* Open a brower to https://bcgov.github.io/sso-requests
* My Dashboard -> My Projects: edit project "Zeva on Gold"
* Add a new redirect url for Development environment, https://zeva-dev-<pr number>.apps.silver.devops.gov.bc.ca/*
* Submit the change

Notes: the change may take about 20 minutes to be promoted to Zeva development environment on Openshift

## Add the build-on-dev to the end of pull request's title

The "Build PR on Dev" pipeline will be triggered when it identified pull request's title ends with "build-on-dev"

## Tear down the deployment of the pull reuqest

When the pull request is merged to the release branch, the pipeline "Teardown PR on Dev" will be triggered to undeploy the pull request on Dev. The splio configmaps and PVCs will still stay.


# Post production release

## Merge the tracking pull request and create the new release branch

* Squash merge the tracking pull request to master
* Create the release on GitHub from master branch
* Create the new release branch from master branch
* Change the new release branch as the default branch in the repo and update the branch protection rules https://github.com/bcgov/zeva/settings/branches


## Updates for the new release branch

* Update frontend/package.json version and create the new tracking pull request
* Update workflows/dev-build
  * name
  * on -> push -> branches
  * env -> PR_NUMBER
  * env -> VERSION
  * jobs -> call-unit-test -> with -> pr-number
* Update workflows/release-build
  * name
  * on -> push -> branches
  * env -> PR_NUMBER
  * env -> VERSION
  * jobs -> call-unit-test -> with -> pr-numb
* Notify the developers that the new release branch has been created, it is ready for the new pull requests

dddd

fff
dd
