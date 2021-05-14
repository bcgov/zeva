### Build jenkins-restart image

oc process ./openshift/jenkins-restart-bc.yaml | oc create -f - -n e52f12-tools

### Create Service account jenkins-restart

### grant edit role to the service account otherwise oc command will fail

### Create the cron job by copy/paste the stuff in jenkins-restart-cron.yaml as Openshift Api can't create CronJob by using template yet.
