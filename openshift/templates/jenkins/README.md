### Build Jenkins base image

for pathfinder: 
    NAMESPACE_PREFIX=tbiwaq

for Openshift v4: 
    NAMESPACE_PREFIX=e52f12

* Create the base image used by jenkins-bc.yaml, NOTEs: didn't run it when setup in Openshift v4
oc tag registry.access.redhat.com/rhel7-atomic:7.7-371 e52f12-tools/rhel7-atomic:7.7-371

* Build Jenkins base image to tools project
oc process -f openshift/templates/jenkins/jenkins-bc.yaml | oc apply -f - -n e52f12-tools --dry-run=client
Note: the base image is stored at e52f12-tools/bcgov-jenkins-basic:v2-20201021, update .jenkins/.pipeline/lib/build.js to use this image

* Create template.jenkins-github and template.jenkins-slave-user under tools project
oc process -f .jenkins/openshift/deploy-prereq.yaml GH_USERNAME=*** GH_ACCESS_TOKEN=*** | oc create -f - -n e52f12-tools
Note: the value of GH_ACCESS_TOKEN can go to github developer settings -> Personal access tokens to find "Used by Jenkins which setup for PR based Pipeline"

