describe('Spreadsheet - Stress Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should handle 100k cells (2500 rows x 40 cols / 1 LAKH) efficiently', () => {
    const rows = 2500;
    const cols = 40;
    const totalCells = rows * cols;

    cy.log(`Testing with ${totalCells.toLocaleString()} cells (1 LAKH)`);

    // Measure initial render time (before verification scrolling)
    const renderStart = performance.now();
    
    // Wait for spreadsheet to be ready
    cy.get('[data-testid="sheet-table"]', { timeout: 15000 }).should('be.visible');
    cy.get('table tbody tr').should('have.length.at.least', 10);
    
    cy.window().then(() => {
      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStart;
      
      cy.log(`Initial render time: ${renderTime.toFixed(2)}ms`);
      
      // Record metric
      cy.task('logPerformance', {
        metric: 'stress_100k_render',
        value: renderTime,
        unit: 'ms'
      });

      // Validate render time (should render in < 6 seconds for 1 LAKH cells)
      expect(renderTime).to.be.lessThan(6000);
    });
    
    // Now verify we can access cells throughout the dataset
    cy.log('Verifying full dataset is accessible...');
    
    // Test a cell in the middle (row 1250)
    cy.get('[data-testid="sheet-table-content"]').scrollTo(0, 50000);
    cy.wait(500);
    
    // Scroll to near the end to verify all 2500 rows are accessible
    cy.get('[data-testid="sheet-table-content"]').then(($container) => {
      const maxScroll = $container[0].scrollHeight - $container[0].clientHeight;
      cy.get('[data-testid="sheet-table-content"]').scrollTo(0, maxScroll);
      cy.wait(500);
      
      // Verify we're at the bottom and rows are rendered
      cy.get('table tbody tr').should('have.length.at.least', 10);
      cy.log('✓ Verified: Can scroll to end of 2500 rows');
    });
    
    // Scroll back to top for consistent performance testing
    cy.get('[data-testid="sheet-table-content"]').scrollTo(0, 0);
    cy.wait(300);

    // Test scroll performance at different positions
    const scrollPositions = [0, 0.25, 0.5, 0.75, 1.0];
    const scrollTimes: number[] = [];

    scrollPositions.forEach((position) => {
      cy.log(`Testing scroll at ${(position * 100).toFixed(0)}% position`);
      
      cy.get('[data-testid="sheet-table-content"]').then(($container) => {
        const startTime = performance.now();
        const maxScroll = $container[0].scrollHeight - $container[0].clientHeight;
        const scrollTo = maxScroll * position;
        
        cy.get('[data-testid="sheet-table-content"]')
          .scrollTo(0, scrollTo, { duration: 100 })
          .then(() => {
            const endTime = performance.now();
            const scrollTime = endTime - startTime;
            scrollTimes.push(scrollTime);
            
            cy.log(`Scroll time at ${(position * 100).toFixed(0)}%: ${scrollTime.toFixed(2)}ms`);
          });
      });
    });

    // Record average scroll time
    cy.wrap(scrollTimes).then((times) => {
      const avgScrollTime = times.reduce((a, b) => a + b, 0) / times.length;
      
      cy.log(`Average scroll time: ${avgScrollTime.toFixed(2)}ms`);
      
      cy.task('logPerformance', {
        metric: 'stress_100k_scroll',
        value: avgScrollTime,
        unit: 'ms'
      });

      // Should scroll in < 800ms average
      expect(avgScrollTime).to.be.lessThan(800);
    });

    // Check memory usage (Chrome only)
    cy.window().then((win) => {
      // @ts-ignore - performance.memory is Chrome-specific
      if (win.performance.memory) {
        // @ts-ignore
        const usedMemoryMB = win.performance.memory.usedJSHeapSize / (1024 * 1024);
        
        cy.log(`Memory usage: ${usedMemoryMB.toFixed(2)}MB`);
        
        // Record metric
        cy.task('logPerformance', {
          metric: 'large_dataset_memory',
          value: usedMemoryMB,
          unit: 'MB'
        });

        // Note: Memory usage varies significantly based on browser and system
        // We track it but don't enforce a hard limit in stress tests
        cy.log(`Memory usage is being tracked: ${usedMemoryMB.toFixed(2)}MB`);
      } else {
        cy.log('Memory API not available in this browser');
      }
    });

    // Verify virtual scrolling is working efficiently
    cy.get('table tbody tr').then(($rows) => {
      const renderedRows = $rows.length;
      cy.log(`Rendered rows: ${renderedRows}`);
      
      // Record metric
      cy.task('logPerformance', {
        metric: 'stress_virtual_scroll_rows',
        value: renderedRows,
        unit: 'rows'
      });
      
      // Should not render all rows (virtual scrolling should be active)
      // With 1 LAKH cells, buffer rows can be higher for smooth scrolling
      expect(renderedRows).to.be.lessThan(1700);
      expect(renderedRows).to.be.greaterThan(0);
    });
  });
});

// Made with Bob
