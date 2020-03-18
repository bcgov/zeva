FROM rabbitmq:3.8.3-management
RUN apt-get update
RUN apt-get install -y gettext-base vim
RUN chgrp -R root /var/log/rabbitmq && \
    chmod -R g+w /var/log/rabbitmq
ARG ADMIN_PASSWORD
ARG ZEVA_PASSWORD
RUN echo "H4sICJOQcl4AA3BvbGljeS5qc29uALVUXUvDMBR991eU4pNsExwT8W0wH3zwAwcKipS7NG0CaTKS281t7L+bpO2Waet8WR9amnNyc87JTTZnkX1iDbMZx2RBteFKxrdRPBzcDIZxr4JLYwE7+uF/o2hTfy0koaCOD2nBZc33wByMWSqdOvB8PHm4f0yex9Pp29PLJKQxMIzLPAGRK82RFY5fy2lKJA3JMLgaXYfTEXKzW54b1IBKxzW+7XXrXdMFdMp9v3sdn1LtTqD/ftYpL5gyeCTmS6+7dfqc6oIbt38dNdwutln36+6LBwhRMuN5qf3Sg4sQWlr7LcOaQlqP/rEJjZJfTXNiKQd50S/CQOb0SOJSIc84AfTB/ksrruZ+agZSlRgiaWmbRTgQdUkDAEpUSUoF9U4yECZEuUSqJYgWCHReFlT6vtls2xtDCU6489lis9tFEwCDPghxeFbQ6fGd3IsCdzSzhxCrG2S/hj83/UKl1UVxUKvCzEqSPcFGUdi4STttBkhY3/C1I492jB/W7Xv7DXuVTdDcBAAA" | base64 -d | gunzip - | envsubst > /etc/rabbitmq/policy.json
