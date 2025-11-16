# Theming Guide

Comprehensive guide to customizing the look and feel of ADAPT-UI components.

## Default Theme

ADAPT-UI ships with a dark theme optimized for dashboard and monitoring interfaces.

### Color Palette

```css
/* Primary Colors */
--adapt-primary: #3b82f6;      /* Blue - primary actions */
--adapt-secondary: #8b5cf6;    /* Purple - secondary elements */
--adapt-success: #10b981;      /* Green - success states */
--adapt-warning: #f59e0b;      /* Orange - warnings */
--adapt-error: #ef4444;        /* Red - errors */
--adapt-info: #06b6d4;         /* Cyan - info */

/* Background Colors */
--adapt-bg-primary: #0f172a;   /* Darkest - main background */
--adapt-bg-secondary: #1e293b; /* Medium - cards, panels */
--adapt-bg-tertiary: #334155;  /* Lighter - inputs, hover states */

/* Text Colors */
--adapt-text-primary: #f1f5f9;   /* Brightest - headings */
--adapt-text-secondary: #cbd5e1; /* Medium - body text */
--adapt-text-muted: #94a3b8;     /* Dimmed - labels, meta */

/* Border Colors */
--adapt-border: #475569;         /* Default borders */

/* Graph Node Colors */
--graph-symptom: #ef4444;        /* Red */
--graph-hypothesis: #f59e0b;     /* Orange */
--graph-test: #06b6d4;           /* Cyan */
--graph-finding: #8b5cf6;        /* Purple */
--graph-remediation: #10b981;    /* Green */
--graph-node: #64748b;           /* Slate - default */
--graph-edge: #475569;           /* Edge color */
```

## Customizing Themes

### Method 1: Tailwind Config (Recommended)

Extend the Tailwind configuration in your project:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        adapt: {
          primary: '#6366f1',      // Custom indigo
          secondary: '#ec4899',    // Custom pink
          success: '#22c55e',
          warning: '#fb923c',
          error: '#f43f5e',
          bg: {
            primary: '#0a0a0a',
            secondary: '#1a1a1a',
            tertiary: '#2a2a2a',
          },
          text: {
            primary: '#ffffff',
            secondary: '#d1d5db',
            muted: '#9ca3af',
          },
          border: '#404040',
        },
        graph: {
          symptom: '#f87171',
          hypothesis: '#fb923c',
          test: '#38bdf8',
          finding: '#a78bfa',
          remediation: '#4ade80',
        },
      },
    },
  },
};
```

### Method 2: CSS Variables

Override CSS variables in your global styles:

```css
/* styles/custom-theme.css */
:root {
  /* Override primary color */
  --adapt-primary: #6366f1;
  --adapt-secondary: #ec4899;

  /* Override backgrounds */
  --adapt-bg-primary: #0a0a0a;
  --adapt-bg-secondary: #1a1a1a;

  /* Override graph colors */
  --graph-symptom: #f87171;
  --graph-finding: #a78bfa;
}
```

Then import in your app:

```typescript
import '@adapt/ui-toolkit/styles';
import './styles/custom-theme.css';
```

### Method 3: Component-Level Config

Pass custom styles to individual components:

```tsx
<RCAGraphViewer
  graph={graph}
  config={{
    customStyles: {
      backgroundColor: '#000000',
      borderColor: '#333333',
    }
  }}
/>
```

## Light Theme

Create a light theme variant:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        adapt: {
          primary: '#2563eb',
          secondary: '#7c3aed',
          bg: {
            primary: '#ffffff',
            secondary: '#f8fafc',
            tertiary: '#e2e8f0',
          },
          text: {
            primary: '#0f172a',
            secondary: '#475569',
            muted: '#64748b',
          },
          border: '#cbd5e1',
        },
      },
    },
  },
};
```

Or with CSS variables:

```css
/* Light theme */
.theme-light {
  --adapt-primary: #2563eb;
  --adapt-bg-primary: #ffffff;
  --adapt-bg-secondary: #f8fafc;
  --adapt-bg-tertiary: #e2e8f0;
  --adapt-text-primary: #0f172a;
  --adapt-text-secondary: #475569;
  --adapt-text-muted: #64748b;
  --adapt-border: #cbd5e1;
}
```

```tsx
<div className="theme-light">
  <RCAGraphViewer graph={graph} />
</div>
```

## Brand-Specific Themes

### Example: Company Brand Colors

```javascript
// Brand: Acme Corp
const acmeTheme = {
  colors: {
    adapt: {
      primary: '#ff6b35',      // Acme Orange
      secondary: '#004e89',    // Acme Blue
      success: '#06a77d',
      warning: '#ffaa00',
      error: '#d62828',
      bg: {
        primary: '#1a1a2e',
        secondary: '#16213e',
        tertiary: '#0f3460',
      },
      text: {
        primary: '#edf2f4',
        secondary: '#8d99ae',
        muted: '#6c757d',
      },
      border: '#2b2d42',
    },
  },
};
```

### Example: Monitoring Platform Integration

```javascript
// Match Datadog dark theme
const datadogTheme = {
  colors: {
    adapt: {
      primary: '#632ca6',      // Datadog purple
      secondary: '#00b3e6',
      bg: {
        primary: '#0d0d0d',
        secondary: '#1f1f1f',
        tertiary: '#2f2f2f',
      },
      text: {
        primary: '#f5f5f5',
        secondary: '#b3b3b3',
        muted: '#808080',
      },
    },
  },
};
```

## Dynamic Theme Switching

### Toggle Between Light/Dark

```tsx
import { useState } from 'react';

function App() {
  const [theme, setTheme] = useState('dark');

  return (
    <div className={`theme-${theme}`}>
      <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        Toggle Theme
      </button>
      <RCAGraphViewer graph={graph} />
    </div>
  );
}
```

### System Preference

```tsx
import { useEffect, useState } from 'react';

function useSystemTheme() {
  const [theme, setTheme] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setTheme(e.matches ? 'dark' : 'light');

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return theme;
}

function App() {
  const theme = useSystemTheme();

  return (
    <div className={`theme-${theme}`}>
      <RCAGraphViewer graph={graph} />
    </div>
  );
}
```

## Node Type Colors

Customize colors for different node types in the RCA graph:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        graph: {
          symptom: '#ff4757',        // Custom red
          hypothesis: '#ffa502',     // Custom orange
          test: '#1e90ff',           // Custom blue
          finding: '#9c88ff',        // Custom purple
          remediation: '#2ed573',    // Custom green
          dependency: '#747d8c',     // Custom gray
        },
      },
    },
  },
};
```

## Severity Colors

Customize severity indicators:

```css
:root {
  --severity-critical: #dc2626;
  --severity-high: #f59e0b;
  --severity-medium: #eab308;
  --severity-low: #3b82f6;
  --severity-info: #06b6d4;
}
```

## Typography

### Font Families

```css
/* Custom fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'Fira Code', 'Consolas', monospace;
}

body {
  font-family: var(--font-sans);
}

code, pre {
  font-family: var(--font-mono);
}
```

### Font Sizes

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    fontSize: {
      'xs': '0.75rem',
      'sm': '0.875rem',
      'base': '1rem',
      'lg': '1.125rem',
      'xl': '1.25rem',
      '2xl': '1.5rem',
    },
  },
};
```

## Spacing & Sizing

### Component Sizing

```tsx
// Compact variant
<RCAGraphViewer
  graph={graph}
  config={{
    nodeSize: 'small',
    height: '400px',
  }}
/>

// Large variant
<RCAGraphViewer
  graph={graph}
  config={{
    nodeSize: 'large',
    height: '800px',
  }}
/>
```

### Custom Spacing

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    spacing: {
      'xs': '0.25rem',
      'sm': '0.5rem',
      'md': '1rem',
      'lg': '1.5rem',
      'xl': '2rem',
    },
  },
};
```

## Animations

### Custom Animations

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
};
```

### Disable Animations

```css
/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Border Radius

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    borderRadius: {
      'none': '0',
      'sm': '0.25rem',
      'md': '0.5rem',
      'lg': '0.75rem',
      'xl': '1rem',
      'full': '9999px',
    },
  },
};
```

## Shadows

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    boxShadow: {
      'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
    },
  },
};
```

## Component-Specific Theming

### Graph Viewer

```tsx
<RCAGraphViewer
  graph={graph}
  config={{
    customStyles: {
      backgroundColor: '#1a1a2e',
      nodeColor: {
        symptom: '#ff6b6b',
        hypothesis: '#feca57',
        test: '#48dbfb',
        finding: '#ff9ff3',
        remediation: '#1dd1a1',
      },
      edgeColor: '#485460',
      miniMapBg: 'rgba(26, 26, 46, 0.9)',
    },
  }}
/>
```

### Timeline Viewer

```tsx
<TimelineViewer
  timeline={timeline}
  config={{
    customStyles: {
      eventCardBg: '#2d3436',
      timelineLinColor: '#636e72',
      severityColors: {
        critical: '#d63031',
        high: '#fd79a8',
        medium: '#fdcb6e',
        low: '#74b9ff',
      },
    },
  }}
/>
```

## CSS-in-JS Integration

### Styled Components

```tsx
import styled from 'styled-components';

const ThemedContainer = styled.div`
  --adapt-primary: ${props => props.theme.primary};
  --adapt-bg-primary: ${props => props.theme.bgPrimary};
`;

function App() {
  return (
    <ThemeProvider theme={myTheme}>
      <ThemedContainer>
        <RCAGraphViewer graph={graph} />
      </ThemedContainer>
    </ThemeProvider>
  );
}
```

### Emotion

```tsx
import { ThemeProvider } from '@emotion/react';

const theme = {
  colors: {
    primary: '#6366f1',
    bg: '#0a0a0a',
  },
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div css={{
        '--adapt-primary': theme.colors.primary,
        '--adapt-bg-primary': theme.colors.bg,
      }}>
        <RCAGraphViewer graph={graph} />
      </div>
    </ThemeProvider>
  );
}
```

## Best Practices

1. **Maintain Contrast** - Ensure text is readable on backgrounds
2. **Consistent Spacing** - Use a consistent spacing scale
3. **Accessibility** - Test with screen readers and keyboard navigation
4. **Color Blind Friendly** - Don't rely solely on color to convey information
5. **Performance** - Minimize CSS-in-JS runtime overhead
6. **Documentation** - Document custom theme tokens

## Theme Presets

ADAPT-UI includes several theme presets:

```typescript
import { themes } from '@adapt/ui-toolkit';

// Available themes
themes.dark      // Default dark theme
themes.light     // Light theme
themes.midnight  // Very dark theme
themes.ocean     // Blue-tinted theme
themes.forest    // Green-tinted theme
```

Usage:

```tsx
import { themes } from '@adapt/ui-toolkit';

function App() {
  return (
    <div style={themes.ocean}>
      <RCAGraphViewer graph={graph} />
    </div>
  );
}
```

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Color Palette Generator](https://coolors.co/)
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Material Design Colors](https://material.io/design/color)
