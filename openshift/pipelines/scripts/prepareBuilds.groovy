def buildStages(String envName, String zevaRelease) {
    def buildList = []
    def buildStages = [:]
    buildStages.put('Build Frontend', prepareBuildFrontend(envName, zevaRelease))
    buildList.add(buildStages)
    return buildList
}

def prepareBuildFrontend(String envName, String zevaRelease) {
    return {
        stage('Build-Frontend') {
            timeout(30) {
                script {
                    openshift.withProject("tbiwaq-tools") {
                        def frontendyaml = openshift.process(readFile(file:'openshift/templates/frontend/frontend-bc-release.yaml'), '-p', 'GIT_URL=https://github.com/bcgov/zeva.git', "GIT_REF=${zevaRelease}")
                        openshift.apply(frontendyaml)
                        def frontendBuildSelector = openshift.selector("bc", "frontend")
                        frontendBuildSelector.startBuild("--wait")
                    }
                } //end of script
            } //end of timeout
        }
    }
}

return this
