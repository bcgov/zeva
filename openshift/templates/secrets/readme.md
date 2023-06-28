oc -n e52f12-tools create secret docker-registry zeva-image-pull-secret \
    --docker-server=registry.redhat.io \
    --docker-username=<RedHat Registry Service Account user>\
    --docker-password=<password> \
    --docker-email=<email>