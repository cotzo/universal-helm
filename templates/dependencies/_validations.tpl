{{/*
Validate dependencies configuration.
Delegates to provider-specific validators.
*/}}
{{- define "chartpack.validation.dependencies" -}}
{{- include "chartpack.validation.dependencies.postgres" . -}}
{{- end }}
