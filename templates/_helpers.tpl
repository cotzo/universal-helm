{{/*
Expand the name of the chart.
*/}}
{{- define "chartpack.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "chartpack.fullname" -}}
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
{{- define "chartpack.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "chartpack.labels" -}}
helm.sh/chart: {{ include "chartpack.chart" . }}
{{ include "chartpack.selectorLabels" . }}
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
{{- define "chartpack.selectorLabels" -}}
app.kubernetes.io/name: {{ include "chartpack.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Resolve a ConfigMap name from the registry.
If the entry has `existing`, use that value as-is. Otherwise prefix with fullName.
Usage: {{ include "chartpack.resolveConfigMapName" (dict "name" $key "fullName" $fullName "configMaps" $.Values.config.configMaps) }}
*/}}
{{- define "chartpack.resolveConfigMapName" -}}
{{- $entry := index (default (dict) .configMaps) .name -}}
{{- if and $entry $entry.existing -}}
{{- $entry.existing -}}
{{- else -}}
{{- printf "%s-%s" .fullName .name -}}
{{- end -}}
{{- end }}

{{/*
Resolve a Secret name from the registry.
If the entry has `existing`, use that value as-is. Otherwise prefix with fullName.
Usage: {{ include "chartpack.resolveSecretName" (dict "name" $key "fullName" $fullName "secrets" $.Values.config.secrets) }}
*/}}
{{- define "chartpack.resolveSecretName" -}}
{{- $entry := index (default (dict) .secrets) .name -}}
{{- if and $entry $entry.existing -}}
{{- $entry.existing -}}
{{- else -}}
{{- printf "%s-%s" .fullName .name -}}
{{- end -}}
{{- end }}

