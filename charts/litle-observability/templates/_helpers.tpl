{{/* Common labels for every LITLE observability resource. */}}
{{- define "litle-observability.labels" -}}
app.kubernetes.io/name: litle-observability
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/instance: {{ .Release.Name }}
litle.trust-fabric/federation: {{ .Values.litle.federationId | quote }}
{{- end -}}