def buildStages(String envName, String zevaRelease) {
    def buildList = []
    def buildStages = [:]
    //buildStages.put('Build Frontend', prepareBuildFrontend(envName, zevaRelease))
    //buildStages.put('Build Backend', prepareBuildBackend(envName, zevaRelease))
    buildList.add(buildStages)
    return buildList
}

def prepareBuildFrontend(String envName, String zevaRelease) {
    return {
        stage('Build-Frontend') {
            timeout(30) {
                script {
                    openshift.withProject("tbiwaq-tools") {
                        def frontendyaml = openshift.process(readFile(file:'openshift/templates/frontend/frontend-bc-release.yaml'), '-p', "ZEVA_RELEASE=${zevaRelease}")
                        openshift.apply(frontendyaml)
                        def frontendBuildSelector = openshift.selector("bc", "frontend")
                        frontendBuildSelector.startBuild("--wait")
                    }
                } //end of script
            } //end of timeout
        }
    }
}

def prepareBuildBackend(String envName, String zevaRelease) {
    return {
        stage('Build-Backend') {
            timeout(30) {
                script {
                    openshift.withProject("tbiwaq-tools") {
                        def backendyaml = openshift.process(readFile(file:'openshift/templates/backend/backend-bc-release.yaml'), '-p', "ZEVA_RELEASE=${zevaRelease}")
                        openshift.apply(backendyaml)
                        def backendBuildSelector = openshift.selector("bc", "backend")
                        backendBuildSelector.startBuild("--wait")
                    }
                } //end of script
            } //end of timeout
        }
    }
}

def prepareBuildEnvoy(String envName, String zevaRelease) {
    return {
        stage('Build-Envoy') {
            timeout(30) {
                script {
                    openshift.withProject("tbiwaq-tools") {
                        def envoyyaml = openshift.process(readFile(file:'openshift/templates/envoy/envoy-bc-release.yaml'), '-p', "ENV_NAME=${envName}", "ZEVA_RELEASE=${zevaRelease}")
                        openshift.apply(envoyyaml)
                        def envoyBuildSelector = openshift.selector("bc", "envoy")
                        envoyBuildSelector.startBuild("--wait")
                    }
                } //end of script
            } //end of timeout
        }
    }
}
return this
