#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Fetch Production Baseline Script
 * Runs performance tests against the production demo site
 * and saves the results as baseline metrics
 */

const PERFORMANCE_DIR = path.join(__dirname, '..', 'performance-results');
const BASELINE_FILE = path.join(PERFORMANCE_DIR, 'baseline-metrics.json');
const PRODUCTION_URL = 'https://sojinantony01.github.io/react-spread-sheet/';
const TEMP_CONFIG = path.join(__dirname, '..', 'cypress.config.production.ts');

console.log('🌐 Fetching baseline from production site...\n');
console.log(`📍 Production URL: ${PRODUCTION_URL}\n`);

// Create temporary Cypress config for production
const productionConfig = `
import { defineConfig } from 'cypress';
import * as fs from 'fs';
import * as path from 'path';

export default defineConfig({
  e2e: {
    baseUrl: '${PRODUCTION_URL}',
    specPattern: 'e2e/sheet.performance.cy.ts',
    supportFile: 'support/e2e.ts',
    videosFolder: 'videos',
    screenshotsFolder: 'screenshots',
    video: false,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    setupNodeEvents(on, config) {
      on('task', {
        logPerformance(data: { metric: string; value: number; unit: string }) {
          const perfDir = path.join(__dirname, 'performance-results');
          const perfFile = path.join(perfDir, 'production-metrics.json');
          
          if (!fs.existsSync(perfDir)) {
            fs.mkdirSync(perfDir, { recursive: true });
          }
          
          let metrics: any = {};
          if (fs.existsSync(perfFile)) {
            metrics = JSON.parse(fs.readFileSync(perfFile, 'utf8'));
          }
          
          const timestamp = new Date().toISOString();
          if (!metrics[data.metric]) {
            metrics[data.metric] = [];
          }
          
          metrics[data.metric].push({
            value: data.value,
            unit: data.unit,
            timestamp
          });
          
          fs.writeFileSync(perfFile, JSON.stringify(metrics, null, 2));
          console.log(\`📊 Production: \${data.metric} = \${data.value.toFixed(2)}\${data.unit}\`);
          
          return null;
        }
      });
      
      return config;
    },
  },
});
`;

try {
  // Create temporary config
  console.log('⚙️  Creating temporary production config...');
  fs.writeFileSync(TEMP_CONFIG, productionConfig);
  
  // Clean up old production metrics
  const prodMetricsFile = path.join(PERFORMANCE_DIR, 'production-metrics.json');
  if (fs.existsSync(prodMetricsFile)) {
    fs.unlinkSync(prodMetricsFile);
  }
  
  // Run Cypress against production
  console.log('🧪 Running performance tests against production...\n');
  
  try {
    execSync(
      `npx cypress run --e2e --config-file ${TEMP_CONFIG}`,
      { 
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit'
      }
    );
  } catch (error) {
    console.error('⚠️  Some tests may have failed, but metrics were collected');
  }
  
  // Copy production metrics to baseline
  if (fs.existsSync(prodMetricsFile)) {
    fs.copyFileSync(prodMetricsFile, BASELINE_FILE);
    console.log('\n✅ Production baseline saved successfully!');
    console.log(`📁 Baseline file: ${BASELINE_FILE}\n`);
    
    // Display metrics
    const baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8'));
    console.log('📈 Production baseline metrics:');
    Object.keys(baseline).forEach(metric => {
      if (baseline[metric] && baseline[metric].length > 0) {
        const avg = baseline[metric].reduce((sum, item) => sum + item.value, 0) / baseline[metric].length;
        const unit = baseline[metric][0].unit;
        console.log(`   - ${metric}: ${avg.toFixed(2)}${unit}`);
      }
    });
    
    console.log('\n💡 Next steps:');
    console.log('   1. Review the baseline metrics above');
    console.log('   2. Commit baseline-metrics.json to your repository');
    console.log('   3. Future PRs will compare against these production metrics\n');
  } else {
    console.error('❌ Failed to collect production metrics');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} finally {
  // Clean up temporary config
  if (fs.existsSync(TEMP_CONFIG)) {
    fs.unlinkSync(TEMP_CONFIG);
  }
}

// Made with Bob
