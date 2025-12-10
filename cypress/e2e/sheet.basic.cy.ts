describe('Spreadsheet - Basic Operations', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the spreadsheet application', () => {
    cy.get('[data-testid="sheet-table"]').should('exist');
    cy.get('table').should('be.visible');
  });

  it('should display header row with column letters', () => {
    cy.get('table thead tr th').should('have.length.at.least', 5);
    cy.get('table thead tr th').eq(1).should('contain', 'A');
    cy.get('table thead tr th').eq(2).should('contain', 'B');
    cy.get('table thead tr th').eq(3).should('contain', 'C');
  });

  it('should display row numbers', () => {
    cy.get('table tbody tr').first().find('td').first().should('contain', '1');
    cy.get('table tbody tr').eq(1).find('td').first().should('contain', '2');
  });

  it('should allow clicking on a cell', () => {
    cy.getCell(0, 0).click();
    cy.getCell(0, 0).should('have.focus');
  });

  it('should allow typing in a cell', () => {
    cy.typeInCell(0, 0, 'Test Value');
    cy.getCellValue(0, 0).should('equal', 'Test Value');
  });

  it('should allow editing existing cell value', () => {
    cy.typeInCell(0, 0, 'Initial');
    cy.getCellValue(0, 0).should('equal', 'Initial');
    
    cy.typeInCell(0, 0, 'Updated');
    cy.getCellValue(0, 0).should('equal', 'Updated');
  });

  it('should allow entering data in multiple cells', () => {
    cy.typeInCell(0, 0, 'A1');
    cy.typeInCell(0, 1, 'B1');
    cy.typeInCell(1, 0, 'A2');
    
    cy.getCellValue(0, 0).should('equal', 'A1');
    cy.getCellValue(0, 1).should('equal', 'B1');
    cy.getCellValue(1, 0).should('equal', 'A2');
  });

  it('should clear cell value when cleared', () => {
    cy.typeInCell(0, 0, 'Test');
    cy.getCellValue(0, 0).should('equal', 'Test');
    
    cy.getCell(0, 0).click().clear();
    cy.getCellValue(0, 0).should('equal', '');
  });

  it('should handle numeric values', () => {
    cy.typeInCell(0, 0, '123');
    cy.getCellValue(0, 0).should('equal', '123');
  });

  it('should handle decimal values', () => {
    cy.typeInCell(0, 0, '123.45');
    cy.getCellValue(0, 0).should('equal', '123.45');
  });

  it('should handle negative values', () => {
    cy.typeInCell(0, 0, '-50');
    cy.getCellValue(0, 0).should('equal', '-50');
  });
});

// Made with Bob
