# How to build a pull request and deploy on Openshift Dev environment

The workflows/build-1596.yaml is the sample workflow for the pull request 1596.

## Register the redirect url on SSO Console

* Open a brower to https://bcgov.github.io/sso-requests
* My Dashboard -> My Projects: edit project "Zeva on Gold"
* Add a new redirect url for Development environment, https://zeva-dev-<pr number>.apps.silver.devops.gov.bc.ca/*
* Submit the change

Notes: the change may take about 20 minutes to be promoted to Zeva development environment on Openshift

## Create a new workflow on Github

* Create a new workflow in the current release (release-1.47.0): click the "New Workflow" button under the Github Actions tab
* Name the workflow file as <PR number>-build.yaml
* Copy and paste the content in build-1596.yaml to the new workflow file
* Update the following fields:
    * Name
    * jobs.call-pr-build.pr-number
    * jobs.call-pr-build.version

## Trigger the workflow created

* On the Guthub Actions tab, choose the new workflow and maunually run it
* It takes a while to get the pull request deployed on Zeva Dev
* The final url will be https://zeva-dev-<pr number>.apps.silver.devops.gov.bc.ca
* An issue will be created, please confirm with "yes" once the testing is done
* Finally the workflow will tear down the deployment including the database cluster, but the Spilo configmaps and PVCs will still stay.

## Rebuild and redeploy the same pull request

Yes, you can. Just go through the same steps, a pull request can be built and deployed multiple times.
   
   TBD
