# E2E & Performance Testing Setup

This directory contains a completely isolated E2E and performance testing setup for the React Spreadsheet component.

## Overview

All Cypress dependencies and scripts are contained within this `cypress/` folder to keep the main package.json clean. The tests run against the actual demo application at `http://localhost:3000`.

## Setup

### 1. Install Dependencies

From the `cypress/` directory:

```bash
cd cypress
npm install
```

This will install:
- `cypress` - The testing framework
- `start-server-and-test` - Utility to start dev server and run tests

### 2. Run Tests

#### Interactive Mode (Recommended)
```bash
cd cypress
npm run test:e2e:open
```

This will:
1. Start the main app's dev server at http://localhost:3000
2. Wait for the server to be ready
3. Open Cypress Test Runner
4. Allow you to select and run tests interactively

#### Headless Mode (CI/CD)
```bash
cd cypress
npm run test:e2e
```

This will run all tests in headless mode and generate results.

#### Manual Testing
If you want to run Cypress against an already running server:

```bash
# Terminal 1: From project root, start the dev server
npm start

# Terminal 2: From cypress folder, run Cypress
cd cypress
npm run cypress:open  # Interactive mode
# or
npm run cypress:run   # Headless mode
```

## Test Files

All tests are in the `e2e/` subdirectory:

### E2E Tests

- **`sheet.basic.cy.ts`** - Basic spreadsheet operations (12 tests)
  - Loading the application
  - Cell editing and navigation
  - Data entry and validation

- **`sheet.formulas.cy.ts`** - Formula calculations (10 tests)
  - Arithmetic operations (+, -, *, /)
  - Cell references (A1, B2, etc.)
  - Complex formulas with parentheses
  - Formula updates when cells change
  - Negative and decimal numbers
  
  **Note**: The spreadsheet supports basic arithmetic and cell references, but does NOT support:
  - Excel functions (SUM, AVERAGE, MAX, MIN)
  - Formulas referencing other formula cells (only direct values)

- **`sheet.interactions.cy.ts`** - User interactions (15 tests)
  - Arrow key navigation
  - Cell editing and edit mode
  - Scrolling behavior
  - Special characters and Unicode

### Performance Tests

- **`sheet.performance.cy.ts`** - Performance benchmarks (6 tests)
  - Initial render time measurement
  - Scroll performance testing
  - Cell interaction speed
  - Memory usage tracking
  - Formula calculation performance
  - Virtual scrolling efficiency

See [PERFORMANCE_TESTING.md](../PERFORMANCE_TESTING.md) for detailed performance testing documentation.

## Custom Commands

Custom Cypress commands are defined in `support/commands.ts`:

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

The Cypress configuration is in `cypress.config.ts`:

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

Available scripts in `cypress/package.json`:

### E2E Testing
- `npm run test:e2e:open` - Opens Cypress Test Runner (starts dev server automatically)
- `npm run test:e2e` - Runs all E2E tests in headless mode (starts dev server automatically)
- `npm run cypress:open` - Opens Cypress Test Runner (requires dev server to be running)
- `npm run cypress:run` - Runs tests in headless mode (requires dev server to be running)

### Performance Testing
- `npm run test:performance` - Runs performance tests and collects metrics
- `npm run test:performance:baseline` - Fetches baseline and runs performance tests
- `npm run compare:performance` - Compares current metrics with baseline

### Utilities
- `npm run install` - Installs Cypress binary

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

## Debugging

### Visual Debugging
1. Run `npm run test:e2e:open`
2. Click on a test to run it
3. Use the time-travel feature to see each step
4. Hover over commands to see snapshots

### Screenshots
Failed tests automatically capture screenshots in `screenshots/`

### Console Logs
Add `cy.log()` statements for debugging:
```typescript
cy.log('Testing cell A1');
cy.typeInCell(0, 0, 'Test');
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
      - run: cd cypress && npm ci
      - run: cd cypress && npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: cypress-screenshots
          path: cypress/screenshots
```

## Benefits of Isolated Setup

- ✅ **Clean Main Package**: No testing dependencies in main package.json
- ✅ **Isolated Dependencies**: All Cypress deps contained in cypress folder
- ✅ **Independent Versioning**: Can update Cypress without affecting main package
- ✅ **Easy Maintenance**: All testing code and config in one place
- ✅ **Optional Testing**: Main package works without installing test dependencies

## Troubleshooting

### Tests Timing Out
- Check if dev server is running properly at http://localhost:3000
- Increase timeout in `cypress.config.ts`

### Elements Not Found
- Use `.should('exist')` before interacting
- Verify the page has loaded completely

### Port Issues
If port 3000 is in use, you can:
1. Kill the process: `lsof -ti:3000 | xargs kill -9`
2. Or update the port in both `cypress.config.ts` and `package.json` scripts

## Resources

- [Cypress Documentation](https://docs.cypress.io)
- [E2E Testing Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Custom Commands](https://docs.cypress.io/api/cypress-api/custom-commands)