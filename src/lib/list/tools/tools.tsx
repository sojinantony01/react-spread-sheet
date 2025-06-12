import React, { useRef } from "react";
import Icons from "../../svg/icons";
import { store, useAppSelector } from "../../store";
import { changeData, redo, undo } from "../../reducer";

let timer: string | number | NodeJS.Timeout | undefined;
const emptyObject = {};
const notSelectedIndex = [undefined, undefined];
const Tools = ({
  changeStyle,
  onChange,
}: {
  changeStyle: (type: string, val?: string) => void;
  onChange: ((i?: number, j?: number, value?: string) => void) | undefined;
}) => {
  const calculationRef = useRef<HTMLInputElement>(null);
  const fontColorRef = useRef<HTMLInputElement>(null);
  const backgroundColorRef = useRef<HTMLInputElement>(null);
  const { dispatch } = store;
  const [i, j] = useAppSelector(store, (state) => state.selected[0] || notSelectedIndex);
  const selectedStyles = useAppSelector(store, (state) => {
    const index = state.selected[0];
    if (index) {
      return state.data[index[0]][index[1]].styles || emptyObject;
    }
    return emptyObject;
  });
  const selectedItemVal = useAppSelector(
    store,
    (state) => state.data[state.selected?.[0]?.[0]]?.[state.selected?.[0]?.[1]]?.value || "",
  );
  const selectedFontSize = selectedStyles?.["fontSize"]
    ? selectedStyles["fontSize"]?.split("px")?.[0]
    : "12";
  const changeStyleWithDebounce = (type: string, val: string) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      changeStyle(type, val);
    }, 200);
  };
  const onValChange = (e: { target: { value: string } }) => {
    dispatch(changeData, { payload: { value: e.target.value || "", i: i, j: j } });
    onChange && onChange(i, j, e.target.value);
  };
  return (
    <div className="sheet-tools-container">
      <div className="sheet-tools">
        <div
          className="sheet-tools-calculation-input-container"
          data-testid="sheet-tools-calculation-input-container"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            calculationRef.current?.focus();
          }}
        >
          fx
          <input
            data-testid="fx-input"
            ref={calculationRef}
            value={selectedItemVal}
            readOnly={i == undefined || j == undefined}
            onChange={onValChange}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
          />
        </div>
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
              value={selectedStyles["fontSize"]?.split("px")?.[0] || ""}
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
        <div className="sheet-tools-text-cell-color-container">
          <button data-testid="font-color-button" onClick={() => fontColorRef.current?.click()}>
            A{" "}
            <span
              className="sheet-color-strip"
              style={{ backgroundColor: selectedStyles["color"] }}
            ></span>
          </button>
          <input
            ref={fontColorRef}
            type="color"
            data-testid="font-color"
            value={selectedStyles?.["color"] || "#000000"}
            onChange={(e) => changeStyleWithDebounce("COLOR", e.target.value)}
          />
          <button
            data-testid="background-color-button"
            onClick={() => backgroundColorRef.current?.click()}
          >
            <svg
              fill={selectedStyles?.["background"]}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 576 512"
            >
              <path d="M41.4 9.4C53.9-3.1 74.1-3.1 86.6 9.4L168 90.7l53.1-53.1c28.1-28.1 73.7-28.1 101.8 0L474.3 189.1c28.1 28.1 28.1 73.7 0 101.8L283.9 481.4c-37.5 37.5-98.3 37.5-135.8 0L30.6 363.9c-37.5-37.5-37.5-98.3 0-135.8L122.7 136 41.4 54.6c-12.5-12.5-12.5-32.8 0-45.3zm176 221.3L168 181.3 75.9 273.4c-4.2 4.2-7 9.3-8.4 14.6l319.2 0 42.3-42.3c3.1-3.1 3.1-8.2 0-11.3L277.7 82.9c-3.1-3.1-8.2-3.1-11.3 0L213.3 136l49.4 49.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0zM512 512c-35.3 0-64-28.7-64-64c0-25.2 32.6-79.6 51.2-108.7c6-9.4 19.5-9.4 25.5 0C543.4 368.4 576 422.8 576 448c0 35.3-28.7 64-64 64z" />
            </svg>
            <span
              className="sheet-color-strip"
              style={{ backgroundColor: selectedStyles["background"] }}
            ></span>
          </button>
          <input
            ref={backgroundColorRef}
            type="color"
            data-testid="background-color"
            value={selectedStyles?.["background"] || "#000000"}
            onChange={(e) => changeStyleWithDebounce("BACKGROUND", e.target.value)}
          />
        </div>
        <div className="sheet-tools-text-style-container">
          <button
            className={selectedStyles["fontWeight"] === "bold" ? "text-style-btn-active" : ""}
            onClick={() => changeStyle("B")}
          >
            B
          </button>
          <button
            className={
              selectedStyles["text-decoration"] === "underline"
                ? "text-style-btn-active text-style-btn-active-underline"
                : ""
            }
            onClick={() => changeStyle("U")}
          >
            U
          </button>
          <button
            className={selectedStyles["fontStyle"] === "italic" ? "text-style-btn-active" : ""}
            onClick={() => changeStyle("I")}
          >
            I
          </button>
        </div>
        <div className="sheet-tools-text-align-container">
          <button
            className={selectedStyles["textAlign"] === "left" ? "text-style-btn-active" : ""}
            data-testid="align-left"
            onClick={() => changeStyle("ALIGN-LEFT")}
          >
            <Icons type="align-left" />
          </button>
          <button
            className={selectedStyles["textAlign"] === "center" ? "text-style-btn-active" : ""}
            data-testid="align-center"
            onClick={() => changeStyle("ALIGN-CENTER")}
          >
            <Icons type="align-center" />
          </button>
          <button
            className={selectedStyles["textAlign"] === "right" ? "text-style-btn-active" : ""}
            data-testid="align-right"
            onClick={() => changeStyle("ALIGN-RIGHT")}
          >
            <Icons type="align-right" />
          </button>
          <button
            className={selectedStyles["textAlign"] === "justify" ? "text-style-btn-active" : ""}
            data-testid="align-justify"
            onClick={() => changeStyle("ALIGN-JUSTIFY")}
          >
            <Icons type="align-justify" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default Tools;
