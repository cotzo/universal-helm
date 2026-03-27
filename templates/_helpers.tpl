{{/*
Expand the name of the chart.
*/}}
{{- define "universal-helm.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "universal-helm.fullname" -}}
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
Create chart name and version as used by the chart label.
*/}}
{{- define "universal-helm.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "universal-helm.labels" -}}
helm.sh/chart: {{ include "universal-helm.chart" . }}
{{ include "universal-helm.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- with .Values.global.labels }}
{{ toYaml . }}
{{- end }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "universal-helm.selectorLabels" -}}
app.kubernetes.io/name: {{ include "universal-helm.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "universal-helm.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "universal-helm.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Validate workloadType
*/}}
{{- define "universal-helm.validateWorkloadType" -}}
{{- $allowed := list "Deployment" "StatefulSet" "CronJob" "Job" "DaemonSet" }}
{{- if not (has .Values.workloadType $allowed) }}
{{- fail (printf "Invalid workloadType %q. Must be one of: %s" .Values.workloadType (join ", " $allowed)) }}
{{- end }}
{{- end }}

{{/*
Return the appropriate headless service name for StatefulSets
*/}}
{{- define "universal-helm.headlessServiceName" -}}
{{- if .Values.statefulSet.serviceName }}
{{- .Values.statefulSet.serviceName }}
{{- else }}
{{- printf "%s-headless" (include "universal-helm.fullname" .) }}
{{- end }}
{{- end }}

{{/*
Return the service name for a given service key.
Usage: {{ include "universal-helm.serviceName" (dict "key" "http" "context" $) }}
*/}}
{{- define "universal-helm.serviceName" -}}
{{- printf "%s-%s" (include "universal-helm.fullname" .context) .key }}
{{- end }}
