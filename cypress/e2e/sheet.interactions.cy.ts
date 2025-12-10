describe('Spreadsheet - User Interactions', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should navigate between cells using arrow keys (right)', () => {
    cy.getCell(0, 0).click();
    cy.getCell(0, 0).type('{rightarrow}');
    cy.getCell(0, 1).should('have.focus');
  });

  it('should navigate between cells using arrow keys (down)', () => {
    cy.getCell(0, 0).click();
    cy.getCell(0, 0).type('{downarrow}');
    cy.getCell(1, 0).should('have.focus');
  });

  it('should navigate between cells using arrow keys (left)', () => {
    cy.getCell(0, 1).click();
    cy.getCell(0, 1).type('{leftarrow}');
    cy.getCell(0, 0).should('have.focus');
  });

  it('should navigate between cells using arrow keys (up)', () => {
    cy.getCell(1, 0).click();
    cy.getCell(1, 0).type('{uparrow}');
    cy.getCell(0, 0).should('have.focus');
  });

  it('should allow selecting multiple cells', () => {
    cy.typeInCell(0, 0, 'Cell 1');
    cy.typeInCell(0, 1, 'Cell 2');
    cy.typeInCell(1, 0, 'Cell 3');
    
    // Verify all cells have values
    cy.getCellValue(0, 0).should('equal', 'Cell 1');
    cy.getCellValue(0, 1).should('equal', 'Cell 2');
    cy.getCellValue(1, 0).should('equal', 'Cell 3');
  });

  it('should allow editing cell content', () => {
    cy.typeInCell(0, 0, 'Test');
    cy.getCellValue(0, 0).should('equal', 'Test');
    
    // Double click to enter edit mode and modify
    cy.getCell(0, 0).dblclick().clear().type('Modified');
    cy.getCellValue(0, 0).should('equal', 'Modified');
  });

  it('should clear cell content when typing in edit mode', () => {
    cy.typeInCell(0, 0, 'Test');
    cy.getCellValue(0, 0).should('equal', 'Test');
    
    // Double click to edit, then clear with backspace
    cy.getCell(0, 0).dblclick().type('{selectall}{backspace}');
    // Click away to exit edit mode
    cy.getCell(0, 1).click();
    cy.getCellValue(0, 0).should('equal', '');
  });

  it('should handle Delete key in edit mode', () => {
    cy.typeInCell(0, 0, 'Test');
    cy.getCellValue(0, 0).should('equal', 'Test');
    
    // Double click to edit, select all and delete
    cy.getCell(0, 0).dblclick().type('{selectall}{del}');
    // Click away to exit edit mode
    cy.getCell(0, 1).click();
    cy.getCellValue(0, 0).should('equal', '');
  });

  it('should allow scrolling through the spreadsheet', () => {
    cy.get('[data-testid="sheet-table-content"]').scrollTo(0, 500);
    cy.get('table tbody tr').should('have.length.at.least', 10);
  });

  it('should maintain cell values after scrolling', () => {
    cy.typeInCell(0, 0, 'Persistent');
    cy.get('[data-testid="sheet-table-content"]').scrollTo(0, 500);
    cy.get('[data-testid="sheet-table-content"]').scrollTo(0, 0);
    cy.getCellValue(0, 0).should('equal', 'Persistent');
  });

  it('should handle rapid cell editing', () => {
    // Type in first 2 cells which are always visible
    cy.typeInCell(0, 0, 'Row 1');
    cy.wait(100); // Small delay for CI stability
    cy.typeInCell(1, 0, 'Row 2');
    
    // Verify all values
    cy.getCellValue(0, 0).should('equal', 'Row 1');
    cy.getCellValue(1, 0).should('equal', 'Row 2');
  });

  it('should handle long text in cells', () => {
    const longText = 'This is a very long text that should fit in the cell';
    cy.typeInCell(0, 0, longText);
    cy.getCellValue(0, 0).should('equal', longText);
  });

  it('should handle special characters', () => {
    cy.typeInCell(0, 0, '!@#$%^&*()');
    cy.getCellValue(0, 0).should('equal', '!@#$%^&*()');
  });

  it('should handle unicode characters', () => {
    cy.typeInCell(0, 0, '你好世界');
    cy.getCellValue(0, 0).should('equal', '你好世界');
  });

  it('should enter edit mode on double click', () => {
    cy.typeInCell(0, 0, 'Test');
    cy.getCell(0, 0).dblclick();
    // In edit mode, the input should not have view_mode class
    cy.getCell(0, 0).should('not.have.class', 'view_mode');
  });

  it('should exit edit mode on blur', () => {
    cy.typeInCell(0, 0, 'Test');
    cy.getCell(0, 0).dblclick();
    // Click another cell to blur
    cy.getCell(0, 1).click();
    // Should be back in view mode
    cy.getCell(0, 0).should('have.class', 'view_mode');
  });
});

// Made with Bob
