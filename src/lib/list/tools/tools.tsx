import React, { useRef } from "react";
import Icons from "../../svg/icons";
import { useAppSelector } from "../../store";
let timer: string | number | NodeJS.Timeout | undefined;
const emptyObject = {}
const Tools = ({ changeStyle }: {changeStyle: (type:string, val?:string)=> void}) => {
  const calculationRef = useRef<HTMLInputElement>(null);
  const fontColorRef = useRef<HTMLInputElement>(null);
  const backgroundColorRef = useRef<HTMLInputElement>(null);
  const selectedStyles = useAppSelector<{[string: string]: string}>((store) => {
    const index = store.list.selected[0];
    if (index) {
      return store.list.data[index[0]][index[1]].styles || emptyObject;
    }
    return emptyObject;
  });
  const selectedFontSize = selectedStyles?.["fontSize"] ? selectedStyles["fontSize"]?.split("px")?.[0] : "12"
  const changeStyleWithDebounce = (type: string, val: string) => {
    clearTimeout(timer);
    timer = setTimeout(() => {changeStyle(type, val)}, 200)
  }
  return (
    <div className="sheet-tools-container">
      <div className="sheet-tools">
        <div className="sheet-tools-calculation-input-container" onClick={(e)=> {e.preventDefault(); e.stopPropagation(); calculationRef.current?.focus()}}>
          fx <input ref={calculationRef}  />
        </div>
        <div className="sheet-tools-font-size-container">
          <button onClick={() => changeStyle("FONT", (parseInt(selectedFontSize) - 1).toString())}>-</button>
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
          <button onClick={() => changeStyle("FONT", (parseInt(selectedFontSize) + 1).toString())}>+</button>
        </div>
        <div className="sheet-tools-text-style-container">
          <button className={selectedStyles["fontWeight"] === "bold" ? "text-style-btn-active" : ""} onClick={() => changeStyle("B")}>B</button>
          <button className={selectedStyles["text-decoration"] === "underline" ? "text-style-btn-active text-style-btn-active-underline" : ""} onClick={() => changeStyle("U")}>U</button>
          <button className={selectedStyles["fontStyle"] === "italic" ? "text-style-btn-active" : ""} onClick={() => changeStyle("I")}>I</button>
        </div>
       
        <span data-testid="align-left" onClick={() => changeStyle("ALIGN-LEFT")}>
          <Icons type="align-left" />
        </span>
        <span data-testid="align-center" onClick={() => changeStyle("ALIGN-CENTER")}>
          <Icons type="align-center" />
        </span>
        <span data-testid="align-right" onClick={() => changeStyle("ALIGN-RIGHT")}>
          <Icons type="align-right" />
        </span>
        <span data-testid="align-justify" onClick={() => changeStyle("ALIGN-JUSTIFY")}>
          <Icons type="align-justify" />
        </span>
        <span onClick={()=> fontColorRef.current?.click()}>A</span>
        <span onClick={()=> backgroundColorRef.current?.click()}>BG</span>
        <input
          ref={fontColorRef}
          hidden
          type="color"
          data-testid="font-color"
          value={selectedStyles?.["color"] || "#000000"}
          onChange={(e) => changeStyleWithDebounce("COLOR", e.target.value)}
        />
        <input
          ref={backgroundColorRef}
          hidden
          type="color"
          data-testid="background-color"
          value={selectedStyles?.["background"] || "#000000"}
          onChange={(e) => changeStyleWithDebounce("BACKGROUND", e.target.value)}
        />
      
      </div>
    </div>
  );
};
export default Tools;