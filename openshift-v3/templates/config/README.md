### Files inlcuded
configmap.yaml: the central configuration

### Before triggering pipeline

oc -n tbiwaq-tools create secret docker-registry zeva-image-pull-secret \
    --docker-server=registry.redhat.io \
    --docker-username=<RedHat Registry Service Account user>\
    --docker-password=<password> \
    --docker-email=<email>
