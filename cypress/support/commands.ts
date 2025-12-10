/// <reference types="cypress" />

// ***********************************************
// This file contains custom commands for E2E testing
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to get a cell by row and column
       * @example cy.getCell(0, 0)
       */
      getCell(row: number, col: number): Chainable<JQuery<HTMLElement>>;
      
      /**
       * Custom command to type in a cell
       * @example cy.typeInCell(0, 0, 'Hello')
       */
      typeInCell(row: number, col: number, value: string): Chainable<void>;
      
      /**
       * Custom command to get cell value (shows calculated result)
       * @example cy.getCellValue(0, 0)
       */
      getCellValue(row: number, col: number): Chainable<string>;
      
      /**
       * Custom command to get cell formula (shows formula expression when focused)
       * @example cy.getCellFormula(0, 0)
       */
      getCellFormula(row: number, col: number): Chainable<string>;
    }
  }
}

// Get a specific cell by row and column (0-indexed)
Cypress.Commands.add('getCell', (row: number, col: number) => {
  // Row index is row + 1 because of header row
  // Col index is col + 1 because of row number column
  return cy.get('table tbody tr').eq(row).find('td').eq(col + 1).find('input.input', { timeout: 10000 });
});

// Type in a specific cell
Cypress.Commands.add('typeInCell', (row: number, col: number, value: string) => {
  cy.getCell(row, col).should('be.visible').click().clear().type(value);
  // Small wait to ensure value is set
  cy.wait(50);
});

// Get value from a specific cell (shows calculated result)
Cypress.Commands.add('getCellValue', (row: number, col: number) => {
  return cy.getCell(row, col).invoke('val') as Cypress.Chainable<string>;
});

// Get formula from a specific cell (shows formula expression when focused)
Cypress.Commands.add('getCellFormula', (row: number, col: number) => {
  return cy.getCell(row, col).click().invoke('val') as Cypress.Chainable<string>;
});

export {};

// Made with Bob
