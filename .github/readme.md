# How to build a pull request and deploy on Openshift Dev environment

Sample of building pull request 1596

## Register the redirect url on SSO Console

* Open a brower to https://bcgov.github.io/sso-requests
* My Dashboard -> My Projects: edit project "Zeva on Gold"
* Add a new redirect url for Development environment, https://zeva-dev-1596.apps.silver.devops.gov.bc.ca/*
* Submit the change

Notes: the change may take about 20 minutes to be promoted to Zeva development environment on Openshift

## Create a new workflow on Github

* Create a new workflow in teh current release (release-1.47.0): click the "New Workflow" button under the Actions tab
* Name workflow file as <PR number>-build.yaml
* Copy and paste the content in build-1596.yaml to the new workflow file
* Update the following fields:
    * Name
    * jobs.call-pr-build.pr-number
    * jobs.call-pr-build.version

## Manually trigger the workflow created

* On the Actions tab, choose the new workflow and maunually run it
* It take a while to get the pr deployed on Zeva Dev
* The final url will be https://zeva-dev-<pr number>.apps.silver.devops.gov.bc.ca
* An issue will be created, please confirm with "yes" once the testing is done
* Finally the workflow will remove the deployment.