### Files included

* minio-bc.yaml minio build config
* minio-dc.yaml minio deployment config
* minio-secret.yaml create template.minio-secret, it is used by pipeline

### Before triggering pipeline

1. Create Minio base image 
oc tag registry.access.redhat.com/rhel7/rhel:7.7-481 tbiwaq-tools/rhel7:7.7-481  

2. Create minio template secret template.minio-secret
oc process -f minio-secret.yaml | oc creat -f - -n [namespace]
