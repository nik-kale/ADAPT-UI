# Quick Fixes Implementation Guide

These fixes can be implemented in under 1 hour and provide immediate value.

## 1. Fix TypeScript Configuration (2 minutes)

### File: `tsconfig.json`

**Before:**
```json
{
  "compilerOptions": {
    "noEmit": true,  // ❌ Broken
    // ...
  }
}
```

**After:**
```json
{
  "compilerOptions": {
    "noEmit": false,
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": false,
    // ...
  }
}
```

---

## 2. Remove Unused Dependencies (5 minutes)

### File: `package.json`

**Remove these lines:**
```json
{
  "dependencies": {
    "d3": "^7.8.5",              // ❌ Remove
    "d3-hierarchy": "^3.1.2",    // ❌ Remove
    "framer-motion": "^10.16.16", // ❌ Remove
    "recharts": "^2.10.3",       // ❌ Remove
    "clsx": "^2.0.0"             // ❌ Remove
  }
}
```

**Then run:**
```bash
npm install
```

**Savings:** ~500KB bundle size reduction!

---

## 3. Add Status Icon Fallback (2 minutes)

### File: `src/components/Graph/RCANode.tsx`

**Before:**
```typescript
const StatusIcon = statusIcons[data.status]; // ❌ Could be undefined

return (
  <StatusIcon size={16} ... />  // 💥 Crashes on unknown status
);
```

**After:**
```typescript
const StatusIcon = statusIcons[data.status] || AlertCircle; // ✅ Safe fallback

return (
  <StatusIcon size={16} ... />
);
```

---

## 4. Use Severity Color Utility (5 minutes)

### File: `src/components/Graph/RCANode.tsx`

**Before:**
```typescript
style={{
  backgroundColor: hexToRgba(
    data.severity === 'critical' ? '#dc2626' :
    data.severity === 'high' ? '#f59e0b' :
    data.severity === 'medium' ? '#eab308' :
    '#3b82f6',
    0.2
  ),
  color: data.severity === 'critical' ? '#dc2626' :
         data.severity === 'high' ? '#f59e0b' :
         data.severity === 'medium' ? '#eab308' :
         '#3b82f6',
}}
```

**After:**
```typescript
import { getSeverityColor } from '@utils/colors';

const severityColor = data.severity ? getSeverityColor(data.severity) : '#3b82f6';

style={{
  backgroundColor: hexToRgba(severityColor, 0.2),
  color: severityColor,
}}
```

---

## 5. Extract Magic Numbers (15 minutes)

### File: `src/utils/graphLayout.ts`

**Before:**
```typescript
const layerSpacing = 200;
const nodeSpacing = 150;
const startX = -totalWidth / 2 + 400;
```

**After:**

Create new file: `src/utils/constants.ts`
```typescript
export const GRAPH_LAYOUT = {
  HIERARCHICAL: {
    LAYER_SPACING: 200,
    NODE_SPACING: 150,
    CENTER_X: 400,
    START_Y: 100,
  },
  FORCE: {
    ITERATIONS: 10,
    REPULSION_FORCE: 1000,
    ATTRACTION_FORCE: 0.01,
    CENTER_X: 400,
    CENTER_Y: 300,
    INITIAL_SPREAD: 400,
  },
} as const;
```

Then use in `graphLayout.ts`:
```typescript
import { GRAPH_LAYOUT } from './constants';

const layerSpacing = GRAPH_LAYOUT.HIERARCHICAL.LAYER_SPACING;
const nodeSpacing = GRAPH_LAYOUT.HIERARCHICAL.NODE_SPACING;
const startX = -totalWidth / 2 + GRAPH_LAYOUT.HIERARCHICAL.CENTER_X;
```

---

## 6. Remove Production Console.logs (10 minutes)

### Create utility: `src/utils/logger.ts`

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) console.log(...args);
  },
  error: (...args: any[]) => {
    if (isDevelopment) console.error(...args);
  },
  warn: (...args: any[]) => {
    if (isDevelopment) console.warn(...args);
  },
};
```

### Replace in `src/api/client.ts`

**Before:**
```typescript
console.error('Failed to parse WebSocket message:', error);
console.error('WebSocket error:', error);
console.log('WebSocket connection closed');
```

**After:**
```typescript
import { logger } from '@utils/logger';

logger.error('Failed to parse WebSocket message:', error);
logger.error('WebSocket error:', error);
logger.log('WebSocket connection closed');
```

---

## 7. Fix WebSocket Path (10 minutes)

### File: `server/index.js`

**Before:**
```javascript
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  const incidentId = req.url?.split('/').pop();
  // ...
});
```

**After:**
```javascript
import { URL } from 'url';

const wss = new WebSocketServer({
  server,
  path: '/ws', // ✅ Add path filter
});

wss.on('connection', (ws, req) => {
  // ✅ Proper URL parsing
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const incidentId = pathParts[pathParts.length - 1]; // Gets 'inc-001' from '/ws/inc-001'

  console.log(`WebSocket client connected for incident: ${incidentId}`);

  if (!incidentId || incidentId === 'ws') {
    ws.close(1008, 'Missing incident ID');
    return;
  }

  // ... rest of code
});
```

---

## 8. Add Basic Error Boundary (15 minutes)

### Create: `src/components/ErrorBoundary.tsx`

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-adapt-bg-secondary rounded-lg border border-adapt-error p-8">
          <AlertTriangle size={48} className="text-adapt-error mb-4" />
          <h2 className="text-xl font-semibold text-adapt-text-primary mb-2">
            Something went wrong
          </h2>
          <p className="text-adapt-text-secondary mb-4 text-center max-w-md">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-adapt-primary text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Use in `src/demo/App.tsx`

```typescript
import { ErrorBoundary } from '@components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-adapt-bg-primary">
        {/* ... existing app code */}
      </div>
    </ErrorBoundary>
  );
}
```

Wrap individual tabs too:
```typescript
{activeTab === 'graph' && (
  <ErrorBoundary>
    <RCAGraphViewer graph={graph} ... />
  </ErrorBoundary>
)}
```

---

## Implementation Checklist

- [ ] Fix TypeScript configuration
- [ ] Remove unused dependencies (`npm uninstall d3 d3-hierarchy framer-motion recharts clsx`)
- [ ] Add status icon fallback
- [ ] Use severity color utility
- [ ] Extract magic numbers to constants
- [ ] Replace console.logs with logger utility
- [ ] Fix WebSocket path handling
- [ ] Add ErrorBoundary component and wrap app

**Total Time:** ~45-60 minutes
**Impact:** Immediate stability and bundle size improvements

---

## Testing Quick Fixes

After implementing:

```bash
# 1. Clean install
rm -rf node_modules package-lock.json
npm install

# 2. Build should work now
npm run build

# 3. Test demo
npm run dev:full

# 4. Check bundle size
npm run build
du -sh dist/
```

Expected results:
- ✅ TypeScript compiles without errors
- ✅ Bundle size reduced by ~500KB
- ✅ No console errors in browser
- ✅ WebSocket connects properly
- ✅ App doesn't crash on errors
