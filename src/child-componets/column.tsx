import React, { memo } from "react";

const Column = ({data, update, i, j}) => {
    return (
      <td className="pv-4">
        <input value={data.value} onChange={(e) => update(e, i, j)} />
      </td>
    );
}

export default Column;