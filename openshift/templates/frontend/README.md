### Files included

    * frontend-bc.yaml frontend build config
    * frontend-dc.yaml frontend deployment config
    * frontend-configmap.yaml it is mounted to frontend pod
    * frontend-autoscaler.yaml create backend frontend, it is not in pipeline and needs to run independently

### Before triggering pipeline

1. Create base image for frontend
    * oc tag registry.access.redhat.com/rhscl/rhscl/nodejs-10-rhel7:1-28 tbiwaq-tools/nodejs:10-1-28

### After pipeline completes

1. Create autoscaler for frontend
    * oc process -f ./frontend-autoscaler.yaml NAME=zeva SUFFIX= MIN_REPLICAS=2 MAX_REPLICA=5 | oc create -f - -n [namespace]
