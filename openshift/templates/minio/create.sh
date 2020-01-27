oc tag openshift/minio:stable minio:dev -n tbiwaq-dev
oc tag openshift/minio:stable minio:test -n tbiwaq-test
oc tag openshift/minio:stable minio:prod -n tbiwaq-prod

## Deploy on Dev
oc process -f ./minio-dc-release.yaml \
ENV_NAME=dev \
VOLUME_CAPACITY=5G \
CPU_REQUEST=100m \
CPU_LIMIT=300m \
MEMORY_REQUEST=50M \
MEMORY_LIMIT=500M \
| oc apply -n tbiwaq-dev -f - --dry-run=true
