# Synthetic Incident: Database Connection Pool Exhaustion

## Incident Overview

**ID:** inc-001
**Title:** Database Connection Pool Exhaustion
**Severity:** Critical
**Status:** Investigating
**Created:** 2024-01-15T10:30:00Z

## Description

Users experiencing widespread timeout errors (504 Gateway Timeout) when attempting to access the application. The issue began immediately following a deployment of user-service v2.4.0 to production.

## Affected Systems

- API Gateway
- User Service
- PostgreSQL Database (primary)

## Timeline of Events

| Time | Event | Type | Severity |
|------|-------|------|----------|
| 10:15 | Deployment: user-service v2.4.0 | Change | Info |
| 10:25 | Database CPU Usage Spike (40% → 75%) | Metric | Medium |
| 10:28 | Connection Pool Saturation Alert | Anomaly | High |
| 10:30 | High Error Rate Alert (>5% 504 errors) | Alert | Critical |
| 10:32 | Incident Created | Incident | Critical |

## Root Cause Analysis

### Symptoms
- 504 Gateway Timeout errors affecting 12% of requests
- Database connection attempts timing out
- Increased API response times (p95: 500ms → 3000ms)

### Hypotheses
1. **Connection Pool Exhaustion** (Confidence: 85%)
   - Pool may be saturated due to increased load or connection leaks

2. **Slow Query Performance** (Confidence: 70%)
   - Queries may be taking too long, blocking connections

### Tests Performed
1. ✅ Check database connection pool metrics
2. ✅ Analyze slow query logs for patterns
3. ✅ Review recent code changes

### Findings
1. **Pool at 100% Capacity** (Confidence: 95%)
   - All 50 connections in active use
   - New connection requests queuing for 2-5 seconds

2. **Long-Running Transactions** (Confidence: 90%)
   - 8 transactions running for >30 seconds
   - Transactions appear to be idle but holding connections
   - Pattern matches code introduced in v2.4.0

### Root Cause
The deployment of user-service v2.4.0 introduced a code change that opens database transactions for user profile updates but fails to properly close them in certain error paths. This causes connections to be held indefinitely until they timeout (default: 5 minutes).

## Remediation Plan

### Immediate Actions
1. **Increase Connection Pool Size** (Est: 5 min)
   - Scale pool from 50 → 100 connections
   - Provides immediate relief while addressing root cause
   - Risk: Increased database memory usage

2. **Implement Transaction Timeout** (Est: 10 min)
   - Add 10-second timeout for idle transactions
   - Prevents connections from being held indefinitely
   - Risk: May interrupt legitimate long operations

### Short-term Actions
3. **Monitor Pool Metrics** (Est: 15 min)
   - Verify pool utilization drops below 80%
   - Confirm error rate returns to normal (<0.5%)

4. **Add Connection Pool Alerts** (Est: 5 min)
   - Alert when pool utilization >80%
   - Early warning for future issues

### Long-term Actions
5. **Code Fix** (Est: 2 hours)
   - Review and fix transaction handling in user-service
   - Add proper error path cleanup
   - Include unit tests for transaction management

6. **Code Review Process** (Est: N/A)
   - Update review checklist to include transaction handling
   - Add automated linting for common patterns

## Expected Outcomes

After remediation:
- Error rate returns to <0.5%
- Connection pool utilization <70%
- API p95 response time <500ms
- No active incidents

## Lessons Learned

1. **Missing Test Coverage** - Transaction cleanup not covered by tests
2. **Insufficient Monitoring** - No alerts on connection pool utilization
3. **Rapid Deployment** - v2.4.0 deployed without canary rollout
4. **Code Review Gap** - Transaction handling not part of review checklist

## Prevention Measures

1. Add connection pool metrics to monitoring dashboard
2. Implement canary deployments for all services
3. Add automated tests for database transaction cleanup
4. Update code review guidelines
5. Add circuit breakers for database operations
