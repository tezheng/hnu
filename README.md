# hnu

## Quick Start

### k8s deploy

dns setup

``` yaml
test:53 {
    errors
    cache 30
    forward . 192.168.64.5
}
```

``` bash
minikube cp fetch.db minikube:/data/database/fetchdb/fetch.db
minikube cp sync.db minikube:/data/database/syncdb/sync.db
kubectl apply --server-side -f manifest/setup
# add pod dependencies
kubectl apply -f services/fetch/activity/manifests/fetchact.yaml \
    -f services/fetch/database/manifests/fetchdb.yaml \
    -f services/sync/activity/manifests/syncact.yaml \
    -f services/sync/database/manifests/syncdb.yaml \
    -f apps/workflow/manifests/workflow.yaml
```
