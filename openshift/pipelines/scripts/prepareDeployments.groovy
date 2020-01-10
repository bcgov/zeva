def frontendDeployStage (String envName) {
    return {
        stage("Apply Frontend Deployment Config on ${envName}") {
            timeout(30) {
                script {
                    def projectName
                    def ENV_NAME
                    def DASH_ENV_NAME
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
                        MEMORY_REQUEST='128Mi'
                        MEMORY_LIMIT='256Mi'
                    }
                    openshift.withProject("${projectName}") {
                        def frontendDCJson = openshift.process(readFile(file:'openshift/templates/frontend/frontend-dc-release.json'),
                            "-p",
                            "ENV_NAME=${ENV_NAME}",
                            "DASH_ENV_NAME=${DASH_ENV_NAME}",
                            "CPU_REQUEST=${CPU_REQUEST}",
                            "CPU_LIMIT=${CPU_LIMIT}",
                            "MEMORY_REQUEST=${MEMORY_REQUEST}",
                            "MEMORY_LIMIT=${MEMORY_LIMIT}"
                        )
                        openshift.apply(frontendDCJson)
                    }
                }
            }
        }
    }
}
