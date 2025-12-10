# Cypress E2E Tests

This directory contains end-to-end tests for the React Spreadsheet component.

## Test Structure

- **sheet.basic.cy.ts** - Basic spreadsheet operations (12 tests: cell editing, data persistence, cell selection, styling)
- **sheet.formulas.cy.ts** - Formula calculations (10 tests: arithmetic operations +, -, *, /, cell references, complex formulas with parentheses)
- **sheet.interactions.cy.ts** - User interactions (15 tests: arrow key navigation, cell editing, scrolling, edit mode behavior)

## Running Tests

### Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Install Cypress (if not already installed):
```bash
npx cypress install
```

### Run Tests

#### Interactive Mode (Recommended for Development)
Opens Cypress Test Runner where you can see tests running in real-time:

```bash
npm run test:e2e:open
```

This will:
1. Start the development server at http://localhost:3000
2. Open Cypress Test Runner
3. Wait for you to select and run tests

#### Headless Mode (CI/CD)
Runs all tests in headless mode:

```bash
npm run test:e2e
```

This will:
1. Start the development server
2. Run all E2E tests
3. Generate test results and screenshots (on failure)

#### Manual Testing
If you want to run Cypress against an already running server:

```bash
# Terminal 1: Start the dev server
npm start

# Terminal 2: Run Cypress
npm run cypress:open  # Interactive mode
# or
npm run cypress:run   # Headless mode
```

## Test Configuration

Tests are configured in `cypress.config.ts`:
- Base URL: http://localhost:3000
- Viewport: 1280x720
- Timeout: 10 seconds
- Screenshots on failure: Enabled
- Video recording: Disabled (can be enabled if needed)

## Custom Commands

Custom Cypress commands are defined in `cypress/support/commands.ts`:

### `cy.getCell(row, col)`
Gets a cell by row and column index (0-based).

```typescript
cy.getCell(0, 0) // Gets cell A1
cy.getCell(1, 2) // Gets cell C2
```

### `cy.typeInCell(row, col, value)`
Types a value into a specific cell.

```typescript
cy.typeInCell(0, 0, 'Hello')
cy.typeInCell(1, 1, '=SUM(A1:A10)')
```

### `cy.getCellValue(row, col)`
Gets the value from a specific cell.

```typescript
cy.getCellValue(0, 0).should('equal', 'Hello')
```

## Writing New Tests

### Basic Test Structure

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should do something', () => {
    // Arrange
    cy.typeInCell(0, 0, '10');
    
    // Act
    cy.typeInCell(0, 1, '=A1*2');
    
    // Assert
    cy.getCellValue(0, 1).should('equal', '20');
  });
});
```

### Best Practices

1. **Use Custom Commands**: Use `cy.getCell()`, `cy.typeInCell()`, etc. instead of raw selectors
2. **Wait for Elements**: Use `.should('be.visible')` or `.should('exist')` before interacting
3. **Clear State**: Use `beforeEach()` to visit the page and start with a clean state
4. **Descriptive Names**: Use clear, descriptive test names that explain what is being tested
5. **One Assertion Per Test**: Keep tests focused on a single behavior
6. **Avoid Hard Waits**: Use `.should()` assertions instead of `cy.wait(ms)`

### Example Test

```typescript
it('should calculate formula when cell value changes', () => {
  // Setup initial values
  cy.typeInCell(0, 0, '10');
  cy.typeInCell(0, 1, '=A1*2');
  
  // Verify initial calculation
  cy.getCellValue(0, 1).should('equal', '20');
  
  // Change source value
  cy.typeInCell(0, 0, '15');
  
  // Verify formula recalculates
  cy.getCellValue(0, 1).should('equal', '30');
});
```

## Debugging Tests

### Visual Debugging
1. Run tests in interactive mode: `npm run test:e2e:open`
2. Click on a test to run it
3. Use the time-travel feature to see each step
4. Hover over commands to see snapshots

### Screenshots
Failed tests automatically capture screenshots in `cypress/screenshots/`

### Console Logs
Add `cy.log()` statements to debug:
```typescript
cy.log('Testing cell A1');
cy.typeInCell(0, 0, 'Test');
```

### Pause Execution
Use `cy.pause()` to pause test execution:
```typescript
cy.typeInCell(0, 0, 'Test');
cy.pause(); // Execution pauses here
cy.getCellValue(0, 0).should('equal', 'Test');
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: cypress-screenshots
          path: cypress/screenshots
```

## Troubleshooting

### Tests Timing Out
- Increase timeout in `cypress.config.ts`
- Check if dev server is running properly
- Verify network requests are completing

### Elements Not Found
- Use `.should('exist')` before interacting
- Check if element selectors are correct
- Verify the page has loaded completely

### Flaky Tests
- Avoid hard waits (`cy.wait(ms)`)
- Use proper assertions (`.should()`)
- Ensure tests are independent
- Clear state between tests

## Resources

- [Cypress Documentation](https://docs.cypress.io)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Custom Commands](https://docs.cypress.io/api/cypress-api/custom-commands)