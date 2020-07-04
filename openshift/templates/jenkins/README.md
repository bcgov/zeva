### How to build Jenkins image

* Create the base image used by jenkins-bc.yaml
    * oc tag registry.access.redhat.com/rhel7-atomic:7.7-371 tbiwaq-tools/rhel7-atomic:7.7-371

* Build Jenkins image to tools project
oc process -f jenkins/jenkins-bc.yaml | oc apply -f - -n tbiwaq-tools --dry-run=true

