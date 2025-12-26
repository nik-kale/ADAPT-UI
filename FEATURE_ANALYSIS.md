# ADAPT-UI Feature Discovery Analysis

> **Analysis Date:** December 26, 2025
> **Repository:** ADAPT-UI v5.0.0
> **Analyzed By:** Automated Architecture Review

---

## Executive Summary

This analysis identified **8 high-impact feature opportunities** across security, performance, observability, testing, and developer experience dimensions. The recommendations focus on incremental improvements implementable by a single developer in 1-5 days each.

---

## Priority Summary Table

| # | Feature | Category | Effort | Value | Priority Score |
|---|---------|----------|--------|-------|----------------|
| 1 | Add Security Headers & CSRF Protection | Security | Low | High | 3.0 |
| 2 | Fix Dependency Vulnerabilities | Security | Low | High | 3.0 |
| 3 | Optimize Graph Layout Performance | Performance | Medium | High | 1.5 |
| 4 | Standardize Structured Logging | Observability | Low | Medium | 2.0 |
| 5 | Add API Client Test Coverage | Testing | Medium | High | 1.5 |
| 6 | Create Generic useFetch Hook | Code Quality | Low | Medium | 2.0 |
| 7 | Add CONTRIBUTING.md & JSDoc Coverage | Documentation | Low | Medium | 2.0 |
| 8 | Add Global Error Handlers | Observability | Low | Medium | 2.0 |

**Priority Score Formula:** Value ÷ Effort (High=3, Medium=2, Low=1)

---

## Detailed Feature Requests

---

### Feature #1: Add Security Headers & CSRF Protection

**Category:** Security
**Effort:** Low (1-2 days)
**Value:** High
**Priority Score:** 3.0

#### Problem Statement

The Express server lacks essential security headers and CSRF protection. The current CORS configuration (`app.use(cors())`) allows all origins without restrictions, and no security headers are set. This leaves the application vulnerable to clickjacking, XSS, and cross-site request forgery attacks.

#### Proposed Solution

- [ ] Install and configure `helmet.js` for automatic security headers
- [ ] Implement CSRF token generation using `csurf` middleware
- [ ] Configure restrictive CORS policy with allowed origins from environment
- [ ] Add `SameSite=Strict` attribute to any cookies
- [ ] Add rate limiting using `express-rate-limit` on sensitive endpoints

#### Implementation Details

```javascript
// server/index.js additions
import helmet from 'helmet';
import csrf from 'csurf';
import rateLimit from 'express-rate-limit';

app.use(helmet());
app.use(csrf({ cookie: { sameSite: 'strict' } }));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);
```

#### Files to Modify

- `server/index.js` - Add middleware configuration
- `package.json` - Add helmet, csurf, express-rate-limit dependencies
- `.env.example` - Add ALLOWED_ORIGINS variable

#### Success Metrics

- All security headers present (verify with securityheaders.com)
- CSRF tokens validated on state-changing requests
- Rate limit triggers after threshold exceeded
- Zero OWASP Top 10 vulnerabilities in security scan

---

### Feature #2: Fix Dependency Vulnerabilities

**Category:** Security
**Effort:** Low (0.5-1 day)
**Value:** High
**Priority Score:** 3.0

#### Problem Statement

`npm audit` reports 26 vulnerabilities (2 high, 24 moderate). The high-severity issues include command injection in `glob` package and XSS in `vue-template-compiler` (transitive dependency via `vite-plugin-dts`). These pose active security risks to the build pipeline and development environment.

#### Proposed Solution

- [ ] Run `npm audit fix` to auto-fix compatible vulnerabilities
- [ ] Manually update `vite-plugin-dts` to version ≥4.1.0 (fixes vue-template-compiler chain)
- [ ] Update `glob` to latest version or switch to `fast-glob`
- [ ] Add `npm audit` check to CI pipeline
- [ ] Create `.npmrc` with `audit-level=high` to fail builds on high-severity issues

#### Implementation Details

```bash
# Immediate fixes
npm update glob
npm update vite-plugin-dts@latest

# Add to package.json scripts
"preinstall": "npm audit --audit-level=high",
"audit:fix": "npm audit fix"
```

#### Files to Modify

- `package.json` - Update dependencies, add audit scripts
- `package-lock.json` - Regenerate with updated versions
- `.npmrc` (new) - Add audit-level configuration

#### Success Metrics

- `npm audit` returns 0 high-severity vulnerabilities
- CI pipeline includes audit check
- Monthly dependency update cadence established

---

### Feature #3: Optimize Graph Layout Performance

**Category:** Performance
**Effort:** Medium (2-3 days)
**Value:** High
**Priority Score:** 1.5

#### Problem Statement

The graph layout algorithms have O(n²) complexity issues that cause UI freezes with large graphs (100+ nodes):
1. MiniMap uses `graph.nodes.find()` for every node (O(n) per node = O(n²) total)
2. Force layout has nested loops running 50 iterations × O(n²) calculations
3. Edge processing uses `findIndex()` inside forEach loops

These cause noticeable lag when rendering complex RCA graphs.

#### Proposed Solution

- [ ] Pre-compute node lookup Map before MiniMap rendering
- [ ] Replace `findIndex()` calls with pre-built index Maps in layout algorithms
- [ ] Move force-directed layout to Web Worker for non-blocking computation
- [ ] Add layout caching based on graph hash to avoid recalculation
- [ ] Implement progressive rendering for large graphs (show partial results)

#### Implementation Details

```typescript
// src/components/Graph/RCAGraphViewer.tsx - Pre-compute node map
const nodeColorMap = useMemo(() => {
  const map = new Map<string, string>();
  graph.nodes.forEach(n => map.set(n.id, getNodeColor(n.type)));
  return map;
}, [graph.nodes]);

// MiniMap now O(1) per node
nodeColor={(node) => nodeColorMap.get(node.id) || '#64748b'}

// src/utils/graphLayout.ts - Pre-compute indices
const nodeIndexMap = new Map(layoutNodes.map((n, i) => [n.id, i]));
// Replace findIndex with Map lookup - O(1) instead of O(n)
const sourceIdx = nodeIndexMap.get(edge.source);
```

#### Files to Modify

- `src/components/Graph/RCAGraphViewer.tsx` - Add nodeColorMap
- `src/utils/graphLayout.ts` - Optimize with index Maps, add Web Worker
- `src/utils/graphLayoutWorker.ts` (new) - Web Worker for force layout

#### Success Metrics

- Layout calculation time < 100ms for 200-node graphs
- No UI thread blocking during layout computation
- FPS maintains 60fps during pan/zoom on large graphs

---

### Feature #4: Standardize Structured Logging

**Category:** Observability
**Effort:** Low (1-2 days)
**Value:** Medium
**Priority Score:** 2.0

#### Problem Statement

The codebase has inconsistent logging: 66 raw `console.*` calls vs 40 structured `logger.*` calls. Services heavily use `console.log` without contextual metadata, making production debugging difficult. The existing logger utility (`src/utils/logger.ts`) is well-designed but underutilized.

#### Proposed Solution

- [ ] Replace all `console.log/warn/error` calls with structured logger
- [ ] Add component/service context to all log calls
- [ ] Implement log correlation IDs for request tracing
- [ ] Add structured error serialization (stack traces, error codes)
- [ ] Configure log output format for production (JSON) vs development (pretty)

#### Implementation Details

```typescript
// Before (services/RBACService.ts)
console.log('[RBAC] Initialized with 6 system roles');

// After
logger.info('RBAC initialized', {
  component: 'RBACService',
  action: 'init',
  roleCount: 6
});

// Add correlation ID to all requests
const correlationId = crypto.randomUUID();
logger.setContext({ correlationId });
```

#### Files to Modify

- `src/services/*.ts` - Replace 54 console calls with logger
- `src/utils/logger.ts` - Add correlation ID support, JSON format option
- `src/components/ErrorBoundary.tsx` - Use logger instead of console.error
- `server/index.js` - Add structured logging

#### Success Metrics

- Zero direct `console.*` calls in production code
- All logs include component, action, and timestamp
- Log aggregation tools can parse structured JSON output
- Correlation IDs link related log entries

---

### Feature #5: Add API Client Test Coverage

**Category:** Testing
**Effort:** Medium (2-3 days)
**Value:** High
**Priority Score:** 1.5

#### Problem Statement

The API client (`src/api/client.ts`, 403 lines) is the backbone of all data communication but has zero test coverage. Critical untested logic includes: retry mechanism with exponential backoff, HTTP error handling, Zod schema validation, and WebSocket connection management with reconnection logic.

#### Proposed Solution

- [ ] Create comprehensive test suite for AdaptAPIClient
- [ ] Install and configure MSW (Mock Service Worker) for API mocking
- [ ] Test retry logic with success/failure/max-retry scenarios
- [ ] Test WebSocket lifecycle (connect, message, error, close, reconnect)
- [ ] Test Zod validation error handling
- [ ] Add tests for race condition prevention (connection versioning)

#### Implementation Details

```typescript
// src/api/client.test.ts
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { AdaptAPIClient } from './client';

const server = setupServer(
  http.get('/api/incidents', () => HttpResponse.json([{ id: '1' }])),
  http.get('/api/incidents/:id', () => HttpResponse.networkError('Connection failed'))
);

describe('AdaptAPIClient', () => {
  it('retries failed requests with exponential backoff', async () => { });
  it('respects max retry attempts', async () => { });
  it('validates responses against Zod schemas', async () => { });
  it('handles WebSocket reconnection', async () => { });
});
```

#### Files to Create/Modify

- `src/api/client.test.ts` (new) - API client tests (~400 lines)
- `src/api/queries.test.ts` (new) - React Query hook tests (~300 lines)
- `src/test/mocks/handlers.ts` (new) - MSW request handlers
- `package.json` - Add msw dependency

#### Success Metrics

- API client coverage > 80%
- All retry scenarios tested
- WebSocket lifecycle fully tested
- CI runs tests on every PR

---

### Feature #6: Create Generic useFetch Hook

**Category:** Code Quality
**Effort:** Low (1 day)
**Value:** Medium
**Priority Score:** 2.0

#### Problem Statement

Five custom hooks (`useRCAGraph`, `useChat`, `useInsights`, `useRemediation`, `useTimeline`) duplicate the same fetch pattern: loading/error/data state management with nearly identical code. This creates maintenance burden where bug fixes must be applied in 5+ places.

#### Proposed Solution

- [ ] Create generic `useFetch<T>` hook with loading/error/data states
- [ ] Add AbortController support for cleanup on unmount
- [ ] Refactor existing hooks to use `useFetch` internally
- [ ] Add optional retry logic matching React Query behavior
- [ ] Include TypeScript generics for full type safety

#### Implementation Details

```typescript
// src/hooks/useFetch.ts
export function useFetch<T>(
  fetcher: (signal: AbortSignal) => Promise<ApiResponse<T>>,
  deps: DependencyList = []
): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    setState(s => ({ ...s, loading: true, error: null }));

    fetcher(controller.signal)
      .then(response => {
        if (response.success) setState({ data: response.data, loading: false, error: null });
        else setState({ data: null, loading: false, error: response.error?.message });
      })
      .catch(err => {
        if (!controller.signal.aborted) {
          setState({ data: null, loading: false, error: err.message });
        }
      });

    return () => controller.abort();
  }, deps);

  return state;
}

// Usage in useRCAGraph.ts
export const useRCAGraph = (incidentId: string) =>
  useFetch(() => defaultClient.getRCAGraph(incidentId), [incidentId]);
```

#### Files to Create/Modify

- `src/hooks/useFetch.ts` (new) - Generic fetch hook
- `src/hooks/useRCAGraph.ts` - Refactor to use useFetch
- `src/hooks/useChat.ts` - Refactor to use useFetch
- `src/hooks/useInsights.ts` - Refactor to use useFetch
- `src/hooks/useRemediation.ts` - Refactor to use useFetch
- `src/hooks/useTimeline.ts` - Refactor to use useFetch

#### Success Metrics

- 5 hooks reduced to ~5 lines each (from ~30 lines)
- Single source of truth for fetch logic
- AbortController properly cancels in-flight requests
- All existing functionality preserved

---

### Feature #7: Add CONTRIBUTING.md & JSDoc Coverage

**Category:** Documentation
**Effort:** Low (1-2 days)
**Value:** Medium
**Priority Score:** 2.0

#### Problem Statement

New contributors face friction due to missing contribution guidelines. The codebase has only 22% JSDoc coverage, with hooks and component props entirely undocumented. This increases onboarding time and leads to inconsistent code patterns.

#### Proposed Solution

- [ ] Create comprehensive CONTRIBUTING.md with development workflow
- [ ] Add JSDoc documentation to all 10 custom hooks
- [ ] Document all component prop interfaces with descriptions
- [ ] Add code examples to complex utilities (graphLayout, etc.)
- [ ] Create PR template with checklist

#### Implementation Details

```markdown
<!-- CONTRIBUTING.md structure -->
# Contributing to ADAPT-UI

## Development Setup
## Code Style Guidelines
## Commit Message Format
## Pull Request Process
## Adding New Components
## Adding New Hooks
## Testing Requirements
```

```typescript
// Hook documentation example
/**
 * Hook for managing RCA graph data with automatic fetching and caching.
 *
 * @param incidentId - The unique identifier for the incident to fetch
 * @returns Object containing graph data, loading state, and error state
 *
 * @example
 * ```tsx
 * const { graph, loading, error } = useRCAGraph('inc-123');
 * if (loading) return <Spinner />;
 * if (error) return <Error message={error} />;
 * return <RCAGraphViewer graph={graph} />;
 * ```
 */
export const useRCAGraph = (incidentId: string) => { ... }
```

#### Files to Create/Modify

- `CONTRIBUTING.md` (new) - Contribution guidelines
- `.github/PULL_REQUEST_TEMPLATE.md` (new) - PR template
- `src/hooks/*.ts` - Add JSDoc to all hooks
- `src/components/**/*.tsx` - Document prop interfaces
- `src/utils/graphLayout.ts` - Add algorithm documentation

#### Success Metrics

- New contributor can set up dev environment in < 15 minutes
- All hooks have @param, @returns, @example tags
- All component interfaces have property descriptions
- IDE shows helpful tooltips for all public APIs

---

### Feature #8: Add Global Error Handlers

**Category:** Observability
**Effort:** Low (1 day)
**Value:** Medium
**Priority Score:** 2.0

#### Problem Statement

The application lacks global error handlers for uncaught exceptions and unhandled promise rejections. Silent failures in async operations, WebSocket errors, and lazy loading failures go unnoticed, making production debugging difficult.

#### Proposed Solution

- [ ] Add `window.onerror` handler for uncaught exceptions
- [ ] Add `window.onunhandledrejection` for unhandled promises
- [ ] Integrate with structured logger for consistent error reporting
- [ ] Add error boundary at app root for React errors
- [ ] Prepare hook for external error tracking service (Sentry, etc.)

#### Implementation Details

```typescript
// src/utils/errorHandlers.ts
export function setupGlobalErrorHandlers() {
  window.onerror = (message, source, lineno, colno, error) => {
    logger.error('Uncaught exception', {
      component: 'global',
      action: 'uncaughtException',
      message: String(message),
      source,
      line: lineno,
      column: colno,
      stack: error?.stack,
    });
    // Hook for Sentry: Sentry.captureException(error);
    return false; // Let default handler run
  };

  window.onunhandledrejection = (event) => {
    logger.error('Unhandled promise rejection', {
      component: 'global',
      action: 'unhandledRejection',
      reason: event.reason?.message || String(event.reason),
      stack: event.reason?.stack,
    });
  };
}

// Call in main.tsx
setupGlobalErrorHandlers();
```

#### Files to Create/Modify

- `src/utils/errorHandlers.ts` (new) - Global error handlers
- `src/demo/main.tsx` - Call setupGlobalErrorHandlers
- `src/index.ts` - Export error handler setup
- `src/components/ErrorBoundary.tsx` - Add root-level boundary option

#### Success Metrics

- Zero silent failures in production
- All uncaught errors logged with context
- Error rate metrics available
- Ready for external error tracking integration

---

## Implementation Roadmap

### Week 1: Security & Quick Wins
- **Day 1-2:** Feature #1 (Security Headers) + Feature #2 (Dependencies)
- **Day 3:** Feature #4 (Logging Standardization)
- **Day 4-5:** Feature #6 (useFetch) + Feature #8 (Error Handlers)

### Week 2: Performance & Testing
- **Day 1-3:** Feature #3 (Graph Layout Optimization)
- **Day 4-5:** Feature #5 (API Client Tests) - Start

### Week 3: Testing & Documentation
- **Day 1-2:** Feature #5 (API Client Tests) - Complete
- **Day 3-5:** Feature #7 (Documentation)

---

## Appendix: Analysis Methodology

### Dimensions Analyzed
1. **Code Quality:** Pattern analysis, complexity metrics, duplication detection
2. **Security:** Dependency audit, authentication/authorization review, OWASP checks
3. **Observability:** Logging coverage, metrics instrumentation, error handling
4. **Documentation:** README completeness, JSDoc coverage, onboarding friction
5. **Testing:** Coverage analysis, test pattern review, gap identification
6. **Architecture:** Modularity assessment, scalability patterns, tech debt

### Tools Used
- `npm audit` for dependency vulnerabilities
- AST analysis for code pattern detection
- Manual code review for security assessment
- Line count analysis for coverage metrics

---

*Generated by automated repository analysis. Last updated: December 26, 2025*
