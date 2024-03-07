import React, { memo, useContext } from "react";
import { useInView } from "react-intersection-observer";
import { DataContext } from ".";

const Column = ({ i, j}) => {
    const { ref, inView } = useInView();
    const { getValue, updateData } = useContext(DataContext);

    return (
      <td ref={ref} className={`${!inView ? "pv-4" : ""}`}>
        {inView && (
          <input
            value={getValue(i,j)}
            onChange={(e) => updateData(i, j, e.target.value)}
          />
        )}
      </td>
    );
}

export default memo(Column);