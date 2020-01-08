## Add role to users
oc policy add-role-to-user system:image-puller system:serviceaccount:tbiwaq-dev:default --namespace=tbiwaq-tools
oc policy add-role-to-user system:image-puller system:serviceaccount:tbiwaq-test:default --namespace=tbiwaq-tools
oc policy add-role-to-user system:image-puller system:serviceaccount:tbiwaq-prod:default --namespace=tbiwaq-tools

oc policy add-role-to-user admin system:serviceaccount:tbiwaq-tools:jenkins-prod --namespace=tbiwaq-dev
oc policy add-role-to-user admin system:serviceaccount:tbiwaq-tools:jenkins-prod --namespace=tbiwaq-test
oc policy add-role-to-user admin system:serviceaccount:tbiwaq-tools:jenkins-prod --namespace=tbiwaq-prod
