# Openshift V4 Migration Plan

## Challenges:  
* Namespaces for V3 and V4 are different
* Production has been running on V3 and prod database needs to be migration from V3 to V4

## Status of Openshift V4 for Zeva

* All three environments are up and running with Pull Request 365.
* Jenkins is up and running with GitHub webhooks disabled, it is not being triggered by pull requests.
* The dependencies have been setup to support BCDK pipeline. They include secrets, network security policies, pre-required base images and etc.
* The infrastructure team has setup DNS record for production domain zeroemissionvehicles.gov.bc.ca. The matching certificate has been ordered. Once it is received, the production migration process can be started.

## Migration plan
### 1. Dev and Test migration
Dev and test will be migrated first at the early of the sprint. Once they are migrated, all development work can be tested on V4 but unfortunately the changes can't be moved to production until production is ready on V4.

A branch has created specifically for v4 migration. The changes for the migration are located under .jenkins-v4, .pipeline-v4, openshift-v4 and .yo-rc.json-v4 on the branch. Follow the below steps when migration begins, they are all based on Openshift V4
* Merge the pull requests as long as they are approved
* From the branch, copy the files over to the original locations and quickly scan the changes.
* Notify team Openshift V3 will be down
* Disable the GitHub webhooks to stop the notification to Jenkins on V3
* Run ".jenkins/.pipeline/npm run clean" to delete the Jenkins 365 deployment on tools project as Jenkins prod instance is up and running.
* Run ".pipeline/npm run clean" to delete pull request 365 deployment on dev
* Run ".pipeline/npm run deploy" to deploy an existing pull request.
* Load the test data to database.
* Enable the webhooks in Zeva repo to open the notification to Jenkins on V4
* Trigger the repo scan in Jenkins and verify if the pipeline is started. Only allow the Tracking PR gets deployed on Dev and terminate the other deployments.
* Create a test pull request and observe if pipeline is triggered to deploy this pull request on Dev
* If the deployment on Dev is successfully, go to Jenkins to let it deploy on Test
* Verify the deployment on Test

At this point, both Dev and Test migrations are completed. Team can start to use V4 Dev and Test URLs. Remember to showdown all Dev and Test apps on V3.

### 2. Production migration

Production migration is planned at the end of the sprint.

### 2.1 Production application migration
* Make sure database secrets are in sync between V3 and V4
* Make sure the certificate is received and approved domain name has been applied in the routes.
* Make sure no clients are using prod on V3 other than product owner.
* Ask product owner to screen shot few most recent transactions to be used to verify after migration completes.
* Notify the team that our production migration will begin and shutdown all production applications other than database and backup container on V3.
* Run ".pipeline/npm run clean" to delete the existing prod deployment on V4
* Run ".pipeline/npm run deploy" to deploy the current Tracking Pull Request to production.
* Apply the certificate to frontend route.
* Verify the deployment by browsing the home page. The alert should say you have no permission to access the app.

### 2.2 Production database Migration
* Shutdown the frontend pods on prod to make sure no one can reach the app.
* The database secrets should have been synced at previous step.
* Run a backup on backup container on V3, then shutdown patroni on V3
* Sync the backup to to the backup container on V4
* Restore the database from the back on backup container on V4, sample command is listed as below
    * ./backup.sh -r patroni-master-prod/zeva -f /backups/<the backup file>
* Login v4 patroni pod to verify the database
* Use backup container on V4 to run the first production backup
* Bring up the frontend pods on V4
* Ask product owner to verify the most recent transactions

At this point, production migration is completed.
