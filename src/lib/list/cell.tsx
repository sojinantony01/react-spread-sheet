import React, { memo } from "react";
import { useInView } from "react-intersection-observer";
import Input from "./input";
interface Prop {
  i: number;
  j: number;
  onChange?(i: number, j: number, value: string): void;
}
const Cell = (props: Prop) => {
  const { ref, inView } = useInView({
    root: document.getElementsByClassName("sheet-table")[0],
    rootMargin: "100px",
  });
  return (
    <td ref={ref}>
      {!inView ? <div className="input-dummy">{}</div> : <Input {...props} />}
    </td>
  );
};

export default memo(Cell);
