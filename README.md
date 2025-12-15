# React Spread Sheet Excel - Lightning Fast Excel Component for React ⚡

[![npm version](https://badge.fury.io/js/react-spread-sheet-excel.svg)](https://badge.fury.io/js/react-spread-sheet-excel) 
![Downloads](https://img.shields.io/npm/dm/react-spread-sheet-excel.svg)
<a href="https://codecov.io/gh/sojinantony01/react-spread-sheet">
  <img src="https://codecov.io/gh/sojinantony01/react-spread-sheet/graph/badge.svg?token=OLGA3TDJIL"/> 
</a>
<a href="https://github.com/sojinantony01/react-spread-sheet/blob/main/LICENSE">
  <img src="https://img.shields.io/npm/l/react-spread-sheet-excel.svg" alt="license">
</a>

> **The fastest, most lightweight React spreadsheet component** - Render 100,000+ cells with blazing performance. Perfect for building Excel-like applications, data grids, and complex data entry forms in React.

## 🚀 Why Choose React Spread Sheet Excel?

- ⚡ **Blazing Fast** - Optimized virtual scrolling renders 100,000+ cells smoothly
- 🪶 **Ultra Lightweight** - Only ~300KB, no heavy dependencies
- 🧮 **Excel-like Formulas** - Full calculation engine with cell references (=A1*B2+C3)
- 🎨 **Rich Formatting** - Bold, italic, underline, colors, alignment, and more
- 📊 **Merge Cells** - Combine cells like in Excel
- ↩️ **Undo/Redo** - Full history management
- ⌨️ **Keyboard Navigation** - Arrow keys, shortcuts, Excel-like experience
- 📋 **Copy/Paste** - Multi-cell selection and clipboard operations
- 📁 **Import/Export** - CSV and XLSX support
- 🔒 **Read-Only Mode** - Display data without editing
- 🎯 **100% Test Coverage** - Reliable and production-ready
- 📱 **TypeScript Support** - Full type definitions included

## 📺 Live Demo

**[Try it now →](https://sojinantony01.github.io/react-spread-sheet/)**

## ⚡ Performance

This library is highly optimized for performance. See our **[Performance Guide](PERFORMANCE.md)** for:
- Detailed benchmarks
- Optimization techniques
- Best practices
- Memory management tips

![React Spread Sheet Excel Demo](https://raw.githubusercontent.com/sojinantony01/react-spread-sheet/main/public/images/react-spread-sheet-excel.png)

![React Spread Sheet Excel Animation](https://raw.githubusercontent.com/sojinantony01/react-spread-sheet/main/public/images/react-spread-sheet-excel-ezgif.com-video-to-gif-converter.gif)

## 📦 Installation

```bash
npm install react-spread-sheet-excel
```

```bash
yarn add react-spread-sheet-excel
```

```bash
pnpm add react-spread-sheet-excel
```

## 🎯 Quick Start

```tsx
import React, { useRef, useState } from "react";
import Sheet, { SheetRef } from "react-spread-sheet-excel";

function App() {
  const [data] = useState([
    [{ value: "Product" }, { value: "Price" }, { value: "Quantity" }, { value: "Total" }],
    [{ value: "Apple" }, { value: "1.5" }, { value: "10" }, { value: "=B2*C2" }],
    [{ value: "Banana" }, { value: "0.8" }, { value: "15" }, { value: "=B3*C3" }],
  ]);
  
  const sheetRef = useRef<SheetRef>(null);

  const handleChange = (row?: number, col?: number, value?: string) => {
    console.log(`Cell [${row}, ${col}] changed to: ${value}`);
  };

  const getData = () => {
    const updatedData = sheetRef.current?.getData();
    console.log("Current data:", updatedData);
  };

  return (
    <div>
      <button onClick={getData}>Get Data</button>
      <Sheet data={data} onChange={handleChange} ref={sheetRef} />
    </div>
  );
}

export default App;
```

## 🎨 Features in Detail

### ⚡ Performance Optimized

Our spreadsheet uses advanced virtual scrolling and memoization techniques to handle massive datasets:

- **Virtual Rendering**: Only visible cells are rendered
- **Optimized Re-renders**: Smart memoization prevents unnecessary updates
- **Calculation Caching**: Formula results are cached for instant display
- **Lazy Loading**: Rows load on-demand as you scroll

**Benchmark**: Renders 1000 rows × 100 columns in milliseconds!

### 🧮 Excel-like Formulas

Full calculation engine supporting:

```javascript
// Cell references
=A1 + B2

// Complex formulas
=A1 * B2 + (C3 - D4) / E5

// Multiple operations
=(A1 + A2 + A3) * 0.1
```

### 🎨 Rich Text Formatting

```tsx
// Apply formatting via toolbar or keyboard shortcuts
Ctrl/Cmd + B  // Bold
Ctrl/Cmd + I  // Italic
Ctrl/Cmd + U  // Underline

// Programmatic styling
const styledData = [
  [{ 
    value: "Header", 
    styles: { 
      fontWeight: "bold", 
      background: "#4CAF50", 
      color: "white" 
    } 
  }]
];
```

### 📋 Copy/Paste Operations

- **Multi-cell selection**: Click and drag or Shift+Arrow keys
- **Copy**: Ctrl/Cmd + C
- **Cut**: Ctrl/Cmd + X
- **Paste**: Ctrl/Cmd + V
- **Select All**: Ctrl/Cmd + A

### 📁 Import/Export

#### CSV Export

```tsx
import { SheetRef } from "react-spread-sheet-excel";

const sheetRef = useRef<SheetRef>(null);

// Export to CSV
const exportCSV = () => {
  sheetRef.current?.exportCsv("mydata", true); // true = include headers
};
```

#### XLSX Import/Export

```bash
npm install @e965/xlsx
```

```tsx
import * as XLSX from "@e965/xlsx";
import { getCalculatedVal, printToLetter } from "react-spread-sheet-excel";

// Import XLSX
const importFromXlsx = (file: File, onSuccess: (data: any[][]) => void) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const arrayBuffer = e.target?.result as ArrayBuffer;
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    
    const formatted = jsonData.map((row) => 
      row.map((cell) => ({ value: cell }))
    );
    onSuccess(formatted);
  };
  reader.readAsArrayBuffer(file);
};

// Export XLSX
const exportToXlsx = (data: any[][], fileName = "export.xlsx") => {
  const aoa = data.map((row) =>
    row.map((cell) => {
      if (cell.value?.toString().startsWith("=")) {
        return getCalculatedVal(cell.value, data);
      }
      return cell.value;
    })
  );
  
  const worksheet = XLSX.utils.aoa_to_sheet(aoa);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, fileName);
};
```

## 📖 API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `any[][]` | `[[]]` | Initial spreadsheet data (2D array) |
| `onChange` | `(row?, col?, value?) => void` | - | Callback fired on cell changes |
| `resize` | `boolean` | `false` | Enable column resizing |
| `hideXAxisHeader` | `boolean` | `false` | Hide column headers (A, B, C...) |
| `hideYAxisHeader` | `boolean` | `false` | Hide row numbers (1, 2, 3...) |
| `headerValues` | `string[]` | `['A','B','C'...]` | Custom column headers |
| `readonly` | `boolean` | `false` | Make spreadsheet read-only |
| `hideTools` | `boolean` | `false` | Hide formatting toolbar |
| `autoAddAdditionalRows` | `boolean` | `true` | Auto-add rows when scrolling |

### Ref Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getData` | - | `Data[][]` | Get current spreadsheet data |
| `setData` | `data: Data[][]` | `void` | Replace all data |
| `exportCsv` | `filename: string, includeHeaders?: boolean` | `void` | Export to CSV file |
| `updateOneCell` | `row: number, col: number, value: any` | `void` | Update single cell |
| `getOneCell` | `row: number, col: number` | `Data` | Get single cell data |

### Data Format

```typescript
interface Data {
  value: string | number;
  styles?: { [key: string]: string };
  type?: string;
  colSpan?: number;
  rowSpan?: number;
  skip?: boolean; // For merged cells
}
```

## 🎯 Use Cases

### 📊 Data Entry Forms
Perfect for complex data entry with calculations, validations, and formatting.

### 📈 Financial Applications
Build budgeting tools, expense trackers, and financial calculators.

### 📋 Inventory Management
Track products, quantities, prices with automatic calculations.

### 📊 Report Builders
Create dynamic reports with user-editable data and formulas.

### 🎓 Educational Tools
Build interactive spreadsheet tutorials and exercises.

## 🔧 Advanced Examples

### Custom Styling

```tsx
const styledData = [
  [
    { 
      value: "Revenue", 
      styles: { 
        fontWeight: "bold", 
        fontSize: "16px",
        background: "#2196F3",
        color: "white",
        textAlign: "center"
      } 
    },
    { value: "=B2+B3+B4", styles: { fontWeight: "bold" } }
  ]
];
```

### Merged Cells

```tsx
const mergedData = [
  [
    { value: "Merged Header", colSpan: 3, rowSpan: 1 },
    { skip: true },
    { skip: true }
  ]
];
```

### Read-Only Cells

```tsx
<Sheet 
  data={data} 
  readonly={true}  // Entire sheet read-only
/>
```

### Custom Headers

```tsx
<Sheet 
  data={data}
  headerValues={["Product", "Q1", "Q2", "Q3", "Q4", "Total"]}
/>
```

## 🎮 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Arrow Keys` | Navigate cells |
| `Shift + Arrow` | Select multiple cells |
| `Ctrl/Cmd + C` | Copy |
| `Ctrl/Cmd + X` | Cut |
| `Ctrl/Cmd + V` | Paste |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `Ctrl/Cmd + B` | Bold |
| `Ctrl/Cmd + I` | Italic |
| `Ctrl/Cmd + U` | Underline |
| `Ctrl/Cmd + A` | Select all |
| `Delete/Backspace` | Clear selected cells |
| `Enter` | Edit cell |
| `Esc` | Cancel edit |

## 🧪 Testing

100% test coverage with comprehensive unit tests:

```bash
npm test
```

## 📚 Resources

- **[Performance Guide](PERFORMANCE.md)** - Optimization tips and benchmarks
- **[Live Demo](https://sojinantony01.github.io/react-spread-sheet/)**
- **[CodeSandbox Example](https://codesandbox.io/p/sandbox/dry-water-gy2g6k)**
- **[StackBlitz Example](https://stackblitz.com/edit/react-xr6ifg?file=src%2FApp.js)**
- **[Medium Article: Building a Lightning-Fast Spreadsheet](https://medium.com/@sojin.antony01/how-i-built-a-lightning-fast-excel-like-spreadsheet-in-react-that-renders-100-000-cells-4ed925524df9)**
- **[Medium Article: State Management Without Redux](https://medium.com/@sojin.antony01/no-more-redux-or-context-to-manage-complex-data-in-your-react-application-try-2fa6dc23c715)**

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

ISC License - see [LICENSE](LICENSE) file for details

## 👨‍💻 Author

**[Sojin Antony](https://github.com/sojinantony01)**

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/guidelines/download-assets-sm-1.svg)](https://www.buymeacoffee.com/sojinantony)

## 🌟 Show Your Support

If this project helped you, please give it a ⭐️!

## 🔍 Keywords

react spreadsheet, react excel, react data grid, react table, excel component, spreadsheet component, data entry, virtual scrolling, formula calculation, cell formatting, react datagrid, editable grid, react grid, excel-like, spreadsheet editor, data table, react table editor, lightweight spreadsheet, fast spreadsheet, performance spreadsheet

---

**Made with ❤️ for the React community**
