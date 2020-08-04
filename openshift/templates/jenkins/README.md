### Build Jenkins base image

* Create the base image used by jenkins-bc.yaml
oc tag registry.access.redhat.com/rhel7-atomic:7.7-371 tbiwaq-tools/rhel7-atomic:7.7-371

* Build Jenkins base image to tools project
oc process -f openshift/templates/jenkins/jenkins-bc.yaml | oc apply -f - -n tbiwaq-tools --dry-run=true
Note: the base image is stored at tbiwaq-tools/bcgov-jenkins-basic:v2-20200303, update .jenkins/.pipeline/lib/build.js to use this image

* Create template.jenkins-github and template.jenkins-slave-user under tools project
oc process -f .jenkins/openshift/deplpy-prereq.yaml GH_USERNAME=*** GH_ACCESS_TOKEN=***
Note: the value of GH_ACCESS_TOKEN can go to github developer settings -> Personal access tokens to find "Used by Jenkins which setup for PR based Pipeline"

