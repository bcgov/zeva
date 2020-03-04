## Create Environment needed staff

### Tag postgresql-10-rhel7:1-47 from RedHad image repo to tools project
The image fixed database initialization issue. Zeva uses this image to create extension hstore and others.  
Command: oc tag registry.access.redhat.com/rhscl/postgresql-10-rhel7:1-47 tbiwaq-tools/postgresql:10-1-47

### Tag python-36-rhel7:1-63 to tools project
It fixed issues when reload operational and test data
oc tag registry.access.redhat.com/rhscl/python-36-rhel7:1-63 tbiwaq-tools/python:3.6-1-63

### Tag rhel7-atomic:77.371 which is used as Jenkins-Basic image
oc tag registry.access.redhat.com/rhel7-atomic:7.7-371 tbiwaq-tools/rhel7-atomic:7.7-371

### Update Jenkins build-master.yaml SOURCE_IMAGE_STREAM_NAMESPACE and SOURCE_IMAGE_STREAM_TAG
Trigger the .jenkins pipeline


