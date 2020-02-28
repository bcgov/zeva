FROM python:3.8-buster
LABEL io.openshift.s2i.scripts-url="image:///usr/libexec/s2i"
RUN chgrp -R root /opt/app-root/src \
    && chmod -R g+w /opt/app-root/src
USER 1001
