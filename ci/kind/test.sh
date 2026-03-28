#!/usr/bin/env bash
set -euo pipefail

CHART_DIR="."
NAMESPACE="chartpack-test"
FAILURES=0

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_pass() { echo -e "${GREEN}PASS${NC}: $1"; }
log_fail() { echo -e "${RED}FAIL${NC}: $1"; FAILURES=$((FAILURES + 1)); }
log_info() { echo -e "${YELLOW}INFO${NC}: $1"; }

kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

# Tier 1: Install and verify resources exist (all ci/ values files, no wait for pods)
tier1_test() {
  local name="$1" values_file="$2"
  shift 2
  local expected_kinds=("$@")

  log_info "Tier 1: Installing '$name' from $values_file"
  if ! helm install "$name" "$CHART_DIR" -n "$NAMESPACE" -f "$values_file" --wait=false --timeout 60s 2>&1; then
    log_fail "$name: helm install failed"
    return
  fi

  for kind in "${expected_kinds[@]}"; do
    if kubectl get "$kind" -n "$NAMESPACE" -l "app.kubernetes.io/instance=$name" -o name 2>/dev/null | grep -q .; then
      log_pass "$name: $kind exists"
    elif kubectl get "$kind" -n "$NAMESPACE" 2>/dev/null | grep -q "$name"; then
      log_pass "$name: $kind exists (name match)"
    else
      log_fail "$name: expected $kind not found"
    fi
  done

  helm uninstall "$name" -n "$NAMESPACE" --wait --timeout 60s 2>/dev/null || true
  sleep 2
}

# Tier 2: Install with real images and verify pods Ready/Complete
tier2_test() {
  local name="$1" values_file="$2" wait_condition="$3" timeout="${4:-120s}"

  log_info "Tier 2: Installing '$name' from $values_file (expecting $wait_condition)"
  local helm_args=(install "$name" "$CHART_DIR" -n "$NAMESPACE" -f "$values_file" --timeout "$timeout")
  [ "$wait_condition" != "none" ] && helm_args+=(--wait)

  if ! helm "${helm_args[@]}" 2>&1; then
    log_fail "$name: helm install failed"
    kubectl get pods -n "$NAMESPACE" -l "app.kubernetes.io/instance=$name" 2>/dev/null || true
    helm uninstall "$name" -n "$NAMESPACE" --wait --timeout 60s 2>/dev/null || true
    return
  fi

  if [ "$wait_condition" = "ready" ]; then
    local not_ready
    not_ready=$(kubectl get pods -n "$NAMESPACE" -l "app.kubernetes.io/instance=$name" --no-headers 2>/dev/null | grep -cv "Running\|Completed" || true)
    [ "$not_ready" -eq 0 ] && log_pass "$name: all pods running" || log_fail "$name: some pods not ready"
  elif [ "$wait_condition" = "complete" ]; then
    if kubectl wait --for=condition=complete job -n "$NAMESPACE" -l "app.kubernetes.io/instance=$name" --timeout=120s 2>/dev/null; then
      log_pass "$name: job completed"
    else
      log_fail "$name: job did not complete"
    fi
  fi

  helm uninstall "$name" -n "$NAMESPACE" --wait --timeout 60s 2>/dev/null || true
  sleep 2
}

echo "============================================"
echo "  Tier 1: Resource Creation Tests"
echo "============================================"

tier1_test "t1-deploy" "ci/deployment-values.yaml" deployment service configmap ingress horizontalpodautoscaler poddisruptionbudget serviceaccount
tier1_test "t1-sts" "ci/statefulset-values.yaml" statefulset service serviceaccount
tier1_test "t1-ds" "ci/daemonset-values.yaml" daemonset service serviceaccount
tier1_test "t1-cj" "ci/cronjob-values.yaml" cronjob secret serviceaccount
tier1_test "t1-job" "ci/job-values.yaml" job serviceaccount
tier1_test "t1-rollout" "ci/rollout-values.yaml" service horizontalpodautoscaler poddisruptionbudget serviceaccount
tier1_test "t1-keda" "ci/keda-values.yaml" deployment service serviceaccount
tier1_test "t1-sj" "ci/scaledjob-values.yaml" serviceaccount
tier1_test "t1-full" "ci/full-values.yaml" deployment service configmap secret ingress horizontalpodautoscaler poddisruptionbudget serviceaccount role rolebinding clusterrole clusterrolebinding persistentvolumeclaim

echo ""
echo "============================================"
echo "  Tier 2: Pod Readiness Tests"
echo "============================================"

tier2_test "t2-deploy" "ci/kind/deployment-values.yaml" "ready"
tier2_test "t2-sts" "ci/kind/statefulset-values.yaml" "ready"
tier2_test "t2-ds" "ci/kind/daemonset-values.yaml" "ready"
tier2_test "t2-cj" "ci/kind/cronjob-values.yaml" "none"
tier2_test "t2-job" "ci/kind/job-values.yaml" "complete"
tier2_test "t2-full" "ci/kind/full-values.yaml" "ready" "180s"

echo ""
echo "=============================="
if [ "$FAILURES" -gt 0 ]; then
  echo -e "${RED}$FAILURES test(s) failed${NC}"
  exit 1
else
  echo -e "${GREEN}All tests passed${NC}"
fi
