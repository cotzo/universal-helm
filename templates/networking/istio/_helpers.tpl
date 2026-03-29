{{/*
Rewrite route destinations: auto-prefix destination.host with fullname,
strip the "external" flag from output. Accepts a list of route rules
and returns the rewritten list as YAML.
Usage: {{ include "chartpack.networking.istio.rewriteRoutes" (dict "routes" .http "fullName" $fullName) }}
*/}}
{{- define "chartpack.networking.istio.rewriteRoutes" -}}
{{- $fullName := .fullName -}}
{{- range .routes }}
- {{- $rule := deepCopy . }}
  {{- if $rule.route }}
  {{- $newRoutes := list }}
  {{- range $rule.route }}
    {{- $r := deepCopy . }}
    {{- if and $r.destination (not $r.destination.external) }}
      {{- $_ := set $r.destination "host" (printf "%s-%s" $fullName $r.destination.host) }}
    {{- end }}
    {{- if $r.destination }}{{ $_ := unset $r.destination "external" }}{{ end }}
    {{- $newRoutes = append $newRoutes $r }}
  {{- end }}
  {{- $_ := set $rule "route" $newRoutes }}
  {{- end }}
  {{- toYaml $rule | nindent 4 }}
{{- end }}
{{- end }}
