### Files included

* nagios-base-bc.yaml nagios base image build config
* nagios-bc.yaml nagios image build config
* nagios-dc.yaml nagios deployment config
* nagios-secret.yaml create nagios-secret

### Build and deploy nagios

1. Create nagios secret
oc process -f ./nagios-secret.yaml | oc create -f - -n [tools namespace]

2. Build nagios base image
oc create imagestream nagios-base -n [tools namespace]
oc process -f ./nagios-base-bc.yaml | oc create -f - -n [tools namespace]

3. Build nagios image
oc process -f ./nagios-bc.yaml | oc create -f - -n [tools namespace]

4. Deploy nagios 
oc process -f ./nagios-dc.yaml NAME=zeva \
ENV_NAME=prod \
NAGIOS_PVC_SIZE=2G \
 | oc create -f - -n [environment namespace]