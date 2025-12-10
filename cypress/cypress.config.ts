import { defineConfig } from 'cypress';
import * as fs from 'fs';
import * as path from 'path';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'e2e/**/*.cy.{js,jsx,ts,tsx}',
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
      // Performance logging task
      on('task', {
        logPerformance(data: { metric: string; value: number; unit: string }) {
          const perfDir = path.join(__dirname, 'performance-results');
          const perfFile = path.join(perfDir, 'metrics.json');
          
          // Create directory if it doesn't exist
          if (!fs.existsSync(perfDir)) {
            fs.mkdirSync(perfDir, { recursive: true });
          }
          
          // Read existing metrics or create new object
          let metrics: any = {};
          if (fs.existsSync(perfFile)) {
            metrics = JSON.parse(fs.readFileSync(perfFile, 'utf8'));
          }
          
          // Add timestamp to metric
          const timestamp = new Date().toISOString();
          if (!metrics[data.metric]) {
            metrics[data.metric] = [];
          }
          
          metrics[data.metric].push({
            value: data.value,
            unit: data.unit,
            timestamp
          });
          
          // Write updated metrics
          fs.writeFileSync(perfFile, JSON.stringify(metrics, null, 2));
          
          console.log(`📊 Performance: ${data.metric} = ${data.value.toFixed(2)}${data.unit}`);
          
          return null;
        }
      });
      
      return config;
    },
  },
});

// Made with Bob
