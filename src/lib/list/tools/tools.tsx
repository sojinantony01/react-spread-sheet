import React, { useRef, useState, useCallback, useEffect } from "react";
import Icons from "../../svg/icons";
import { store, useAppSelector } from "../../store";
import { changeData, mergeCells, redo, selectOneCell, undo } from "../../reducer";
import { buildRangeString, colIndexToLabel } from "../utils";
import { updateFormulaHighlights, clearFormulaHighlights } from "../formula-edit-state";

let timer: string | number | NodeJS.Timeout | undefined;
const emptyObject = {};
const notSelectedIndex = [undefined, undefined];

// Formulas that operate on a range of cells (shown in the Σ toolbar).
const RANGE_FORMULAS = [
  { name: "SUM", template: "SUM(%)", desc: "Add up all numbers in a range" },
  { name: "AVERAGE", template: "AVERAGE(%)", desc: "Mean of all numbers in a range" },
  { name: "COUNT", template: "COUNT(%)", desc: "Count cells containing numbers" },
  { name: "COUNTA", template: "COUNTA(%)", desc: "Count all non-empty cells (numbers + text)" },
  { name: "MIN", template: "MIN(%)", desc: "Smallest number in a range" },
  { name: "MAX", template: "MAX(%)", desc: "Largest number in a range" },
  { name: "CONCAT", template: "CONCAT(%)", desc: "Join all cell text in a range" },
];

// Formulas that operate on a single cell value (shown in the fx autocomplete only).
const SINGLE_FORMULAS = [
  {
    name: "ABS",
    template: "ABS(A1)",
    desc: "Absolute (positive) value of a cell — e.g. ABS(-5) = 5",
  },
  { name: "SQRT", template: "SQRT(A1)", desc: "Square root of a cell value" },
  {
    name: "ROUND",
    template: "ROUND(A1,2)",
    desc: "Round a cell to N decimal places — e.g. ROUND(A1,2)",
  },
  {
    name: "POWER",
    template: "POWER(A1,2)",
    desc: "Raise a cell value to a power — e.g. POWER(A1,3) = A1³",
  },
  {
    name: "IF",
    template: "IF(A1>0,A1,0)",
    desc: "If condition is true return one value, else another",
  },
];

// Combined list used for fx-bar autocomplete.
const FORMULA_LIST = [...RANGE_FORMULAS, ...SINGLE_FORMULAS];

const Tools = ({
  changeStyle,
  onChange,
  headerValues,
}: {
  changeStyle: (type: string, val?: string) => void;
  onChange: ((i?: number, j?: number, value?: string) => void) | undefined;
  headerValues?: string[];
}) => {
  const calculationRef = useRef<HTMLInputElement>(null);
  const fontColorRef = useRef<HTMLInputElement>(null);
  const backgroundColorRef = useRef<HTMLInputElement>(null);
  const formulaMenuRef = useRef<HTMLDivElement>(null);

  const [formulaSuggestions, setFormulaSuggestions] = useState<typeof FORMULA_LIST>([]);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [showFormulaMenu, setShowFormulaMenu] = useState(false);

  const { dispatch } = store;
  const selectedI = useAppSelector(store, (state) => state.selected[0]?.[0]);
  const selectedJ = useAppSelector(store, (state) => state.selected[0]?.[1]);
  const i = selectedI ?? notSelectedIndex[0];
  const j = selectedJ ?? notSelectedIndex[1];

  const stylesJson = useAppSelector(store, (state) => {
    const index = state.selected[0];
    if (index) {
      const s = state.data[index[0]][index[1]].styles;
      return s ? JSON.stringify(s) : "";
    }
    return "";
  });
  const parsedSelectedStyles = stylesJson ? JSON.parse(stylesJson) : emptyObject;

  const type = useAppSelector(store, (state) => {
    const index = state.selected[0];
    if (index) return state.data[index[0]][index[1]].type || "text";
    return "";
  });

  const selectedItemVal = useAppSelector(
    store,
    (state) => state.data[state.selected?.[0]?.[0]]?.[state.selected?.[0]?.[1]]?.value || "",
  );

  const rowSpan = useAppSelector(
    store,
    (state) =>
      state.data[state.selected?.[0]?.[0]]?.[state.selected?.[0]?.[1]]?.rowSpan || undefined,
  );

  const selectedCount = useAppSelector(store, (state) => state.selected.length);

  const selectedFontSize = parsedSelectedStyles?.["fontSize"]
    ? parsedSelectedStyles["fontSize"]?.split("px")?.[0]
    : "12";

  const changeStyleWithDebounce = (styleType: string, val: string) => {
    clearTimeout(timer);
    timer = setTimeout(() => changeStyle(styleType, val), 200);
  };

  // ─── fx bar ─────────────────────────────────────────────────────────────────

  const onValChange = (e: { target: { value: string } }) => {
    const val = e.target.value;
    dispatch(changeData, { payload: { value: val, i, j } });
    onChange && onChange(i, j, val);

    // Update reference highlights as the user types a formula.
    if (val.startsWith("=") && i !== undefined && j !== undefined) {
      const state = store.getState();
      updateFormulaHighlights(
        val,
        i,
        j,
        headerValues,
        state.data.length,
        state.data[0]?.length ?? 0,
      );
    } else {
      clearFormulaHighlights();
    }

    if (val.startsWith("=")) {
      const afterEq = val.slice(1).toUpperCase();
      if (afterEq.length > 0 && /^[A-Z]+$/.test(afterEq)) {
        setFormulaSuggestions(FORMULA_LIST.filter((f) => f.name.startsWith(afterEq)));
      } else {
        setFormulaSuggestions([]);
      }
    } else {
      setFormulaSuggestions([]);
    }
    setActiveSuggestion(-1);
  };

  const applyFxSuggestion = useCallback(
    (template: string) => {
      const newVal = "=" + template.replace("%", "");
      dispatch(changeData, { payload: { value: newVal, i, j } });
      onChange && onChange(i, j, newVal);
      setFormulaSuggestions([]);
      setActiveSuggestion(-1);
      calculationRef.current?.focus();
    },
    [i, j, dispatch, onChange],
  );

  const onFxKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!formulaSuggestions.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestion((prev) => Math.min(prev + 1, formulaSuggestions.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSuggestion((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" || e.key === "Tab") {
        if (activeSuggestion >= 0) {
          e.preventDefault();
          applyFxSuggestion(formulaSuggestions[activeSuggestion].template);
        }
      } else if (e.key === "Escape") {
        setFormulaSuggestions([]);
        setActiveSuggestion(-1);
      }
    },
    [formulaSuggestions, activeSuggestion, applyFxSuggestion],
  );

  const onFxBlur = useCallback(() => {
    clearFormulaHighlights();
    setTimeout(() => setFormulaSuggestions([]), 150);
  }, []);

  // ─── Σ formula toolbar button ────────────────────────────────────────────────

  const applyFormulaFromToolbar = useCallback(
    (formulaName: string) => {
      setShowFormulaMenu(false);
      const state = store.getState();
      const sel = state.selected;
      if (!sel.length || i === undefined || j === undefined) return;

      const isSingleCell = SINGLE_FORMULAS.some((f) => f.name === formulaName);
      const formula = FORMULA_LIST.find((f) => f.name === formulaName);

      let newVal: string;
      let targetI: number;
      let targetJ: number;

      if (isSingleCell) {
        // Build the actual cell address from the selected cell (e.g. "C5" not "A1").
        const col = colIndexToLabel(sel[0][1], headerValues);
        const row = sel[0][0] + 1;
        const cellRef = `${col}${row}`;
        // Replace the placeholder "A1" in the template with the real cell reference.
        const tmpl = formula?.template ?? `${formulaName}(A1)`;
        newVal = "=" + tmpl.replace(/A1/g, cellRef);
        targetI = sel[0][0];
        targetJ = sel[0][1];
      } else {
        // Range formulas: build range from selection, place result below.
        let rangeStr: string;
        if (sel.length > 1) {
          const firstCell = sel[0];
          const lastCell = sel[sel.length - 1];
          rangeStr = buildRangeString(
            firstCell[0],
            firstCell[1],
            lastCell[0],
            lastCell[1],
            headerValues,
          );
          const maxRow = Math.max(...sel.map((s) => s[0]));
          const minCol = Math.min(...sel.map((s) => s[1]));
          targetI = maxRow + 1 < state.data.length ? maxRow + 1 : firstCell[0];
          targetJ = minCol;
        } else {
          const singleCol = colIndexToLabel(sel[0][1], headerValues);
          rangeStr = `${singleCol}1:${singleCol}${Math.min(sel[0][0], state.data.length)}`;
          targetI = sel[0][0];
          targetJ = sel[0][1];
        }
        newVal = "=" + (formula?.template ?? `${formulaName}(%)`).replace("%", rangeStr);
      }

      dispatch(changeData, { payload: { value: newVal, i: targetI, j: targetJ } });
      onChange && onChange(targetI, targetJ, newVal);
      dispatch(selectOneCell, { payload: { i: targetI, j: targetJ } });
      // Focus the target cell (not the fx bar) — the user sees the result and
      // can start a new selection. Formula-edit mode only activates if they
      // explicitly focus the cell/fx-bar to edit. No select() — that was
      // selecting all text and causing the next cell click to replace the formula.
      setTimeout(() => {
        document.getElementById(`${targetI}-${targetJ}`)?.focus();
      }, 0);
    },
    [i, j, dispatch, onChange, headerValues],
  );

  // Close Σ menu when clicking outside
  useEffect(() => {
    if (!showFormulaMenu) return;
    const handleOutside = (e: MouseEvent) => {
      if (formulaMenuRef.current && !formulaMenuRef.current.contains(e.target as Node)) {
        setShowFormulaMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [showFormulaMenu]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  const hasSelection = i !== undefined && j !== undefined;

  return (
    <div className="sheet-tools-container">
      <div className="sheet-tools">
        {/* fx bar */}
        <div
          className="sheet-tools-calculation-input-container"
          data-testid="sheet-tools-calculation-input-container"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            calculationRef.current?.focus();
          }}
        >
          <span className="fx-label">fx</span>
          <div className="fx-input-wrapper">
            <input
              data-testid="fx-input"
              ref={calculationRef}
              value={selectedItemVal}
              type={type === "number" ? "number" : "text"}
              readOnly={!hasSelection || !["text", "number"].includes(type)}
              onChange={onValChange}
              onKeyDown={onFxKeyDown}
              onBlur={onFxBlur}
            />
            {formulaSuggestions.length > 0 && (
              <ul className="sheet-formula-suggestions" data-testid="formula-suggestions">
                {formulaSuggestions.map((f, idx) => (
                  <li
                    key={f.name}
                    className={`sheet-formula-suggestion-item${idx === activeSuggestion ? " active" : ""}`}
                    onMouseDown={() => applyFxSuggestion(f.template)}
                  >
                    <span className="fx-name">{f.name}</span>
                    <span className="fx-desc">{f.desc}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Σ formula toolbar button */}
        <div className="sheet-tools-formula-container" ref={formulaMenuRef}>
          <button
            className={`sheet-formula-sigma-btn${showFormulaMenu ? " active" : ""}`}
            title="Insert formula"
            data-testid="formula-sigma-btn"
            onClick={() => setShowFormulaMenu((v) => !v)}
            disabled={!hasSelection}
          >
            Σ
          </button>
          {showFormulaMenu && (
            <div className="sheet-formula-toolbar-menu" data-testid="formula-toolbar-menu">
              <div className="sheet-formula-toolbar-header">
                {selectedCount > 1 ? (
                  <span className="fx-range-hint">
                    {selectedCount} cells selected — result placed below
                  </span>
                ) : (
                  <span className="fx-range-hint">Select a formula to insert</span>
                )}
              </div>
              <div className="sheet-formula-toolbar-grid">
                {RANGE_FORMULAS.map((f) => (
                  <button
                    key={f.name}
                    className="sheet-formula-toolbar-item"
                    title={f.desc}
                    onClick={() => applyFormulaFromToolbar(f.name)}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
              <div className="sheet-formula-toolbar-divider" />
              <div className="sheet-formula-toolbar-more-header">Single-cell formulas</div>
              <div className="sheet-formula-toolbar-more">
                {SINGLE_FORMULAS.map((f) => (
                  <button
                    key={f.name}
                    className="sheet-formula-toolbar-item-more"
                    title={f.desc}
                    onClick={() => applyFormulaFromToolbar(f.name)}
                  >
                    <span className="fx-name">{f.name}</span>
                    <span className="fx-desc">{f.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Undo / Redo */}
        <div className="sheet-tools-text-style-container">
          <button
            data-testid="undo-button-tools"
            onClick={() => {
              dispatch(undo);
              onChange && onChange();
            }}
          >
            <svg width={15} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4 7H15C16.8692 7 17.8039 7 18.5 7.40193C18.9561 7.66523 19.3348 8.04394 19.5981 8.49999C20 9.19615 20 10.1308 20 12C20 13.8692 20 14.8038 19.5981 15.5C19.3348 15.9561 18.9561 16.3348 18.5 16.5981C17.8039 17 16.8692 17 15 17H8.00001M4 7L7 4M4 7L7 10"
                stroke="#1C274C"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            data-testid="redo-button-tools"
            onClick={() => {
              dispatch(redo);
              onChange && onChange();
            }}
          >
            <svg width={15} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20 7H9.00001C7.13077 7 6.19615 7 5.5 7.40193C5.04395 7.66523 4.66524 8.04394 4.40193 8.49999C4 9.19615 4 10.1308 4 12C4 13.8692 4 14.8038 4.40192 15.5C4.66523 15.9561 5.04394 16.3348 5.5 16.5981C6.19615 17 7.13077 17 9 17H16M20 7L17 4M20 7L17 10"
                stroke="#1C274C"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Font size */}
        <div className="sheet-tools-font-size-container">
          <button
            data-testid="font-size-decrease"
            onClick={() => changeStyle("FONT", (parseInt(selectedFontSize) - 1).toString())}
          >
            <svg width={10} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z" />
            </svg>
          </button>
          <span>
            <input
              data-testid="font-size-input"
              className="font-size-input"
              type="number"
              placeholder="size"
              value={parsedSelectedStyles["fontSize"]?.split("px")?.[0] || ""}
              onChange={(e) => changeStyle("FONT", e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </span>
          <button
            data-testid="font-size-increase"
            onClick={() => changeStyle("FONT", (parseInt(selectedFontSize) + 1).toString())}
          >
            <svg width={10} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z" />
            </svg>
          </button>
        </div>

        {/* Font / background color */}
        <div className="sheet-tools-text-cell-color-container">
          <button data-testid="font-color-button" onClick={() => fontColorRef.current?.click()}>
            A{" "}
            <span
              className="sheet-color-strip"
              style={{ backgroundColor: parsedSelectedStyles["color"] }}
            ></span>
          </button>
          <input
            ref={fontColorRef}
            type="color"
            data-testid="font-color"
            value={parsedSelectedStyles?.["color"] || "#000000"}
            onChange={(e) => changeStyleWithDebounce("COLOR", e.target.value)}
          />
          <button
            data-testid="background-color-button"
            onClick={() => backgroundColorRef.current?.click()}
          >
            <svg
              fill={parsedSelectedStyles?.["background"]}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 576 512"
            >
              <path d="M41.4 9.4C53.9-3.1 74.1-3.1 86.6 9.4L168 90.7l53.1-53.1c28.1-28.1 73.7-28.1 101.8 0L474.3 189.1c28.1 28.1 28.1 73.7 0 101.8L283.9 481.4c-37.5 37.5-98.3 37.5-135.8 0L30.6 363.9c-37.5-37.5-37.5-98.3 0-135.8L122.7 136 41.4 54.6c-12.5-12.5-12.5-32.8 0-45.3zm176 221.3L168 181.3 75.9 273.4c-4.2 4.2-7 9.3-8.4 14.6l319.2 0 42.3-42.3c3.1-3.1 3.1-8.2 0-11.3L277.7 82.9c-3.1-3.1-8.2-3.1-11.3 0L213.3 136l49.4 49.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0zM512 512c-35.3 0-64-28.7-64-64c0-25.2 32.6-79.6 51.2-108.7c6-9.4 19.5-9.4 25.5 0C543.4 368.4 576 422.8 576 448c0 35.3-28.7 64-64 64z" />
            </svg>
            <span
              className="sheet-color-strip"
              style={{ backgroundColor: parsedSelectedStyles["background"] }}
            ></span>
          </button>
          <input
            ref={backgroundColorRef}
            type="color"
            data-testid="background-color"
            value={parsedSelectedStyles?.["background"] || "#000000"}
            onChange={(e) => changeStyleWithDebounce("BACKGROUND", e.target.value)}
          />
        </div>

        {/* Text style: B / U / I */}
        <div className="sheet-tools-text-style-container">
          <button
            className={parsedSelectedStyles["fontWeight"] === "bold" ? "text-style-btn-active" : ""}
            onClick={() => changeStyle("B")}
          >
            B
          </button>
          <button
            className={
              parsedSelectedStyles["text-decoration"] === "underline"
                ? "text-style-btn-active text-style-btn-active-underline"
                : ""
            }
            onClick={() => changeStyle("U")}
          >
            U
          </button>
          <button
            className={
              parsedSelectedStyles["fontStyle"] === "italic" ? "text-style-btn-active" : ""
            }
            onClick={() => changeStyle("I")}
          >
            I
          </button>
        </div>

        {/* Text alignment */}
        <div className="sheet-tools-text-align-container">
          <button
            className={parsedSelectedStyles["textAlign"] === "left" ? "text-style-btn-active" : ""}
            data-testid="align-left"
            onClick={() => changeStyle("ALIGN-LEFT")}
          >
            <Icons type="align-left" />
          </button>
          <button
            className={
              parsedSelectedStyles["textAlign"] === "center" ? "text-style-btn-active" : ""
            }
            data-testid="align-center"
            onClick={() => changeStyle("ALIGN-CENTER")}
          >
            <Icons type="align-center" />
          </button>
          <button
            className={parsedSelectedStyles["textAlign"] === "right" ? "text-style-btn-active" : ""}
            data-testid="align-right"
            onClick={() => changeStyle("ALIGN-RIGHT")}
          >
            <Icons type="align-right" />
          </button>
          <button
            className={
              parsedSelectedStyles["textAlign"] === "justify" ? "text-style-btn-active" : ""
            }
            data-testid="align-justify"
            onClick={() => changeStyle("ALIGN-JUSTIFY")}
          >
            <Icons type="align-justify" />
          </button>
        </div>

        {/* Merge */}
        <div className="sheet-tools-text-style-container">
          <button
            className={rowSpan ? "text-style-btn-active" : ""}
            data-testid="merge"
            onClick={() => {
              dispatch(mergeCells);
              onChange && onChange();
            }}
          >
            <Icons type="merge" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default Tools;
