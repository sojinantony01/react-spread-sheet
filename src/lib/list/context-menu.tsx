import React, { useCallback, useEffect, useState } from "react";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  copyToClipBoard: () => void;
  cutItemsToClipBoard: () => void;
  pasteFromClipBoard: () => void;
  changeInputType?: (inputType: string) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  copyToClipBoard,
  cutItemsToClipBoard,
  pasteFromClipBoard,
  changeInputType,
}) => {
  const [showInputTypeSubmenu, setShowInputTypeSubmenu] = useState(false);

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
    console.log('Context menu: handleInputTypeChange called with:', inputType);
    changeInputType?.(inputType);
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
    { key: "email", label: "Email" },
    { key: "url", label: "URL" },
    { key: "tel", label: "Phone" },
    { key: "select", label: "Select options" },
    { key: "checkbox", label: "Checkbox" }
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
      <div 
        className="sheet-context-menu-item sheet-context-menu-item-with-submenu" 
        role="menuitem"
        onMouseEnter={() => setShowInputTypeSubmenu(true)}
        onMouseLeave={() => setShowInputTypeSubmenu(false)}
      >
        Input Type
        {showInputTypeSubmenu && (
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
    </div>
  );
};

export default ContextMenu;
