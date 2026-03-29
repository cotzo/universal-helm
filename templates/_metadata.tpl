{{/*
Resource metadata builder.
Usage: {{ include "chartpack.metadata" (dict "name" "myname" "context" $ "extraLabels" (dict) "extraAnnotations" (dict)) }}
All fields except "context" are optional.
Set "clusterScoped" to true to omit namespace (for ClusterRole, ClusterRoleBinding, etc.).
Set "workload" to true to include Stakater Reloader annotations.
*/}}
{{- define "chartpack.metadata" -}}
{{- $ctx := .context }}
{{- $name := default (include "chartpack.fullname" $ctx) .name }}
metadata:
  name: {{ $name }}
  {{- if not .clusterScoped }}
  namespace: {{ $ctx.Release.Namespace | quote }}
  {{- end }}
  labels:
    {{- include "chartpack.labels" $ctx | nindent 4 }}
    {{- with .extraLabels }}
    {{- toYaml . | nindent 4 }}
    {{- end }}
  {{- $annotations := merge (dict) (default (dict) .extraAnnotations) (default (dict) $ctx.Values.global.annotations) }}
  {{- if .workload }}
  {{- $reloaderAnnotations := include "chartpack.reloaderAnnotations" $ctx | fromYaml }}
  {{- $annotations = merge $annotations $reloaderAnnotations }}
  {{- end }}
  {{- with $annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
{{- end }}

{{/*
Build Stakater Reloader annotations for workloads.
Returns a YAML dict with configmap.reloader.stakater.com/reload and/or
secret.reloader.stakater.com/reload listing chart-managed resources
that have reloaderEnabled (default: true).
Usage: {{ include "chartpack.reloaderAnnotations" . }}
*/}}
{{- define "chartpack.reloaderAnnotations" -}}
{{- $fullName := include "chartpack.fullname" . -}}
{{- $reloadCMs := list -}}
{{- $reloadSecrets := list -}}
{{- range $cmName, $cm := .Values.config.configMaps -}}
{{- if $cm -}}
  {{- if not (kindIs "invalid" $cm.reloaderEnabled) -}}
    {{- if $cm.reloaderEnabled -}}
      {{- $reloadCMs = append $reloadCMs (printf "%s-%s" $fullName $cmName) -}}
    {{- end -}}
  {{- else -}}
    {{- $reloadCMs = append $reloadCMs (printf "%s-%s" $fullName $cmName) -}}
  {{- end -}}
{{- end -}}
{{- end -}}
{{- range $sName, $s := .Values.config.secrets -}}
{{- if $s -}}
  {{- if not (kindIs "invalid" $s.reloaderEnabled) -}}
    {{- if $s.reloaderEnabled -}}
      {{- $reloadSecrets = append $reloadSecrets (printf "%s-%s" $fullName $sName) -}}
    {{- end -}}
  {{- else -}}
    {{- $reloadSecrets = append $reloadSecrets (printf "%s-%s" $fullName $sName) -}}
  {{- end -}}
{{- end -}}
{{- end -}}
{{- $result := dict -}}
{{- if $reloadCMs -}}
{{- $_ := set $result "configmap.reloader.stakater.com/reload" ($reloadCMs | join ",") -}}
{{- end -}}
{{- if $reloadSecrets -}}
{{- $_ := set $result "secret.reloader.stakater.com/reload" ($reloadSecrets | join ",") -}}
{{- end -}}
{{- toYaml $result -}}
{{- end }}
