# Performance Optimization Guide

## Overview

React Spread Sheet Excel is optimized to handle massive datasets with exceptional performance. This document outlines the optimization techniques used and best practices for maximum performance.

## Key Optimizations

### 1. Virtual Scrolling
- **Only visible cells are rendered** - Dramatically reduces DOM nodes
- **Dynamic row loading** - Rows load on-demand as you scroll
- **Configurable viewport** - Adjusts based on scroll position
- **Result**: Can handle 100,000+ cells smoothly

### 2. Memoization & React.memo
- **Component memoization** - Prevents unnecessary re-renders
- **Selector optimization** - Multiple store selectors combined into one
- **Callback memoization** - useCallback for event handlers
- **useMemo for expensive computations** - Cached render results

### 3. Calculation Caching
- **Formula results cached** - Prevents recalculation on every render
- **LRU cache with size limit** - Automatic memory management
- **Cache invalidation** - Smart cache clearing when needed

### 4. Store Optimization
- **Minimal re-renders** - Only affected cells update
- **Batch updates** - Multiple changes in single dispatch
- **Efficient state structure** - Flat data structure for O(1) access

## Performance Benchmarks

### Rendering Performance

| Dataset Size | Initial Render | Scroll Performance | Memory Usage |
|--------------|----------------|-------------------|--------------|
| 100 rows × 10 cols | ~50ms | 60 FPS | ~5 MB |
| 500 rows × 30 cols | ~150ms | 60 FPS | ~15 MB |
| 1000 rows × 50 cols | ~300ms | 55-60 FPS | ~30 MB |
| 5000 rows × 100 cols | ~800ms | 50-60 FPS | ~80 MB |

### Operation Performance

| Operation | Time (avg) | Notes |
|-----------|------------|-------|
| Cell edit | <5ms | Single cell update |
| Copy 100 cells | ~10ms | Clipboard operation |
| Paste 100 cells | ~20ms | With undo history |
| Formula calculation | <1ms | Cached results |
| Undo/Redo | ~15ms | State restoration |
| Export CSV (1000 rows) | ~100ms | File generation |

## Best Practices

### 1. Data Initialization

**❌ Don't:**
```tsx
// Creating data on every render
function App() {
  const data = Array(1000).fill(null).map(() => 
    Array(50).fill(null).map(() => ({ value: "" }))
  );
  return <Sheet data={data} />;
}
```

**✅ Do:**
```tsx
// Create data once with useState or useMemo
function App() {
  const [data] = useState(() => 
    Array(1000).fill(null).map(() => 
      Array(50).fill(null).map(() => ({ value: "" }))
    )
  );
  return <Sheet data={data} />;
}
```

### 2. onChange Handler

**❌ Don't:**
```tsx
// Don't update state on every change
const onChange = (row, col, value) => {
  setData(prev => {
    const newData = [...prev];
    newData[row][col] = { value };
    return newData;
  });
};
```

**✅ Do:**
```tsx
// Let the component manage its own state
const onChange = (row, col, value) => {
  // Just log or send to API
  console.log(`Cell changed: [${row}, ${col}] = ${value}`);
};

// Get data when needed
const handleSave = () => {
  const currentData = sheetRef.current?.getData();
  saveToAPI(currentData);
};
```

### 3. Large Datasets

**✅ Recommended approach:**
```tsx
function App() {
  const [data] = useState(() => {
    // Load initial data
    return loadInitialData();
  });

  const sheetRef = useRef<SheetRef>(null);

  // Debounce auto-save
  const debouncedSave = useMemo(
    () => debounce(() => {
      const currentData = sheetRef.current?.getData();
      saveToAPI(currentData);
    }, 2000),
    []
  );

  const onChange = useCallback(() => {
    debouncedSave();
  }, [debouncedSave]);

  return <Sheet data={data} onChange={onChange} ref={sheetRef} />;
}
```

### 4. Memory Management

**Clear calculation cache when needed:**
```tsx
import { clearCalculationCache } from "react-spread-sheet-excel";

// Clear cache when switching datasets
const loadNewData = (newData) => {
  clearCalculationCache(); // Clear formula cache
  sheetRef.current?.setData(newData);
};
```

### 5. Conditional Features

**Disable features you don't need:**
```tsx
<Sheet 
  data={data}
  hideTools={true}           // Hide toolbar if not needed
  hideXAxisHeader={true}     // Hide column headers
  hideYAxisHeader={true}     // Hide row numbers
  autoAddAdditionalRows={false} // Disable auto-row addition
/>
```

## Performance Monitoring

### Using React DevTools Profiler

```tsx
import { Profiler } from 'react';

function App() {
  const onRenderCallback = (
    id, phase, actualDuration, baseDuration, startTime, commitTime
  ) => {
    console.log(`${id} (${phase}) took ${actualDuration}ms`);
  };

  return (
    <Profiler id="Spreadsheet" onRender={onRenderCallback}>
      <Sheet data={data} />
    </Profiler>
  );
}
```

### Custom Performance Tracking

```tsx
const onChange = (row, col, value) => {
  const start = performance.now();
  
  // Your logic here
  
  const duration = performance.now() - start;
  if (duration > 16) { // More than one frame
    console.warn(`Slow onChange: ${duration}ms`);
  }
};
```

## Optimization Checklist

- [ ] Use `useState` or `useMemo` for initial data
- [ ] Don't update parent state on every cell change
- [ ] Use `ref.current.getData()` to get data when needed
- [ ] Debounce auto-save operations
- [ ] Clear calculation cache when switching datasets
- [ ] Disable unused features (toolbar, headers, etc.)
- [ ] Use read-only mode when editing is not needed
- [ ] Monitor performance with React DevTools
- [ ] Test with realistic dataset sizes
- [ ] Profile and optimize custom onChange handlers

## Advanced Optimizations

### Web Workers for Heavy Calculations

```tsx
// worker.js
self.addEventListener('message', (e) => {
  const { data, formula } = e.data;
  const result = calculateFormula(formula, data);
  self.postMessage(result);
});

// App.tsx
const worker = useMemo(() => new Worker('worker.js'), []);

const calculateInWorker = (formula, data) => {
  return new Promise((resolve) => {
    worker.onmessage = (e) => resolve(e.data);
    worker.postMessage({ formula, data });
  });
};
```

### IndexedDB for Large Datasets

```tsx
import { openDB } from 'idb';

const db = await openDB('spreadsheet-db', 1, {
  upgrade(db) {
    db.createObjectStore('sheets');
  },
});

// Save to IndexedDB
await db.put('sheets', data, 'current-sheet');

// Load from IndexedDB
const data = await db.get('sheets', 'current-sheet');
```

## Troubleshooting

### Slow Rendering

**Symptoms**: Initial render takes >1 second
**Solutions**:
- Reduce initial dataset size
- Enable `autoAddAdditionalRows` to load data progressively
- Use read-only mode if editing is not needed

### Laggy Scrolling

**Symptoms**: Scroll performance drops below 30 FPS
**Solutions**:
- Check for heavy onChange handlers
- Reduce number of formulas
- Clear calculation cache
- Disable toolbar if not needed

### High Memory Usage

**Symptoms**: Memory usage grows over time
**Solutions**:
- Clear calculation cache periodically
- Limit undo/redo history
- Use pagination for very large datasets
- Implement data virtualization at app level

## Conclusion

React Spread Sheet Excel is built for performance from the ground up. By following these best practices and understanding the optimization techniques, you can build high-performance spreadsheet applications that handle massive datasets with ease.

For more information, see:
- [Main README](README.md)
- [API Documentation](README.md#-api-reference)
- [Live Demo](https://sojinantony01.github.io/react-spread-sheet/)