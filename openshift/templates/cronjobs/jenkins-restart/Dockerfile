FROM artifacts.developer.gov.bc.ca/docker-remote/debian:buster
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install supervisor vim net-tools curl git tzdata nano -y
RUN ln -fs /usr/share/zoneinfo/Canada/Pacific /etc/localtime \
    && dpkg-reconfigure --frontend noninteractive tzdata
COPY jenkins-restart.sh /bin
RUN chmod +x /bin/jenkins-restart.sh
RUN curl --silent -L -o /tmp/oc.tar https://downloads-openshift-console.apps.silver.devops.gov.bc.ca/amd64/linux/oc.tar
WORKDIR /tmp
RUN tar xf oc.tar
RUN cp oc /bin
