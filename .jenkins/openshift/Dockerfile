FROM BuildConfig
USER 0
RUN fix_permission(){ while [[ $# > 0 ]] ; do chgrp -R 0 "$1" && chmod -R g=u "$1"; shift; done } && \
    set -x && \
    mkdir /opt/flywaydb && \
    curl -sSL https://repo1.maven.org/maven2/org/flywaydb/flyway-commandline/5.2.4/flyway-commandline-5.2.4-linux-x64.tar.gz | tar xvz --strip-components=1 -C /opt/flywaydb && \
    ln -s /opt/flywaydb/flyway /usr/local/bin && \
    mkdir /opt/liquibase && \
    curl -sSL https://github.com/liquibase/liquibase/releases/download/liquibase-parent-3.6.3/liquibase-3.6.3-bin.tar.gz | tar xvz -C /opt/liquibase --exclude=sdk --exclude=liquibase.bat && \
    ln -s /opt/liquibase/liquibase /usr/local/bin && \
    curl -sSL -o /tmp/sonnar-scanner-cli.zip https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-3.3.0.1492-linux.zip && \
    unzip /tmp/sonnar-scanner-cli.zip -d /tmp/sonnar-scanner-cli && \
    mv /tmp/sonnar-scanner-cli/sonar-scanner-3.3.0.1492-linux /opt/sonnar-scanner && \
    ln -s /opt/sonnar-scanner/bin/sonar-scanner /usr/local/bin && \
    rm -rf /tmp/sonnar-scanner-cli.zip && \
    rm -rf /tmp/sonnar-scanner-cli && \
    fix_permission '/opt/flywaydb' '/opt/liquibase' '/opt/sonnar-scanner'
USER 1001
