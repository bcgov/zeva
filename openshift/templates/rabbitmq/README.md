### Files included

* rabbitmq-bc.yaml not being used
* rabbitmq-cluster-dc.yaml deployment config file
* rabbitmq-web-route.yaml create route to rabbitmq gui
* secret-template.yaml create template.rabbitmq-secret
* zeva-rabbitmq-secret not being used
* rabbitmq-secret-configmap-only.yaml, used when deploy dev, only create secret and configmap, save dev redource as Rabbitmq is not being used yet (20200921)

### Before triggering pipeline

1. Create template.rabbitmq-secret
oc process -f ./secret-template.yaml | oc create -f - -n [environment namespace]

### After pipeline completes

1. Create route for gui when needed, remove it when no longer need it
oc process -f ./rabbitmq-web-route.yaml NAME=zeva \
ENV_NAME=dev \
SUFFIX=-dev-133 \
| oc create -f - -n [environment namespace]
