{{/*
Validate CloudNativePG postgres dependency configuration.
*/}}
{{- define "chartpack.validation.dependencies.postgres" -}}
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
{{- include "chartpack.validation.dependencies.backupCredentials" (dict "section" "backup" "type" (default "s3" $backup.type) "destinationPath" $backup.destinationPath "context" .) -}}
{{- end -}}

{{- /* Validate recovery */ -}}
{{- $recovery := default (dict) $pg.recovery -}}
{{- if $recovery.enabled -}}
{{- $recoveryType := default (default "s3" (default (dict) $pg.backup).type) $recovery.type -}}
{{- include "chartpack.validation.dependencies.backupCredentials" (dict "section" "recovery" "type" $recoveryType "destinationPath" $recovery.destinationPath "context" .) -}}
{{- $target := default (dict) $recovery.target -}}
{{- if not (or $target.targetTime $target.targetLSN $target.targetXID $target.targetName $target.targetImmediate) -}}
{{- fail "dependencies.postgres.recovery.target: at least one recovery target must be set (targetTime, targetLSN, targetXID, targetName, or targetImmediate)" -}}
{{- end -}}
{{- end -}}

{{- end -}}
{{- end }}

{{/*
Validate backup/recovery credentials for a given type.
Usage: {{ include "chartpack.validation.dependencies.backupCredentials" (dict "section" "backup" "type" "s3" "destinationPath" "" "context" .) }}
*/}}
{{- define "chartpack.validation.dependencies.backupCredentials" -}}
{{- $infra := default (dict) (default (dict) .context.Values.infraSettings).backups -}}

{{- if eq .type "s3" -}}
{{- $s3 := default (dict) $infra.s3 -}}
{{- $s3creds := default (dict) $s3.credentials -}}
{{- if and (not .destinationPath) (not $s3.bucket) -}}
{{- fail (printf "dependencies.postgres.%s: type 's3' requires infraSettings.backups.s3.bucket or an explicit destinationPath" .section) -}}
{{- end -}}
{{- if not $s3creds.secretName -}}
{{- fail (printf "dependencies.postgres.%s: type 's3' requires infraSettings.backups.s3.credentials.secretName" .section) -}}
{{- end -}}
{{- end -}}

{{- if eq .type "azure" -}}
{{- $az := default (dict) $infra.azure -}}
{{- $azcreds := default (dict) $az.credentials -}}
{{- if and (not .destinationPath) (not $az.storageAccount) -}}
{{- fail (printf "dependencies.postgres.%s: type 'azure' requires infraSettings.backups.azure.storageAccount or an explicit destinationPath" .section) -}}
{{- end -}}
{{- if not $azcreds.secretName -}}
{{- fail (printf "dependencies.postgres.%s: type 'azure' requires infraSettings.backups.azure.credentials.secretName" .section) -}}
{{- end -}}
{{- end -}}

{{- if eq .type "gcs" -}}
{{- $gcs := default (dict) $infra.gcs -}}
{{- $gcscreds := default (dict) $gcs.credentials -}}
{{- if and (not .destinationPath) (not $gcs.bucket) -}}
{{- fail (printf "dependencies.postgres.%s: type 'gcs' requires infraSettings.backups.gcs.bucket or an explicit destinationPath" .section) -}}
{{- end -}}
{{- if not $gcscreds.secretName -}}
{{- fail (printf "dependencies.postgres.%s: type 'gcs' requires infraSettings.backups.gcs.credentials.secretName" .section) -}}
{{- end -}}
{{- end -}}

{{- end }}
