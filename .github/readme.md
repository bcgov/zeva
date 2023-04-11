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

