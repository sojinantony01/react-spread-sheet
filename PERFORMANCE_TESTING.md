# Performance Testing Guide

This document describes the performance testing and comparison system for the React Spreadsheet component.

## Overview

The performance testing system automatically measures and compares key performance metrics between your PR changes and the production baseline. This ensures that performance improvements are validated and regressions are caught early.

## Performance Metrics

The system tracks the following metrics:

### 1. Initial Render Time
- **What**: Time to render the spreadsheet initially
- **Target**: < 3000ms
- **Threshold**: Warning at +10%, Error at +25%

### 2. Scroll Performance
- **What**: Average time for scroll operations
- **Target**: < 500ms
- **Threshold**: Warning at +15%, Error at +30%

### 3. Cell Interaction
- **What**: Average time for cell click and type operations
- **Target**: < 1000ms
- **Threshold**: Warning at +10%, Error at +25%

### 4. Memory Usage
- **What**: Memory increase during scrolling operations
- **Target**: < 150MB
- **Threshold**: Warning at +20%, Error at +40%
- **Note**: Higher for large datasets with virtual scrolling buffer

### 5. Formula Calculation
- **What**: Average time for formula calculations
- **Target**: < 1000ms
- **Threshold**: Warning at +10%, Error at +25%

### 6. Virtual Scroll Efficiency
- **What**: Number of rows rendered (lower is better)
- **Target**: < 500 rows
- **Threshold**: Warning at +20%, Error at +50%
- **Note**: Includes buffer rows for smooth scrolling

### 7. Stress Test - Initial Render (1 LAKH cells)
- **What**: Time to initially render 2,500 rows × 40 columns (100,000 cells / 1 LAKH)
- **Target**: < 6000ms
- **Threshold**: Warning at +15%, Error at +30%

### 8. Stress Test - Scroll Performance (1 LAKH cells)
- **What**: Average scroll time across 5 positions with 100k cells loaded
- **Target**: < 800ms
- **Threshold**: Warning at +15%, Error at +30%

### 9. Large Dataset Memory
- **What**: Memory usage with large datasets (1 LAKH cells)
- **Target**: < 500MB
- **Threshold**: Warning at +20%, Error at +40%

### 10. Stress Virtual Scroll Rows
- **What**: Rendered rows count with large datasets (1 LAKH cells)
- **Target**: < 1700 rows
- **Threshold**: Warning at +20%, Error at +50%
- **Note**: Higher buffer needed for smooth scrolling with large datasets

## Running Performance Tests

### Locally

#### Run performance tests only:
```bash
cd cypress
npm run test:performance
```

#### Compare with baseline:
```bash
cd cypress
npm run test:performance
npm run compare:performance
```

#### Establish new baseline:
```bash
cd cypress
npm run test:performance
# Copy metrics.json to baseline-metrics.json
cp performance-results/metrics.json performance-results/baseline-metrics.json
```

### In CI/CD

Performance tests run automatically on every pull request:

1. **E2E Tests**: All functional tests run first
2. **Performance Tests**: Performance metrics are collected
3. **Comparison**: Metrics are compared against baseline
4. **PR Comment**: Results are posted as a PR comment

## Understanding Results

### Status Indicators

- ✅ **Pass**: Performance is within acceptable range or improved
- ⚠️ **Warning**: Performance degraded but within warning threshold
- ❌ **Critical**: Performance degraded beyond acceptable threshold

### Example Report

```markdown
# Performance Comparison Report

## Summary

| Metric | Baseline | Current | Change | Status |
|--------|----------|---------|--------|--------|
| initial_render | 1500.00ms | 1450.00ms | -3.33% | ✅ |
| scroll_performance | 150.00ms | 165.00ms | +10.00% | ⚠️ |
| cell_interaction | 200.00ms | 195.00ms | -2.50% | ✅ |
| memory_usage | 10.00MB | 9.50MB | -5.00% | ✅ |
| formula_calculation | 250.00ms | 240.00ms | -4.00% | ✅ |
| virtual_scroll_efficiency | 30.00rows | 28.00rows | -6.67% | ✅ |
```

## Setting Up Baseline

### Option 1: Fetch from Production Site (Recommended)

This method directly tests the live production site and uses those metrics as baseline:

```bash
cd cypress
npm run fetch:production:baseline
```

This will:
1. Run performance tests against https://sojinantony01.github.io/react-spread-sheet/
2. Collect all performance metrics from production
3. Save them as `baseline-metrics.json`
4. Display the baseline metrics

Then commit the baseline:
```bash
git add performance-results/baseline-metrics.json
git commit -m "chore: establish baseline from production site"
git push
```

### Option 2: Use Current Main Branch

If you want to use the current main branch as baseline:

1. **Ensure main branch is deployed to production**
2. **Run performance tests locally**:
   ```bash
   cd cypress
   npm run test:performance
   ```
3. **Save as baseline**:
   ```bash
   cp performance-results/metrics.json performance-results/baseline-metrics.json
   git add performance-results/baseline-metrics.json
   git commit -m "chore: establish performance baseline"
   git push
   ```

### Updating Baseline

Update the baseline when:
- Major performance improvements are merged
- Significant feature changes affect performance expectations
- Quarterly performance reviews

To update:
```bash
cd cypress
npm run test:performance
cp performance-results/metrics.json performance-results/baseline-metrics.json
git add performance-results/baseline-metrics.json
git commit -m "chore: update performance baseline"
git push
```

## Performance Test Details

### Test Scenarios

#### Standard Performance Tests

The performance test suite ([`cypress/e2e/sheet.performance.cy.ts`](cypress/e2e/sheet.performance.cy.ts)) includes:

1. **Initial Render Test**
   - Measures time from page load to spreadsheet ready
   - Validates render time < 3 seconds

2. **Scroll Performance Test**
   - Performs 5 scroll operations at different distances
   - Measures average scroll time
   - Validates average < 500ms

3. **Cell Interaction Test**
   - Tests clicking and typing in 5 different cells
   - Measures average interaction time
   - Validates average < 1 second

4. **Memory Usage Test**
   - Measures memory before and after scrolling
   - Calculates memory increase
   - Validates increase < 50MB

5. **Formula Calculation Test**
   - Creates cells with formulas
   - Measures calculation time
   - Validates average < 1 second

6. **Virtual Scroll Efficiency Test**
   - Counts rendered rows before and after scrolling
   - Validates virtual scrolling keeps row count low
   - Ensures not all rows are rendered

#### Stress Tests (Large Datasets)

The stress test suite ([`cypress/e2e/sheet.stress.cy.ts`](cypress/e2e/sheet.stress.cy.ts)) includes:

7. **1 LAKH Cells Stress Test**
   - **Dataset**: 2,500 rows × 40 columns (100,000 cells / 1 LAKH)
   - **Initial Render**: Measures time to first paint
     - Target: < 6 seconds
   - **Scroll Performance**: Tests scrolling at 5 positions (0%, 25%, 50%, 75%, 100%)
     - Target: < 800ms average
   - **Memory Usage**: Monitors heap size during operations
     - Target: < 500MB
   - **Virtual Scrolling**: Validates only visible rows are rendered
     - Target: < 1700 rendered rows (with buffer for smooth scrolling)

## Troubleshooting

### Performance Tests Failing

1. **Check if baseline exists**:
   ```bash
   ls -la cypress/performance-results/baseline-metrics.json
   ```

2. **Review performance report**:
   ```bash
   cat cypress/performance-results/comparison-report.md
   ```

3. **Run tests locally**:
   ```bash
   cd cypress
   npm run test:performance:open
   ```

### Baseline Not Found

If baseline doesn't exist, the comparison script will create placeholder values. To establish real baseline:

```bash
cd cypress
node scripts/fetch-baseline.js
npm run test:performance
cp performance-results/metrics.json performance-results/baseline-metrics.json
```

### Memory Tests Not Running

Memory API is Chrome-specific. Ensure tests run in Chrome:
```bash
cd cypress
cypress run --browser chrome --spec "e2e/sheet.performance.cy.ts"
```

## CI/CD Integration

### GitHub Actions Workflow

The performance testing is integrated into [`.github/workflows/test.yml`](.github/workflows/test.yml):

```yaml
- name: Performance tests
  run: |
    cd cypress
    npm run test:performance

- name: Compare performance with baseline
  run: |
    cd cypress
    npm run compare:performance
  continue-on-error: true

- name: Comment PR with performance results
  uses: actions/github-script@v6
  if: github.event_name == 'pull_request'
  with:
    script: |
      # Posts comparison report as PR comment
```

### Artifacts

The following artifacts are uploaded:
- Performance comparison report (Markdown)
- Cypress screenshots (on failure)
- Cypress videos (always)

## Best Practices

1. **Run performance tests before submitting PR**
2. **Review performance report in PR comments**
3. **Investigate any warnings or critical regressions**
4. **Update baseline after merging significant improvements**
5. **Keep baseline in sync with production**

## Comparison Strategy

### What Gets Compared?

The system compares **PR changes** against a **baseline** stored in `baseline-metrics.json`.

### Baseline Source Options

1. **Production Site** (Recommended)
   - Directly tests https://sojinantony01.github.io/react-spread-sheet/
   - Represents actual user experience
   - Use: `npm run fetch:production:baseline`

2. **Latest NPM Package**
   - Tests the published npm package
   - Represents what developers are using
   - Requires manual setup with npm link

3. **Main Branch**
   - Tests current main branch locally
   - Good for incremental improvements
   - Use: `npm run test:performance` then copy to baseline

### Recommended Workflow

1. **Initial Setup**: Fetch baseline from production
   ```bash
   cd cypress
   npm run fetch:production:baseline
   git add performance-results/baseline-metrics.json
   git commit -m "chore: baseline from production"
   ```

2. **PR Development**: Tests automatically compare against baseline

3. **After Major Release**: Update baseline from new production
   ```bash
   npm run fetch:production:baseline
   git add performance-results/baseline-metrics.json
   git commit -m "chore: update baseline post-release"
   ```

This ensures PRs are always compared against the live production version that users experience.

## Related Documentation

- [E2E Testing Guide](E2E_TESTING.md)
- [Cypress README](cypress/README.md)
- [Test Files Overview](cypress/e2e/README.md)

---

Made with Bob