{{/*
Create the name of the service account to use
*/}}
{{- define "chartpack.rbac.serviceAccountName" -}}
{{- if (default true (default (dict) (default (dict) .Values.rbac).serviceAccount).create) }}
{{- default (include "chartpack.fullname" .) .Values.rbac.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.rbac.serviceAccount.name }}
{{- end }}
{{- end }}
