{{/*
Expand the name of the chart.
Add nameOverride key/valur pair in values file in order to override .Chart.Name
exmaple: 
    zeva-frontend.name: zeva-frontend
*/}}
{{- define "zeva-frontend.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
We can ingore this for now as we don't create service account
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "zeva-frontend.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
At the date of 20230317, zeva version 1.46.0, zeva-frontend.chart doesn't take an important role, we keep the value unchanged even the templates could be updated
Create chart name and version as used by the chart label.
*/}}
{{- define "zeva-frontend.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels:
Exaples
    app.kubernetes.io/name: zeva-frontend
    app.kubernetes.io/instance: zeva-frontend-dev or zeva-frontend-dev-1513
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/version: 1.46.0
    helm.sh/chart: zeva-frontend-1.0.0
*/}}
{{- define "zeva-frontend.labels" -}}
helm.sh/chart: {{ include "zeva-frontend.chart" . }}
{{ include "zeva-frontend.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
.Release.Name is the value when run helm install, for example: zeva-frontend-dev-1513
    helm install -n namespace zeva-frontend-dev-1513 ...
Selector labels:
    app.kubernetes.io/name: The name of the application, example mysql
    app.kubernetes.io/instance: A unique name identifying the instance of an application, example mysql-standard
for zeva releases, the above two values are same, for example:
    app.kubernetes.io/name: zeva-frontend
    app.kubernetes.io/instance: zeva-frontend-dev or zeva-frontend-dev-1513
*/}}
{{- define "zeva-frontend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "zeva-frontend.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "zeva-frontend.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "zeva-frontend.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}
