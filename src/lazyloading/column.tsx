import React, { memo } from "react";
import { useInView } from "react-intersection-observer";

const Column = ({data, update, i, j}) => {
    const { ref, inView } = useInView();
    return (
      <td ref={ref} className={`${!inView ? "pv-4" : ""}`}>
         {inView && <input value={data.value} onChange={(e) => update(e, i, j)} />}   
      </td>
    );
}

export default memo(Column);
