{{/*
Resource metadata builder.
Usage: {{ include "universal-helm.metadata" (dict "name" "myname" "context" $ "extraLabels" (dict) "extraAnnotations" (dict)) }}
All fields except "context" are optional.
*/}}
{{- define "universal-helm.metadata" -}}
{{- $ctx := .context }}
{{- $name := default (include "universal-helm.fullname" $ctx) .name }}
metadata:
  name: {{ $name }}
  namespace: {{ $ctx.Release.Namespace | quote }}
  labels:
    {{- include "universal-helm.labels" $ctx | nindent 4 }}
    {{- with .extraLabels }}
    {{- toYaml . | nindent 4 }}
    {{- end }}
  {{- $annotations := merge (default (dict) .extraAnnotations) (default (dict) $ctx.Values.global.annotations) }}
  {{- with $annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
{{- end }}
