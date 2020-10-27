FROM jenkins/core/there

USER 0
COPY ./contrib/jenkins/configuration/jobs/zeva $JENKINS_REF_HOME/jobs
COPY ./contrib/jenkins/configuration/jobs/_jenkins $JENKINS_REF_HOME/jobs

#RUN set -x && \
#    chgrp -R 0 $JENKINS_REF_HOME && \
#    chmod -R 644 $JENKINS_REF_HOME && \
#    chmod -R g+rwX $JENKINS_REF_HOME 

USER 1001
