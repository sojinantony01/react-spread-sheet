#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Performance Comparison Script
 * Compares performance metrics between baseline (production) and current PR
 */

const PERFORMANCE_DIR = path.join(__dirname, '..', 'performance-results');
const BASELINE_FILE = path.join(PERFORMANCE_DIR, 'baseline-metrics.json');
const CURRENT_FILE = path.join(PERFORMANCE_DIR, 'metrics.json');
const REPORT_FILE = path.join(PERFORMANCE_DIR, 'comparison-report.md');

// Performance thresholds (percentage change that triggers warning/error)
const THRESHOLDS = {
  initial_render: { warning: 10, error: 25 }, // % slower is bad
  scroll_performance: { warning: 15, error: 30 },
  cell_interaction: { warning: 10, error: 25 },
  memory_usage: { warning: 20, error: 40 },
  formula_calculation: { warning: 10, error: 25 },
  virtual_scroll_efficiency: { warning: 20, error: 50 } // More rows is bad
};

function readMetrics(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function getAverageValue(metricArray) {
  if (!metricArray || metricArray.length === 0) return 0;
  const sum = metricArray.reduce((acc, item) => acc + item.value, 0);
  return sum / metricArray.length;
}

function calculateChange(baseline, current) {
  if (baseline === 0) return 0;
  return ((current - baseline) / baseline) * 100;
}

function getStatusEmoji(change, threshold, lowerIsBetter = true) {
  const absChange = Math.abs(change);
  const isWorse = lowerIsBetter ? change > 0 : change < 0;
  
  if (!isWorse) {
    return '✅'; // Improvement
  } else if (absChange >= threshold.error) {
    return '❌'; // Critical regression
  } else if (absChange >= threshold.warning) {
    return '⚠️'; // Warning
  } else {
    return '✅'; // Within acceptable range
  }
}

function generateReport(baseline, current) {
  const metrics = Object.keys(THRESHOLDS);
  let report = '# Performance Comparison Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `Comparing: **PR Branch** vs **Main Branch**\n\n`;
  
  report += '## Summary\n\n';
  report += '| Metric | Main Branch | PR Branch | Difference | Change % | Status |\n';
  report += '|--------|-------------|-----------|------------|----------|--------|\n';
  
  let hasRegressions = false;
  let hasCriticalRegressions = false;
  
  metrics.forEach(metric => {
    const baselineValue = baseline && baseline[metric] ? getAverageValue(baseline[metric]) : 0;
    const currentValue = current && current[metric] ? getAverageValue(current[metric]) : 0;
    
    if (baselineValue === 0 && currentValue === 0) {
      report += `| ${metric} | N/A | N/A | N/A | ⚪ |\n`;
      return;
    }
    
    const change = calculateChange(baselineValue, currentValue);
    const threshold = THRESHOLDS[metric];
    const lowerIsBetter = metric !== 'virtual_scroll_efficiency';
    const status = getStatusEmoji(change, threshold, lowerIsBetter);
    
    const unit = current && current[metric] && current[metric][0] ? current[metric][0].unit : '';
    const diff = currentValue - baselineValue;
    const diffStr = diff > 0 ? `+${diff.toFixed(2)}${unit}` : `${diff.toFixed(2)}${unit}`;
    const changeStr = change > 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`;
    
    report += `| ${metric} | ${baselineValue.toFixed(2)}${unit} | ${currentValue.toFixed(2)}${unit} | ${diffStr} | ${changeStr} | ${status} |\n`;
    
    if (status === '⚠️') hasRegressions = true;
    if (status === '❌') hasCriticalRegressions = true;
  });
  
  report += '\n## Quantitative Analysis\n\n';
  
  report += '### Performance Differences (Main → PR)\n\n';
  
  metrics.forEach(metric => {
    const baselineValue = baseline && baseline[metric] ? getAverageValue(baseline[metric]) : 0;
    const currentValue = current && current[metric] ? getAverageValue(current[metric]) : 0;
    
    if (baselineValue === 0 && currentValue === 0) return;
    
    const change = calculateChange(baselineValue, currentValue);
    const threshold = THRESHOLDS[metric];
    const lowerIsBetter = metric !== 'virtual_scroll_efficiency';
    const status = getStatusEmoji(change, threshold, lowerIsBetter);
    const unit = current && current[metric] && current[metric][0] ? current[metric][0].unit : '';
    const diff = currentValue - baselineValue;
    
    let interpretation = '';
    if (status === '✅') {
      if (diff < 0) {
        interpretation = `✅ **Improved by ${Math.abs(diff).toFixed(2)}${unit}** (${Math.abs(change).toFixed(1)}% faster)`;
      } else if (Math.abs(change) < 5) {
        interpretation = `✅ **No significant change** (within 5% tolerance)`;
      } else {
        interpretation = `✅ **Acceptable** (within ${threshold.warning}% threshold)`;
      }
    } else if (status === '⚠️') {
      interpretation = `⚠️ **Warning**: Slower by ${diff.toFixed(2)}${unit} (${change.toFixed(1)}% degradation)`;
    } else if (status === '❌') {
      interpretation = `❌ **Critical**: Slower by ${diff.toFixed(2)}${unit} (${change.toFixed(1)}% degradation, exceeds ${threshold.error}% threshold)`;
    }
    
    report += `**${metric}**\n`;
    report += `- Main: ${baselineValue.toFixed(2)}${unit}\n`;
    report += `- PR: ${currentValue.toFixed(2)}${unit}\n`;
    report += `- ${interpretation}\n\n`;
  });
  
  if (hasCriticalRegressions) {
    report += '\n---\n\n';
    report += '### ❌ CRITICAL: Performance Regression Detected\n\n';
    report += '**This PR introduces significant performance degradation and should not be merged.**\n\n';
    report += 'Metrics exceeding critical threshold:\n\n';
    
    metrics.forEach(metric => {
      const baselineValue = baseline && baseline[metric] ? getAverageValue(baseline[metric]) : 0;
      const currentValue = current && current[metric] ? getAverageValue(current[metric]) : 0;
      const change = calculateChange(baselineValue, currentValue);
      const threshold = THRESHOLDS[metric];
      const lowerIsBetter = metric !== 'virtual_scroll_efficiency';
      const status = getStatusEmoji(change, threshold, lowerIsBetter);
      const unit = current && current[metric] && current[metric][0] ? current[metric][0].unit : '';
      const diff = currentValue - baselineValue;
      
      if (status === '❌') {
        report += `- **${metric}**: ${baselineValue.toFixed(2)}${unit} → ${currentValue.toFixed(2)}${unit} (${diff > 0 ? '+' : ''}${diff.toFixed(2)}${unit}, ${change.toFixed(1)}% worse)\n`;
      }
    });
    report += '\n';
  }
  
  if (hasRegressions && !hasCriticalRegressions) {
    report += '### ⚠️ Performance Warnings\n\n';
    report += 'The following metrics show performance degradation:\n\n';
    
    metrics.forEach(metric => {
      const baselineValue = baseline && baseline[metric] ? getAverageValue(baseline[metric]) : 0;
      const currentValue = current && current[metric] ? getAverageValue(current[metric]) : 0;
      const change = calculateChange(baselineValue, currentValue);
      const threshold = THRESHOLDS[metric];
      const lowerIsBetter = metric !== 'virtual_scroll_efficiency';
      const status = getStatusEmoji(change, threshold, lowerIsBetter);
      
      if (status === '⚠️') {
        report += `- **${metric}**: ${change > 0 ? '+' : ''}${change.toFixed(2)}% (threshold: ${threshold.warning}%)\n`;
      }
    });
    report += '\n';
  }
  
  if (!hasRegressions && !hasCriticalRegressions) {
    report += '### ✅ All Performance Metrics Passed\n\n';
    report += 'No significant performance regressions detected.\n\n';
  }
  
  report += '## Metric Descriptions\n\n';
  report += '- **initial_render**: Time to render the spreadsheet initially\n';
  report += '- **scroll_performance**: Average time for scroll operations\n';
  report += '- **cell_interaction**: Average time for cell click and type operations\n';
  report += '- **memory_usage**: Memory increase during scrolling operations\n';
  report += '- **formula_calculation**: Average time for formula calculations\n';
  report += '- **virtual_scroll_efficiency**: Number of rows rendered (lower is better)\n';
  
  return { report, hasRegressions, hasCriticalRegressions };
}

function main() {
  console.log('🔍 Comparing performance metrics...\n');
  
  const baseline = readMetrics(BASELINE_FILE);
  const current = readMetrics(CURRENT_FILE);
  
  if (!baseline) {
    console.log('⚠️  No baseline metrics found. This will be used as the baseline.');
    if (current) {
      fs.copyFileSync(CURRENT_FILE, BASELINE_FILE);
      console.log('✅ Baseline metrics saved.');
    }
    process.exit(0);
  }
  
  if (!current) {
    console.error('❌ No current metrics found. Run performance tests first.');
    process.exit(1);
  }
  
  const { report, hasRegressions, hasCriticalRegressions } = generateReport(baseline, current);
  
  // Ensure directory exists
  if (!fs.existsSync(PERFORMANCE_DIR)) {
    fs.mkdirSync(PERFORMANCE_DIR, { recursive: true });
  }
  
  // Write report
  fs.writeFileSync(REPORT_FILE, report);
  console.log(`📊 Performance report generated: ${REPORT_FILE}\n`);
  
  // Print report to console
  console.log(report);
  
  // Exit with appropriate code
  if (hasCriticalRegressions) {
    console.error('\n❌ Critical performance regressions detected!');
    process.exit(1);
  } else if (hasRegressions) {
    console.warn('\n⚠️  Performance warnings detected.');
    process.exit(0); // Don't fail the build, just warn
  } else {
    console.log('\n✅ All performance checks passed!');
    process.exit(0);
  }
}

main();

// Made with Bob
