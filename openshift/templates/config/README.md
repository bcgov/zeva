### Files inlcuded
<<<<<<< HEAD
* configmap.yaml: the central configuration
=======
configmap.yaml: the central configuration
image-pull-secret.yaml: secret to pull image from registry.redhat.io

### Before triggering pipeline

oc -n tbiwaq-tools create secret docker-registry zeva-image-pull-secret \
    --docker-server=registry.redhat.io \
    --docker-username=<RedHat Registry Service Account user>\
    --docker-password=<password> \
    --docker-email=<email>
>>>>>>> release-1.6.0
