# E2E Testing with Cypress

This project uses Cypress for end-to-end testing of the React Spreadsheet component with a completely isolated testing setup.

## Overview

The E2E tests run against the actual demo application running at `http://localhost:3000`. All Cypress dependencies and configuration are isolated in the `cypress/` folder to keep the main package.json clean.

### Benefits of This Approach

- Tests run in a real browser environment
- No mocking of browser APIs required
- Tests the complete user experience
- Easier to debug and maintain
- Works consistently across different environments
- **Clean main package** - No testing dependencies in main package.json
- **Isolated setup** - All Cypress code contained in cypress folder

## Quick Start

### 1. Install Dependencies

```bash
cd cypress
npm install
```

### 2. Run Tests Interactively

```bash
cd cypress
npm run test:e2e:open
```

This command will:
1. Start the development server at http://localhost:3000
2. Wait for the server to be ready
3. Open the Cypress Test Runner
4. Allow you to select and run tests interactively

### 3. Run Tests in Headless Mode

```bash
cd cypress
npm run test:e2e
```

This command will:
1. Start the development server
2. Run all E2E tests in headless mode
3. Generate test results
4. Capture screenshots on failure

## Test Files

All E2E tests are located in the `cypress/e2e/` directory:

### `sheet.basic.cy.ts`
Tests basic spreadsheet operations:
- Loading the application
- Displaying headers and row numbers
- Clicking and typing in cells
- Editing cell values
- Handling numeric and text values

### `sheet.formulas.cy.ts`
Tests formula calculations:
- Arithmetic operations (+, -, *, /)
- Cell references (A1, B2, etc.)
- Complex formulas with parentheses
- Formula updates when referenced cells change
- Negative and decimal numbers

**Note**: The spreadsheet currently supports basic arithmetic operations and cell references, but does NOT support:
- Excel functions (SUM, AVERAGE, MAX, MIN)
- Formulas referencing other formula cells (only direct cell values)

### `sheet.interactions.cy.ts`
Tests user interactions:
- Arrow key navigation (up, down, left, right)
- Cell editing via double-click
- Edit mode behavior (entering/exiting)
- Clearing cell content in edit mode
- Scrolling behavior
- Special characters and Unicode support

**Note**: The spreadsheet does NOT support:
- Tab/Enter key navigation (only arrow keys)
- Built-in undo/redo functionality

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
Gets the value from a specific cell (shows calculated result for formulas).

```typescript
cy.getCellValue(0, 0).should('equal', 'Hello')
cy.getCellValue(0, 1).should('equal', '20') // Shows result of formula
```

### `cy.getCellFormula(row, col)`
Gets the formula from a specific cell (shows formula expression when focused).

```typescript
cy.getCellFormula(0, 1).should('equal', '=A1*2') // Shows formula expression
```

## Configuration

Cypress configuration is in `cypress/cypress.config.ts`:

```typescript
{
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    video: false,
    screenshotOnRunFailure: true,
  }
}
```

## Package Scripts

The following npm scripts are available in `cypress/package.json`:

- `npm run test:e2e:open` - Opens Cypress Test Runner (starts dev server automatically)
- `npm run test:e2e` - Runs all tests in headless mode (starts dev server automatically)
- `npm run cypress:open` - Opens Cypress Test Runner (requires dev server to be running)
- `npm run cypress:run` - Runs tests in headless mode (requires dev server to be running)

## Isolated Setup Structure

```
cypress/
├── package.json          # Cypress dependencies and scripts
├── cypress.config.ts     # Cypress configuration
├── README.md            # Testing documentation
├── e2e/                 # Test files
│   ├── sheet.basic.cy.ts
│   ├── sheet.formulas.cy.ts
│   └── sheet.interactions.cy.ts
└── support/             # Support files
    ├── e2e.ts
    └── commands.ts
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

1. **Use Custom Commands**: Prefer `cy.getCell()`, `cy.typeInCell()` over raw selectors
2. **Clear State**: Use `beforeEach()` to visit the page for a clean state
3. **Descriptive Names**: Use clear test names that explain the behavior
4. **One Behavior Per Test**: Keep tests focused on a single feature
5. **Avoid Hard Waits**: Use `.should()` assertions instead of `cy.wait(ms)`
6. **Test User Flows**: Test complete user scenarios, not just individual functions

### Example: Testing Formula Updates

```typescript
it('should update formula when referenced cell changes', () => {
  // Setup initial values
  cy.typeInCell(0, 0, '10');
  cy.typeInCell(0, 1, '=A1*2');
  
  // Click away to unfocus and see calculated result
  cy.getCell(1, 0).click();
  cy.getCellValue(0, 1).should('equal', '20');
  
  // Change source value
  cy.typeInCell(0, 0, '15');
  
  // Click away to see updated result
  cy.getCell(1, 0).click();
  cy.getCellValue(0, 1).should('equal', '30');
  
  // Verify formula is preserved when focused
  cy.getCellFormula(0, 1).should('equal', '=A1*2');
});
```

## Important: Formula Testing Behavior

When testing formulas, remember that the spreadsheet behaves like Excel:

1. **Focused cells show formula expression**: `=A1*2`
2. **Unfocused cells show calculated result**: `20`

### Best Practices for Formula Testing

Always click away from a formula cell before checking its calculated value:

```typescript
// ❌ Wrong - will show formula expression
cy.typeInCell(0, 0, '=A1*2');
cy.getCellValue(0, 0).should('equal', '20'); // Fails!

// ✅ Correct - click away first to see result
cy.typeInCell(0, 0, '=A1*2');
cy.getCell(1, 0).click(); // Click away to unfocus
cy.getCellValue(0, 0).should('equal', '20'); // Works!

// ✅ Or use getCellFormula to check the formula
cy.getCellFormula(0, 0).should('equal', '=A1*2'); // Works!
```

### Testing Both Formula and Result

```typescript
it('should handle formulas correctly', () => {
  cy.typeInCell(0, 0, '10');
  cy.typeInCell(0, 1, '=A1*2');
  
  // Test the calculated result (unfocused)
  cy.getCell(1, 0).click();
  cy.getCellValue(0, 1).should('equal', '20');
  
  // Test the formula expression (focused)
  cy.getCellFormula(0, 1).should('equal', '=A1*2');
});
```

## Debugging Tests

### Visual Debugging
1. Run `npm run test:e2e:open`
2. Click on a test to run it
3. Use the time-travel feature to see each step
4. Hover over commands to see snapshots
5. Use browser DevTools to inspect elements

### Screenshots
Failed tests automatically capture screenshots in `cypress/screenshots/`

### Console Logs
Add `cy.log()` statements for debugging:
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

### Port Configuration
The project is configured to use port 3000 by default. If you need to use a different port:
```bash
# Update the main package.json "start" script
"start": "PORT=3001 react-scripts start"

# Then update baseUrl in cypress/cypress.config.ts
baseUrl: 'http://localhost:3001'

# And update the test scripts in cypress/package.json
"test:e2e": "start-server-and-test 'cd .. && npm start' http://localhost:3001 'cypress run --e2e'"
```

### Tests Timing Out
- Increase timeout in `cypress.config.ts`
- Check if dev server started successfully
- Verify network requests are completing

### Elements Not Found
- Use `.should('exist')` before interacting
- Check if element selectors are correct
- Verify the page has loaded completely

### Flaky Tests
- Avoid hard waits (`cy.wait(ms)`)
- Use proper assertions (`.should()`)
- Ensure tests are independent
- Clear state between tests with `beforeEach()`

## Differences from Component Testing

This project previously used Cypress component testing but switched to E2E testing for the following reasons:

### Component Testing Issues
- Required complex webpack configuration
- Needed mocking of browser APIs (IntersectionObserver)
- Had CSS loading issues
- Required special handling for virtual scrolling
- More difficult to debug

### E2E Testing Benefits
- ✅ No webpack configuration needed
- ✅ No mocking required - tests real browser behavior
- ✅ CSS loads automatically
- ✅ Virtual scrolling works naturally
- ✅ Easier to debug with real browser
- ✅ Tests complete user experience
- ✅ More reliable and maintainable

## Dependencies

All Cypress dependencies are isolated in `cypress/package.json`:

```json
{
  "devDependencies": {
    "cypress": "^13.13.0",
    "start-server-and-test": "^2.0.3"
  }
}
```

The main `package.json` remains clean with no testing dependencies:
- ✅ **Clean main package** - No Cypress dependencies in root package.json
- ✅ **Isolated testing** - All test deps contained in cypress folder
- ✅ **Optional testing** - Main package works without installing test dependencies
- ✅ **Independent versioning** - Can update Cypress without affecting main package

### Installation

```bash
# Install main package dependencies
npm install

# Install testing dependencies (optional)
cd cypress && npm install
```

## Resources

- [Cypress Documentation](https://docs.cypress.io)
- [E2E Testing Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Custom Commands](https://docs.cypress.io/api/cypress-api/custom-commands)
- [Test Files in cypress/e2e/](./cypress/e2e/)