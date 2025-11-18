// Debug script to check bench chakra ring rendering
// Add this script to battle.html to debug

console.log("========== BENCH CHAKRA DEBUG ==========");

// Wait for page load
window.addEventListener('load', () => {
  setTimeout(() => {
    // Check if bench containers exist
    const benchContainers = document.querySelectorAll('[data-unit-type="bench"]');
    console.log(`Found ${benchContainers.length} bench containers`);

    benchContainers.forEach((container, index) => {
      console.log(`\nBench container ${index}:`, container);
      console.log(`  - Unit ID: ${container.dataset.unitId}`);
      console.log(`  - Computed style:`, {
        position: getComputedStyle(container).position,
        left: getComputedStyle(container).left,
        bottom: getComputedStyle(container).bottom,
        width: getComputedStyle(container).width,
        height: getComputedStyle(container).height,
        zIndex: getComputedStyle(container).zIndex,
        overflow: getComputedStyle(container).overflow,
      });

      // Check if unit-ring exists inside
      const unitRing = container.querySelector('.unit-ring');
      if (unitRing) {
        console.log(`  - Unit ring found!`, {
          width: getComputedStyle(unitRing).width,
          height: getComputedStyle(unitRing).height,
        });

        // Check chakra frame
        const chakraFrame = unitRing.querySelector('.chakra-frame');
        if (chakraFrame) {
          console.log(`  - Chakra frame found!`, {
            width: getComputedStyle(chakraFrame).width,
            height: getComputedStyle(chakraFrame).height,
            top: getComputedStyle(chakraFrame).top,
            left: getComputedStyle(chakraFrame).left,
          });
        } else {
          console.warn(`  - ⚠️ Chakra frame NOT found!`);
        }

        // Add visual debug border
        unitRing.style.outline = '2px dashed lime';
        container.style.outline = '2px solid yellow';
      } else {
        console.warn(`  - ⚠️ Unit ring NOT found inside bench container!`);
        container.style.outline = '3px solid red';
      }
    });

    // Check active containers for comparison
    const activeContainers = document.querySelectorAll('[data-unit-type="active"]');
    console.log(`\nFound ${activeContainers.length} active containers (for comparison)`);

    activeContainers.forEach((container, index) => {
      const unitRing = container.querySelector('.unit-ring');
      if (unitRing) {
        console.log(`Active ${index} unit-ring size:`, {
          width: getComputedStyle(unitRing).width,
          height: getComputedStyle(unitRing).height,
        });
      }
    });

    console.log("\n========== DEBUG COMPLETE ==========");
    console.log("Check visual indicators:");
    console.log("  - YELLOW outline = bench container found");
    console.log("  - LIME outline = bench unit-ring found");
    console.log("  - RED outline = bench container WITHOUT unit-ring (ERROR!)");

  }, 2000); // Wait 2 seconds for battle to initialize
});
