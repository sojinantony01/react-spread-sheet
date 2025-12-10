describe('Spreadsheet - Formula Calculations', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should calculate simple addition', () => {
    cy.typeInCell(0, 0, '5');
    cy.typeInCell(0, 1, '3');
    cy.typeInCell(0, 2, '=A1+B1');
    
    // Click away to see result
    cy.getCell(1, 0).click();
    cy.getCellValue(0, 2).should('equal', '8');
    
    // Verify formula is preserved when focused
    cy.getCellFormula(0, 2).should('equal', '=A1+B1');
  });

  it('should calculate simple subtraction', () => {
    cy.typeInCell(0, 0, '10');
    cy.typeInCell(0, 1, '3');
    cy.typeInCell(0, 2, '=A1-B1');
    
    // Click away to see result
    cy.getCell(1, 0).click();
    cy.getCellValue(0, 2).should('equal', '7');
  });

  it('should calculate simple multiplication', () => {
    cy.typeInCell(0, 0, '4');
    cy.typeInCell(0, 1, '5');
    cy.typeInCell(0, 2, '=A1*B1');
    
    // Click away to see result
    cy.getCell(1, 0).click();
    cy.getCellValue(0, 2).should('equal', '20');
  });

  it('should calculate simple division', () => {
    cy.typeInCell(0, 0, '20');
    cy.typeInCell(0, 1, '4');
    cy.typeInCell(0, 2, '=A1/B1');
    
    // Click away to see result
    cy.getCell(1, 0).click();
    cy.getCellValue(0, 2).should('equal', '5');
  });

  it('should handle multiple cell references', () => {
    cy.typeInCell(0, 0, '10');
    cy.typeInCell(0, 1, '5');
    cy.typeInCell(0, 2, '3');
    cy.typeInCell(0, 3, '=A1+B1+C1');
    
    // Click away to see result
    cy.getCell(1, 0).click();
    cy.getCellValue(0, 3).should('equal', '18');
  });

  it('should update formula when referenced cell changes', () => {
    cy.typeInCell(0, 0, '10');
    cy.typeInCell(0, 1, '=A1*2');
    
    // Click away to see initial result
    cy.getCell(1, 0).click();
    cy.getCellValue(0, 1).should('equal', '20');
    
    // Change source value
    cy.typeInCell(0, 0, '15');
    
    // Click away to see updated result
    cy.getCell(1, 0).click();
    cy.getCellValue(0, 1).should('equal', '30');
  });

  it('should handle complex formulas with multiple operations', () => {
    cy.typeInCell(0, 0, '10');
    cy.typeInCell(0, 1, '5');
    cy.typeInCell(0, 2, '2');
    cy.typeInCell(0, 3, '=(A1+B1)*C1');
    
    // Click away to see result
    cy.getCell(1, 0).click();
    cy.getCellValue(0, 3).should('equal', '30');
    
    // Verify the formula is preserved when focused
    cy.getCellFormula(0, 3).should('equal', '=(A1+B1)*C1');
  });

  it('should handle formulas with subtraction and division', () => {
    cy.typeInCell(0, 0, '100');
    cy.typeInCell(0, 1, '20');
    cy.typeInCell(0, 2, '4');
    cy.typeInCell(0, 3, '=(A1-B1)/C1');
    
    // Click away to see result
    cy.getCell(1, 0).click();
    cy.getCellValue(0, 3).should('equal', '20');
  });

  it('should handle negative numbers in formulas', () => {
    cy.typeInCell(0, 0, '5');
    cy.typeInCell(0, 1, '10');
    cy.typeInCell(0, 2, '=A1-B1');
    
    // Click away to see result
    cy.getCell(1, 0).click();
    cy.getCellValue(0, 2).should('equal', '-5');
  });

  it('should handle decimal numbers in formulas', () => {
    cy.typeInCell(0, 0, '10.5');
    cy.typeInCell(0, 1, '2.5');
    cy.typeInCell(0, 2, '=A1+B1');
    
    // Click away to see result
    cy.getCell(1, 0).click();
    cy.getCellValue(0, 2).should('equal', '13');
  });

});
