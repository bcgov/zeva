### Files included  

    * backend-bc.yaml backend build config
    * backend-dc.yaml backend deployment config
    * django-secret-template.yaml create template.django-secret, it is not in pipeline and needs to run independently, it is used by backend-dc.yaml
    * backend-autoscaler.yaml create backend autoscaler, it is not in pipeline and needs to run independently

### Prepare for pipeline build and deploy  

#### Before triggering pipeline

1. Create base image used by backend registry.access.redhat.com/rhscl/python-36-rhel7:1-63
    * oc tag registry.access.redhat.com/rhscl/python-36-rhel7:1-63 e52f12-tools/python:3.6-1-63

2. Create template secret template.django-secret
    * oc process -f django-secret-template.yaml | oc create -f - -n [project namespace]

3. Create email service secret for each environment
    * oc process -f email-service-secret.yaml EMAIL_SERVICE_CLIENT_ID= EMAIL_SERVICE_CLIENT_SECRET= CHES_AUTH_URL= CHES_EMAIL_URL= | oc create -f - -n [env namespace]

#### After pipeline completes

1. After pipeline completes, create autoscaler for backend
    * oc process -f backend-autoscaler.yaml | oc create -f - -n [project namespace]

2. Add new separate pod for testing upload process
    * oc process -f upload-process-dc.yaml \
        NAME=zeva \
        SUFFIX=-test\
        VERSION=test-1.0.0 \
        ENV_NAME=test \
        BACKEND_HOST_NAME=zeva-backend-test.apps.silver.devops.gov.bc.ca \
        RABBITMQ_CLUSTER_NAME=rabbitmq-cluster
        CPU_REQUEST=200m \
        CPU_LIMIT=700m \
        MEMORY_REQUEST=2Gi \
        MEMORY_LIMIT=5Gi \
        HEALTH_CHECK_DELAY=30 \
        REPLICAS=1