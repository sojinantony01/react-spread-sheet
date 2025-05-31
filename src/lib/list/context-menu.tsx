import React from 'react';
import { store } from '../store';
import { deleteSelectItems, changeData, updateStyles, setClipboard } from '../reducer';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose }) => {
  const { dispatch } = store;

  const handleCut = () => {
    const selectedData = store.getState().selected.map(([i, j]) => ({
      value: store.getState().data[i][j].value,
      styles: store.getState().data[i][j].styles
    }));
    
    dispatch(setClipboard, { payload: selectedData });
    dispatch(deleteSelectItems);
    onClose();
  };

  const handleCopy = () => {
    const selectedData = store.getState().selected.map(([i, j]) => ({
      value: store.getState().data[i][j].value,
      styles: store.getState().data[i][j].styles
    }));
    
    dispatch(setClipboard, { payload: selectedData });
    onClose();
  };

  const handlePaste = () => {
    const clipboardData = store.getState().clipboard;
    if (clipboardData) {
      const selectedCells = store.getState().selected;
      if (selectedCells.length > 0) {
        const [startI, startJ] = selectedCells[0];
        clipboardData.forEach((item: any, index: number) => {
          const [i, j] = selectedCells[index] || [
            startI + Math.floor(index / store.getState().data[0].length),
            startJ + (index % store.getState().data[0].length)
          ];
          if (i < store.getState().data.length && j < store.getState().data[0].length) {
            dispatch(changeData, { payload: { value: item.value, i, j } });
            if (item.styles) {
              dispatch(updateStyles, { payload: { value: item.styles, i, j } });
            }
          }
        });
      }
    }
    onClose();
  };

  return (
    <div 
      className="sheet-context-menu"
      style={{ 
        position: 'fixed',
        left: x,
        top: y,
        zIndex: 1000
      }}
    >
      <div className="sheet-context-menu-item" onClick={handleCut}>Cut</div>
      <div className="sheet-context-menu-item" onClick={handleCopy}>Copy</div>
      <div className="sheet-context-menu-item" onClick={handlePaste}>Paste</div>
    </div>
  );
};

export default ContextMenu; 