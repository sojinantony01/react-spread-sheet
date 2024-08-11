import React from "react";
import Icons from "../../svg/icons";
import { useAppSelector } from "../../store";
let timer: string | number | NodeJS.Timeout | undefined;
const Tools = ({ changeStyle }: {changeStyle: (type:string, val?:string)=> void}) => {
  const selectedStyles = useAppSelector((store) => {
    const index = store.list.selected[0];
    if (index) {
      return store.list.data[index[0]][index[1]].styles || {};
    }
    return {};
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
          className="font-size-input"
          type="number"
          placeholder="size"
          value={selectedStyles?.["fontSize"]?.split("px")?.[0] || ""}
          onChange={(e) => changeStyle("FONT", e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
        />
      </span>
      {/* <button onClick={() => changeStyle("FONT", ((parseInt(selectedFontSize) || 12) + 1).toString())}>+</button> */}

      <button onClick={() => changeStyle("ALIGN-LEFT")}>
        <Icons type="align-left" />
      </button>
      <button onClick={() => changeStyle("ALIGN-CENTER")}>
        <Icons type="align-center" />
      </button>
      <button onClick={() => changeStyle("ALIGN-RIGHT")}>
        <Icons type="align-right" />
      </button>
      <button onClick={() => changeStyle("ALIGN-JUSTIFY")}>
        <Icons type="align-justify" />
      </button>
      
      <input
        type="color"
        value={selectedStyles?.["color"] || "#000000"}
        onChange={(e) => changeStyleWithDebounce("COLOR", e.target.value)}
      />
      <input
        type="color"
        value={selectedStyles?.["background"] || "#000000"}
        onChange={(e) => changeStyleWithDebounce("BACKGROUND", e.target.value)}
      />
    </div>
  );
};
export default Tools;