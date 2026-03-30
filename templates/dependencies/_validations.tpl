{{/*
Validate dependencies configuration.
*/}}
{{- define "chartpack.validation.dependencies" -}}
{{- $pg := default (dict) .Values.dependencies.postgres -}}
{{- if $pg.enabled -}}

{{- /* Validate type */ -}}
{{- if and $pg.type (ne $pg.type "cloudnativepg") -}}
{{- fail (printf "dependencies.postgres.type: only 'cloudnativepg' is currently supported (got '%s')" $pg.type) -}}
{{- end -}}

{{- /* Validate instances */ -}}
{{- if and $pg.instances (lt (int $pg.instances) 1) -}}
{{- fail "dependencies.postgres.instances: must be >= 1" -}}
{{- end -}}

{{- /* Validate inject containers list */ -}}
{{- $inject := default (dict) $pg.inject -}}
{{- if not (kindIs "invalid" $inject.enabled) -}}
  {{- if and $inject.enabled (not $inject.containers) -}}
  {{- fail "dependencies.postgres.inject.containers: must specify at least one container name when inject is enabled (e.g. [app])" -}}
  {{- end -}}
{{- else -}}
  {{- if not $inject.containers -}}
  {{- fail "dependencies.postgres.inject.containers: must specify at least one container name when inject is enabled (e.g. [app])" -}}
  {{- end -}}
{{- end -}}

{{- /* Validate backup credentials */ -}}
{{- $backup := default (dict) $pg.backup -}}
{{- if $backup.enabled -}}
{{- $infra := default (dict) (default (dict) .Values.infraSettings).backups -}}

{{- if eq (default "s3" $backup.type) "s3" -}}
{{- $s3 := default (dict) $infra.s3 -}}
{{- $s3creds := default (dict) $s3.credentials -}}
{{- if and (not $backup.destinationPath) (not $s3.bucket) -}}
{{- fail "dependencies.postgres.backup: type 's3' requires infraSettings.backups.s3.bucket or an explicit backup.destinationPath" -}}
{{- end -}}
{{- if not $s3creds.secretName -}}
{{- fail "dependencies.postgres.backup: type 's3' requires infraSettings.backups.s3.credentials.secretName" -}}
{{- end -}}
{{- end -}}

{{- if eq (default "s3" $backup.type) "azure" -}}
{{- $az := default (dict) $infra.azure -}}
{{- $azcreds := default (dict) $az.credentials -}}
{{- if and (not $backup.destinationPath) (not $az.storageAccount) -}}
{{- fail "dependencies.postgres.backup: type 'azure' requires infraSettings.backups.azure.storageAccount or an explicit backup.destinationPath" -}}
{{- end -}}
{{- if not $azcreds.secretName -}}
{{- fail "dependencies.postgres.backup: type 'azure' requires infraSettings.backups.azure.credentials.secretName" -}}
{{- end -}}
{{- end -}}

{{- if eq (default "s3" $backup.type) "gcs" -}}
{{- $gcs := default (dict) $infra.gcs -}}
{{- $gcscreds := default (dict) $gcs.credentials -}}
{{- if and (not $backup.destinationPath) (not $gcs.bucket) -}}
{{- fail "dependencies.postgres.backup: type 'gcs' requires infraSettings.backups.gcs.bucket or an explicit backup.destinationPath" -}}
{{- end -}}
{{- if not $gcscreds.secretName -}}
{{- fail "dependencies.postgres.backup: type 'gcs' requires infraSettings.backups.gcs.credentials.secretName" -}}
{{- end -}}
{{- end -}}

{{- end -}}

{{- end -}}
{{- end }}
