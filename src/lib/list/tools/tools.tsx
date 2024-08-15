import React from "react";
import Icons from "../../svg/icons";
import { useAppSelector } from "../../store";
let timer: string | number | NodeJS.Timeout | undefined;
const emptyObject = {}
const Tools = ({ changeStyle }: {changeStyle: (type:string, val?:string)=> void}) => {
  const selectedStyles = useAppSelector<{[string: string]: string}>((store) => {
    const index = store.list.selected[0];
    if (index) {
      return store.list.data[index[0]][index[1]].styles || emptyObject;
    }
    return emptyObject;
  });
  const changeStyleWithDebounce = (type: string, val: string) => {
    clearTimeout(timer);
    timer = setTimeout(() => {changeStyle(type, val)}, 200)
  }
  return (
    <div className="tools">
      <button onClick={() => changeStyle("B")}>B</button>
      <button onClick={() => changeStyle("U")}>U</button>
      <button onClick={() => changeStyle("I")}>I</button>
      {/* <button onClick={() => changeStyle("FONT", ((parseInt(selectedFontSize) || 12) - 1).toString())}>-</button> */}
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
      {/* <button onClick={() => changeStyle("FONT", ((parseInt(selectedFontSize) || 12) + 1).toString())}>+</button> */}

      <button data-testid="align-left" onClick={() => changeStyle("ALIGN-LEFT")}>
        <Icons type="align-left" />
      </button>
      <button data-testid="align-center" onClick={() => changeStyle("ALIGN-CENTER")}>
        <Icons type="align-center" />
      </button>
      <button data-testid="align-right" onClick={() => changeStyle("ALIGN-RIGHT")}>
        <Icons type="align-right" />
      </button>
      <button data-testid="align-justify" onClick={() => changeStyle("ALIGN-JUSTIFY")}>
        <Icons type="align-justify" />
      </button>

      <input
        type="color"
        data-testid="font-color"
        value={selectedStyles?.["color"] || "#000000"}
        onChange={(e) => changeStyleWithDebounce("COLOR", e.target.value)}
      />
      <input
        type="color"
        data-testid="background-color"
        value={selectedStyles?.["background"] || "#000000"}
        onChange={(e) => changeStyleWithDebounce("BACKGROUND", e.target.value)}
      />
    </div>
  );
};
export default Tools;