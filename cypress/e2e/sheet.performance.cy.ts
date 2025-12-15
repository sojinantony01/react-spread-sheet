describe('Spreadsheet - Performance Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should measure scroll performance', () => {
    cy.get('[data-testid="sheet-table-content"]').should('be.visible');
    
    const scrollMetrics: number[] = [];
    
    // Perform multiple scroll operations and measure each
    for (let i = 1; i <= 5; i++) {
      const scrollDistance = i * 500;
      
      cy.window().then(() => {
        const startTime = performance.now();
        
        cy.get('[data-testid="sheet-table-content"]')
          .scrollTo(0, scrollDistance, { duration: 100 })
          .then(() => {
            const endTime = performance.now();
            const scrollTime = endTime - startTime;
            scrollMetrics.push(scrollTime);
            
            cy.log(`Scroll ${i} time: ${scrollTime.toFixed(2)}ms`);
          });
      });
    }
    
    cy.wrap(scrollMetrics).then((metrics) => {
      const avgScrollTime = metrics.reduce((a, b) => a + b, 0) / metrics.length;
      
      cy.log(`Average scroll time: ${avgScrollTime.toFixed(2)}ms`);
      
      cy.task('logPerformance', {
        metric: 'scroll_performance',
        value: avgScrollTime,
        unit: 'ms'
      });
      
      // Assert reasonable scroll performance (should be under 500ms)
      expect(avgScrollTime).to.be.lessThan(500);
    });
  });

  it('should measure cell interaction performance', () => {
    const interactionMetrics: number[] = [];
    
    // Test clicking and typing in multiple cells
    for (let i = 0; i < 5; i++) {
      cy.window().then(() => {
        const startTime = performance.now();
        
        cy.getCell(i, 0)
          .click()
          .clear()
          .type(`Test${i}`)
          .then(() => {
            const endTime = performance.now();
            const interactionTime = endTime - startTime;
            interactionMetrics.push(interactionTime);
            
            cy.log(`Cell interaction ${i} time: ${interactionTime.toFixed(2)}ms`);
          });
      });
    }
    
    cy.wrap(interactionMetrics).then((metrics) => {
      const avgInteractionTime = metrics.reduce((a, b) => a + b, 0) / metrics.length;
      
      cy.log(`Average cell interaction time: ${avgInteractionTime.toFixed(2)}ms`);
      
      cy.task('logPerformance', {
        metric: 'cell_interaction',
        value: avgInteractionTime,
        unit: 'ms'
      });
      
      // Assert reasonable interaction time (CI environments are slower)
      expect(avgInteractionTime).to.be.lessThan(1500);
    });
  });

  it('should measure memory usage during scrolling', () => {
    cy.window().then((win) => {
      // @ts-ignore - performance.memory is Chrome-specific
      if (win.performance.memory) {
        // @ts-ignore
        const initialMemory = win.performance.memory.usedJSHeapSize;
        
        cy.log(`Initial memory: ${(initialMemory / 1024 / 1024).toFixed(2)}MB`);
        
        // Perform extensive scrolling
        cy.get('[data-testid="sheet-table-content"]').scrollTo(0, 2000);
        cy.wait(500);
        cy.get('[data-testid="sheet-table-content"]').scrollTo(0, 0);
        cy.wait(500);
        
        cy.window().then((win2) => {
          // @ts-ignore
          const finalMemory = win2.performance.memory.usedJSHeapSize;
          const memoryIncrease = finalMemory - initialMemory;
          
          cy.log(`Final memory: ${(finalMemory / 1024 / 1024).toFixed(2)}MB`);
          cy.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
          
          cy.task('logPerformance', {
            metric: 'memory_usage',
            value: memoryIncrease / 1024 / 1024,
            unit: 'MB'
          });
          
          // Assert reasonable memory increase (should be under 150MB for large dataset)
          expect(memoryIncrease / 1024 / 1024).to.be.lessThan(150);
        });
      } else {
        cy.log('Memory API not available in this browser');
      }
    });
  });

  it('should measure formula calculation performance', () => {
    const calculationMetrics: number[] = [];
    
    // Create cells with formulas
    cy.typeInCell(0, 0, '100');
    cy.typeInCell(0, 1, '200');
    
    for (let i = 0; i < 5; i++) {
      cy.window().then(() => {
        const startTime = performance.now();
        
        cy.typeInCell(i, 2, '=A1+B1')
          .then(() => {
            const endTime = performance.now();
            const calcTime = endTime - startTime;
            calculationMetrics.push(calcTime);
            
            cy.log(`Formula calculation ${i} time: ${calcTime.toFixed(2)}ms`);
          });
      });
    }
    
    cy.wrap(calculationMetrics).then((metrics) => {
      const avgCalcTime = metrics.reduce((a, b) => a + b, 0) / metrics.length;
      
      cy.log(`Average formula calculation time: ${avgCalcTime.toFixed(2)}ms`);
      
      cy.task('logPerformance', {
        metric: 'formula_calculation',
        value: avgCalcTime,
        unit: 'ms'
      });
      
      // Assert reasonable calculation time (CI environments are slower)
      expect(avgCalcTime).to.be.lessThan(1500);
    });
  });

  it('should measure virtual scrolling efficiency', () => {
    cy.get('[data-testid="sheet-table-content"]').should('be.visible');
    
    // Count initially rendered rows
    cy.get('table tbody tr').then(($rows) => {
      const initialRowCount = $rows.length;
      cy.log(`Initially rendered rows: ${initialRowCount}`);
      
      // Scroll down significantly
      cy.get('[data-testid="sheet-table-content"]').scrollTo(0, 5000);
      cy.wait(500);
      
      // Count rows after scrolling
      cy.get('table tbody tr').then(($rowsAfter) => {
        const afterScrollRowCount = $rowsAfter.length;
        cy.log(`Rows after scrolling: ${afterScrollRowCount}`);
        
        cy.task('logPerformance', {
          metric: 'virtual_scroll_efficiency',
          value: afterScrollRowCount,
          unit: 'rows'
        });
        
        // Virtual scrolling should keep row count reasonable
        // The spreadsheet renders a buffer of rows for smooth scrolling
        expect(afterScrollRowCount).to.be.lessThan(500);
        expect(Math.abs(afterScrollRowCount - initialRowCount)).to.be.lessThan(200);
      });
    });
  });
});

// Made with Bob