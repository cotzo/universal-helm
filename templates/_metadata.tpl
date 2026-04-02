{{/*
Resource metadata builder.
Usage: {{ include "chartpack.metadata" (dict "name" "myname" "context" $ "extraLabels" (dict) "extraAnnotations" (dict)) }}
All fields except "context" are optional.
Set "clusterScoped" to true to omit namespace (for ClusterRole, ClusterRoleBinding, etc.).
Set "workload" to true to include Stakater Reloader annotations.
Set "syncWaveDefault" to assign a default Argo CD sync wave for this resource type.
Pass "syncWave" in extraAnnotations context (per-resource override) to override the default.
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
  {{- /* Argo CD sync wave: per-resource syncWave > auto wave (when enabled) */ -}}
  {{- if not (kindIs "invalid" .syncWave) }}
  {{- $_ := set $annotations "argocd.argoproj.io/sync-wave" (.syncWave | toString) }}
  {{- else if and $ctx.Values.argocd.syncWaves.enabled .syncWaveDefault }}
  {{- $_ := set $annotations "argocd.argoproj.io/sync-wave" (.syncWaveDefault | toString) }}
  {{- end }}
  {{- /* Argo CD sync options */ -}}
  {{- with $ctx.Values.argocd.syncOptions }}
  {{- $_ := set $annotations "argocd.argoproj.io/sync-options" (join "," .) }}
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
{{- /* Add dependency secrets to reloader */ -}}
{{- $pg := default (dict) .Values.dependencies.postgres -}}
{{- $pgInject := default (dict) $pg.inject -}}
{{- $pgInjectEnabled := true -}}
{{- if not (kindIs "invalid" $pgInject.enabled) }}{{ $pgInjectEnabled = $pgInject.enabled }}{{ end -}}
{{- if and $pg.enabled $pgInjectEnabled -}}
{{- $pgSecretName := include "chartpack.dependencies.postgres.appSecretName" . -}}
{{- $reloadSecrets = append $reloadSecrets $pgSecretName -}}
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
