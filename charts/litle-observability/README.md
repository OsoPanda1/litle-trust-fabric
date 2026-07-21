# litle-observability

Umbrella Helm chart for the LITLE Trust Fabric observability kernel: a single
Grafana instance managed by the Grafana Operator, with data source adapters for
Postgres, MySQL, Elasticsearch, CloudWatch, PMM and Zabbix. Every dashboard
template and alert rule is keyed by `litle_id` and `litle_federation` so
observability data can be traced back to the Evidence DAG.

## Install

```bash
helm upgrade -i litle-observability charts/litle-observability \
  -n observability --create-namespace \
  -f charts/litle-observability/values-fed3.yaml
```

## Secrets

`values.yaml` only references secret *names*. Provision the actual material via
SealedSecrets or ExternalSecrets before the release syncs:

- `grafana-admin` → `password`
- `grafana-oidc` → `clientSecret` (if `grafana.oidc.enabled=true`)
- `litle-core-db`, `mysql-legacy-db`, `zabbix-creds` → `password`
- `aws-cloudwatch-creds` → `accessKey`, `secretKey`

## Federations

`values-fed1.yaml` … `values-fed3.yaml` show the pattern for TAMV federations.
Add one file per federation and one ArgoCD Application per cluster.

## GitOps

See `gitops/argocd/root-app.yaml` for the ApplicationSet that materialises this
chart across `dev`, `prod-eu` and `prod-us` clusters.