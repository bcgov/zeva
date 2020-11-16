### Create secrets for each environment
oc process -f ./rabbitmq-secret.yaml ENV_NAME=dev ADMIN_PASSWORD=*** ZEVA_PASSWORD=*** | oc create -f - -n e52f12-tools --dry-run=true



### there are three images for rabbitmq, dev, test and prod
oc process -f ./rabbitmq-bc.yaml ENV_NAME=dev ADMIN_PASSWORD=*** ZEVA_PASSWORD=*** | oc apply -f - -n e52f12-tools --dry-run=true

### tag imag to environment
oc tag e52f12-tools/rabbitmq:latest e52f12-dev/rabbitmq:dev

### deployment
oc process -f ./rabbitmq-dc.yaml ENV_NAME=dev | oc apply -f - -n e52f12-dev
