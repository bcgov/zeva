oc scale dc jenkins-slave-prod --replicas=0 --timeout=30s -n e52f12-tools
sleep 10s
oc scale dc jenkins-prod --replicas=0 --timeout=30s -n e52f12-tools
sleep 10s
oc scale dc jenkins-prod --replicas=1 --timeout=60s -n e52f12-tools
sleep 2m
oc scale dc jenkins-slave-prod --replicas=1 --timeout=60s -n e52f12-tools