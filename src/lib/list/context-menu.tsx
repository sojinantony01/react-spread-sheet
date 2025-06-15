import React, { useCallback, useEffect } from "react";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  copyToClipBoard: () => void;
  cutItemsToClipBoard: () => void;
  pasteFromClipBoard: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  copyToClipBoard,
  cutItemsToClipBoard,
  pasteFromClipBoard,
}) => {
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

  const closeOnOutsideClick = useCallback((e: MouseEvent) => {
    const inside = ((e.target as HTMLElement).closest('.sheet-context-menu'));
    if(!inside) {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    document.addEventListener("click", closeOnOutsideClick);
    return () => {
      document.removeEventListener("click", closeOnOutsideClick);
    };
  }, [closeOnOutsideClick]);

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
    </div>
  );
};

export default ContextMenu;
