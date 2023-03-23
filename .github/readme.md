# Changes needed for each release
* Update .github/workflows/helm-build.yaml
    * name
    * on->push->branches
    * env->PR_NUMBER
    * env->VERSION
* Update the frontend/package.json
    * version
* Update charts/zeva-apps/charts/zeva-backend/Chart.yaml and charts/zeva-apps/charts/zeva-frontend/Chart.yaml
    * version: this the is chart version, if there are any changes in the chart, this version should be updated
    * appVersion: the value should be the same as teh application version

# How to build single pull request

Create 1573-build.yaml
Create charts/zeva-apps/charts/zeva-backend/values-dev-1513.yaml
Create charts/zeva-apps/charts/zeva-frontend/values-dev-1513.yam
