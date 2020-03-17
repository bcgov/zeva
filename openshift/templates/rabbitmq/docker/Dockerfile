FROM rabbitmq:3.8.3-management
RUN apt-get update
RUN apt-get install -y gettext-base vim
RUN chgrp -R root /var/log/rabbitmq && \
    chmod -R g+w /var/log/rabbitmq
COPY rabbitmq.conf /etc/rabbitmq/
ARG ADMIN_PASSWORD
ARG ZEVA_PASSWORD
RUN echo "H4sICPk7bV4AA2RlZmluaXRpb25zLmpzb24AtZJNS8QwEIbv/opSPMmygosi3grrwYMfuKCgSJlt0zTQJiWZdNXS/24S0zWLretle2jIPPPxzmS6o8h8sYT1mmHaEqmY4PFVFC/ml/NFPPvGWhlgrK/uGkWdPw3iUBPrD3nNuPd3oAGlNkLmFh4ny9ubu/QhWa2e7x+XoVsJqmScplBRIRmWtfX3coYU6eCkSjg7vwjDEajalmcKJaCQsef9bFrvJ2lhUu7L9VNySLVbge5881NuS6Fwz5hPne7R8IbImin7fhM57CuOte7q/iQPSCZ4waiWrvT8JEQb0/6IWRLIvfWPRxiU/FqaA0vZmRd5z0rglOyZOBfICpYBusH+Syt+NC60AC40hiTXZlkqC1FqEgDQKNKcVMR1UkClQso4EsmhGkEgqa4Jd3vT9buNmn//BY7MXjbhAwAA" | base64 -d | gunzip - | envsubst > /etc/rabbitmq/policy.json
