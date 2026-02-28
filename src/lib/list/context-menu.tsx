import React, { useCallback, useEffect, useState } from "react";
import Icons from "../svg/icons";
import {
  addColumn,
  addRow,
  deleteColumn,
  deleteRow,
  mergeCells,
  updateInputTypes,
} from "../reducer";
import { store } from "../store";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  copyToClipBoard: () => void;
  cutItemsToClipBoard: () => void;
  pasteFromClipBoard: () => void;
  onChange?(i?: number, j?: number, value?: string): void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  copyToClipBoard,
  cutItemsToClipBoard,
  pasteFromClipBoard,
  onChange,
}) => {
  const [showSubmenu, setShowSubmenu] = useState<
    "input-type" | "add-row" | "add-column" | undefined
  >();
  const { dispatch } = store;
  const handleCut = () => {
    cutItemsToClipBoard();
    onClose();
  };

  const handleCopy = () => {
    copyToClipBoard();
    onClose();
  };

  const handlePaste = () => {
    pasteFromClipBoard();
    onClose();
  };

  const handleInputTypeChange = (inputType: string) => {
    dispatch(updateInputTypes, { payload: { type: inputType } });
    onChange && onChange();
    onClose();
  };

  const mergeCell = () => {
    dispatch(mergeCells);
    onChange && onChange();
    onClose();
  };

  const closeOnOutsideClick = useCallback(
    (e: MouseEvent) => {
      const inside = (e.target as HTMLElement).closest(".sheet-context-menu");
      if (!inside) {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("click", closeOnOutsideClick);
    return () => {
      document.removeEventListener("click", closeOnOutsideClick);
    };
  }, [closeOnOutsideClick]);

  const inputTypes = [
    { key: "text", label: "Text" },
    { key: "number", label: "Number" },
    { key: "date", label: "Date" },
    // { key: "select", label: "Select options" },
  ];

  return (
    <div
      className="sheet-context-menu"
      role="menu"
      style={{
        position: "fixed",
        left: x,
        top: y,
      }}
    >
      <div className="sheet-context-menu-item" role="menuitem" onClick={handleCut}>
        Cut
      </div>
      <div className="sheet-context-menu-item" role="menuitem" onClick={handleCopy}>
        Copy
      </div>
      <div className="sheet-context-menu-item" role="menuitem" onClick={handlePaste}>
        Paste
      </div>
      <div className="sheet-context-menu-divider"></div>
      <div className="sheet-context-menu-item" role="menuitem" onClick={() => mergeCell()}>
        Merge cells
      </div>
      <div className="sheet-context-menu-divider"></div>
      <div
        className="sheet-context-menu-item sheet-context-menu-item-with-submenu"
        role="menuitem"
        onMouseEnter={() => setShowSubmenu("input-type")}
        onMouseLeave={() => setShowSubmenu(undefined)}
      >
        Input Type <Icons type="right-arrow" />
        {showSubmenu === "input-type" && (
          <div className="sheet-context-submenu">
            {inputTypes.map((type) => (
              <div
                key={type.key}
                className="sheet-context-menu-item"
                role="menuitem"
                onClick={() => handleInputTypeChange(type.key)}
              >
                {type.label}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="sheet-context-menu-divider"></div>
      <div
        className="sheet-context-menu-item sheet-context-menu-item-with-submenu"
        role="menuitem"
        onMouseEnter={() => setShowSubmenu("add-row")}
        onMouseLeave={() => setShowSubmenu(undefined)}
      >
        Add Row <Icons type="right-arrow" />
        {showSubmenu === "add-row" && (
          <div className="sheet-context-submenu">
            <div
              className="sheet-context-menu-item"
              role="menuitem"
              onClick={() => {
                dispatch(addRow, { payload: { below: false } });
                onClose();
              }}
            >
              Above
            </div>
            <div
              className="sheet-context-menu-item"
              role="menuitem"
              onClick={() => {
                dispatch(addRow, { payload: { below: true } });
                onClose();
              }}
            >
              Below
            </div>
          </div>
        )}
      </div>
      <div
        className="sheet-context-menu-item sheet-context-menu-item-with-submenu"
        role="menuitem"
        onMouseEnter={() => setShowSubmenu("add-column")}
        onMouseLeave={() => setShowSubmenu(undefined)}
      >
        Add Column <Icons type="right-arrow" />
        {showSubmenu === "add-column" && (
          <div className="sheet-context-submenu">
            <div
              className="sheet-context-menu-item"
              role="menuitem"
              onClick={() => {
                dispatch(addColumn, { payload: { right: true } });
                onClose();
              }}
            >
              Right
            </div>
            <div
              className="sheet-context-menu-item"
              role="menuitem"
              onClick={() => {
                dispatch(addColumn, { payload: { right: false } });
                onClose();
              }}
            >
              Left
            </div>
          </div>
        )}
      </div>
      <div
        className="sheet-context-menu-item"
        role="menuitem"
        onClick={() => {
          dispatch(deleteRow);
          onClose();
        }}
      >
        Delete Row
      </div>
      <div
        className="sheet-context-menu-item"
        role="menuitem"
        onClick={() => {
          dispatch(deleteColumn);
          onClose();
        }}
      >
        Delete Column
      </div>
    </div>
  );
};

export default ContextMenu;
