FROM debian:jessie
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install vim net-tools curl nano -y
RUN ln -fs /usr/share/zoneinfo/Canada/Pacific /etc/localtime \
    && dpkg-reconfigure --frontend noninteractive tzdata
RUN curl --silent -L -o /tmp/oc.tar https://downloads-openshift-console.apps.silver.devops.gov.bc.ca/amd64/linux/oc.tar
WORKDIR /tmp
RUN tar xf oc.tar
RUN cp oc /bin
