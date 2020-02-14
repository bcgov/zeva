def backendDeployStage (String envName) {
    return {
        stage("Apply Backend Deployment Config on ${envName}") {
            timeout(30) {
                script {
                    def projectName
                    def ENV_NAME
                    def CPU_REQUEST
                    def CPU_LIMIT
                    def MEMORY_REQUEST
                    def MEMORY_LIMIT
                    if(envName == 'dev') {
                        projectName = 'tbiwaq-dev'
                        ENV_NAME = 'dev'
                        CPU_REQUEST='200m'
                        CPU_LIMIT='500m'
                        MEMORY_REQUEST='256Mi'
                        MEMORY_LIMIT='512Mi'
                    }
                    openshift.withProject("${projectName}") {
                        def backendDCYaml = openshift.process(readFile(file:'openshift/templates/backend/backend-dc-release.yaml'),
                            "-p",
                            "ENV_NAME=${ENV_NAME}",
                            "CPU_REQUEST=${CPU_REQUEST}",
                            "CPU_LIMIT=${CPU_LIMIT}",
                            "MEMORY_REQUEST=${MEMORY_REQUEST}",
                            "MEMORY_LIMIT=${MEMORY_LIMIT}"
                        )
                        openshift.apply(backendDCYaml)
                    }
                }
            }
        }
    }
}

def frontendDeployStage (String envName) {
    return {
        stage("Apply Frontend Deployment Config on ${envName}") {
            timeout(30) {
                script {
                    def projectName
                    def ENV_NAME
                    def CPU_REQUEST
                    def CPU_LIMIT
                    def MEMORY_REQUEST
                    def MEMORY_LIMIT
                    if(envName == 'dev') {
                        projectName = 'tbiwaq-dev'
                        ENV_NAME = 'dev'
                        DASH_ENV_NAME = '-dev'
                        CPU_REQUEST='100m'
                        CPU_LIMIT='400m'
                        MEMORY_REQUEST='256Mi'
                        MEMORY_LIMIT='512Mi'
                    }
                    openshift.withProject("${projectName}") {
                        def frontendDCYaml = openshift.process(readFile(file:'openshift/templates/frontend/frontend-dc-release.yaml'),
                                "-p",
                                "ENV_NAME=${ENV_NAME}",
                                "CPU_REQUEST=${CPU_REQUEST}",
                                "CPU_LIMIT=${CPU_LIMIT}",
                                "MEMORY_REQUEST=${MEMORY_REQUEST}",
                                "MEMORY_LIMIT=${MEMORY_LIMIT}"
                        )
                        openshift.apply(frontendDCYaml)
                    }
                }
            }
        }
    }
}


def envoyDeployStage (String envName) {
    return {
        stage("Apply Envoy Deployment Config on ${envName}") {
            timeout(30) {
                script {
                    def projectName
                    def ENV_NAME
                    def CPU_REQUEST
                    def CPU_LIMIT
                    def MEMORY_REQUEST
                    def MEMORY_LIMIT
                    if(envName == 'dev') {
                        projectName = 'tbiwaq-dev'
                        ENV_NAME = 'dev'
                        DASH_ENV_NAME = '-dev'
                        CPU_REQUEST='100m'
                        CPU_LIMIT='400m'
                        MEMORY_REQUEST='256Mi'
                        MEMORY_LIMIT='512Mi'
                    }
                    openshift.withProject("${projectName}") {
                        def envoyDCYaml = openshift.process(readFile(file:'openshift/templates/envoy/envoy-dc-release.yaml'),
                                "-p",
                                "ENV_NAME=${ENV_NAME}",
                                "CPU_REQUEST=${CPU_REQUEST}",
                                "CPU_LIMIT=${CPU_LIMIT}",
                                "MEMORY_REQUEST=${MEMORY_REQUEST}",
                                "MEMORY_LIMIT=${MEMORY_LIMIT}"
                        )
                        openshift.apply(envoyDCYaml)
                    }
                }
            }
        }
    }
}

def refreshSchemaspyStage(String envName, String releaseNumber) {
    return {
        stage('Refresh SchemaSpy') {
            timeout(30) {
                script {
                    def projectName
                    def ENV_NAME
                    if (envName == 'dev') {
                        ENV_NAME = 'dev'
                        projectName = 'tbiwaq-dev'
                    }
                    openshift.withProject("${projectName}") {
                        def schemaspyDCYaml = openshift.process(readFile(file: 'openshift/templates/schemaspy/schemaspy-dc-release.yaml'),
                                "-p",
                                "ENV_NAME=${ENV_NAME}",
                                "RELEASE_NUMBER=${releaseNumber}"
                        )
                        openshift.apply(schemaspyDCYaml)
                    }
                }
            }
        }
    }
}

return this
