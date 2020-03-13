FROM rabbitmq:3.7.7-management
RUN apt-get update
RUN apt-get install -y gettext-base
RUN chgrp -R root /var/log/rabbitmq
RUN chmod -R g+w /var/log/rabbitmq
ARG ADMIN_PASSWORD
ARG ZEVA_PASSWORD
RUN echo "H4sICMw/K14AA2RlZmluaXRpb25zLmpzb24AtVJNS8QwEL33V5TiSZYKii54K6wHD37ggoIiZbZN00CblGTSVUv/u0loG9jW9bSXQN6byXvzJl0QhpGE3Y5h2hKpmODRbRhdxet4Ha0sqZWBDfZhLmHYudPAHGpiKyGvGXeVDm5Aqb2QuaXOks3D/WP6nGy3b08vG19UgioZpylUVEiGZW2rBxPjA+lYpEq4vL7xzQhUTcJMoQQUMnJsv1r2+ENa+MPi+91rciqHgylzfrok21IoPBLlhfN50NQQWTNl97LQaXczH9Dp+AcnPBO8YFRLJxafe2JvRpyBkkA+YIvhjtoHH+BE4lMe5CsrgVNyJEcukBUsA3Sh/esMvxvXVgAXGj2ea7PwylIoNZlg0CjSnFTEuS6gUp5jHInkUM0IkFTXhLvtd70fKeiDX/VBJnKCAwAA" | base64 -d | gunzip - | envsubst > /etc/rabbitmq/definitions.json
RUN rabbitmqctl add_user admin ${ADMIN_PASSWORD} && \
    rabbitmqctl set_user_tags admin administrator && \
    rabbitmqctl add_user zeva ${ZEVA_PASSWORD} && \
    rabbitmqctl add_vhost /zeva