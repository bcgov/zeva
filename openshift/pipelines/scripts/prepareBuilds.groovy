def buildStages(String envName, String zevaRelease) {
    print ("in buildStages")
    def buildList = []
    def buildStages = [:]
    buildStages.put('Build Frontend', prepareBuildFrontend(envName, zevaRelease))
    buildList.add(buildStages)
    print ("out buildStages")
    return buildList
}

def prepareBuildFrontend(String envName, String zevaRelease) {
    return {
        stage('Build-Frontend') {
            timeout(30) {
                script {
                    print ("in prepareBuildFrontend")
                    openshift.withProject("tbiwaq-tools") {
                        def frontendJson = openshift.process(readFile(file:'openshift/templates/frontend/frontend-bc-release.json'), "-p", "RELEASE=${zevaRelease}", 'GIT_URL=$https://github.com/bcgov/zeva.git', "GIT_REF=${RELEASE}")
                        openshift.apply(frontendJson)
                        def frontendBuildSelector = openshift.selector("bc", "frontend")
                        frontendBuildSelector.startBuild("--wait")
                        print ("out prepareBuildFrontend")
                    }
                } //end of script
            } //end of timeout
        }
    }
}
