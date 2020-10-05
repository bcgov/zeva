### Files included

* minio-bc.yaml minio build config
* minio-dc.yaml minio deployment config
* minio-secret.yaml create template.minio-secret, it is NOT being used as minio creation is not part of pipeline anymore

### One minio instance serve all PRs on Dev

oc process -f ./minio-dc.yaml \
NAME=zeva SUFFIX=-dev OCP_NAME=pathfinder\
| oc create -f - -n tbiwaq-dev

#### Test and Prod Minio setup

oc process -f ./minio-dc.yaml \
NAME=zeva SUFFIX=-test OCP_NAME=pathfinder \
| oc create -f - -n tbiwaq-test


oc process -f ./minio-dc.yaml \
NAME=zeva SUFFIX=-prod  OCP_NAME=pathfinder\
| oc create -f - -n tbiwaq-prod