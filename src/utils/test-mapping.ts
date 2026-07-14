import { prisma } from '../config/db';
import { mapSpecsToSubCriteria } from './specsMapper';

async function runTests() {
  console.log('=== STARTING SPECS MAPPING AUTOMATED TESTS ===\n');

  const testCases = [
    // RAM tests
    {
      description: 'RAM: 16gb (should match "16 GB" - ID 8)',
      input: { ram: '16gb' },
      expectedSubCriteriaId: 8,
    },
    {
      description: 'RAM: " 16 GB " with spaces (should match "16 GB" - ID 8)',
      input: { ram: ' 16 GB ' },
      expectedSubCriteriaId: 8,
    },
    {
      description: 'RAM: "16G" shortcut (should match "16 GB" - ID 8)',
      input: { ram: '16G' },
      expectedSubCriteriaId: 8,
    },
    {
      description: 'RAM: "32 GB" (should match ">= 32 GB" - ID 10)',
      input: { ram: '32 GB' },
      expectedSubCriteriaId: 10,
    },
    {
      description: 'RAM: "64gb" high value (should match ">= 32 GB" - ID 10)',
      input: { ram: '64gb' },
      expectedSubCriteriaId: 10,
    },
    {
      description: 'RAM: "8GB" (should match "<= 8 GB" - ID 6)',
      input: { ram: '8GB' },
      expectedSubCriteriaId: 6,
    },

    // Storage tests
    {
      description: 'Storage: "512GB" (should match "512 GB SSD" - ID 12)',
      input: { storage: '512GB' },
      expectedSubCriteriaId: 12,
    },
    {
      description: 'Storage: "1TB SSD" (should match "1 TB SSD" - ID 13)',
      input: { storage: '1TB SSD' },
      expectedSubCriteriaId: 13,
    },
    {
      description: 'Storage: "256 GB SSD" (should match "<= 256 GB SSD" - ID 11)',
      input: { storage: '256 GB SSD' },
      expectedSubCriteriaId: 11,
    },
    {
      description: 'Storage: "2TB" (should match "2 TB SSD" - ID 14)',
      input: { storage: '2TB' },
      expectedSubCriteriaId: 14,
    },
    {
      description: 'Storage: "4TB SSD" (should match "> 2 TB SSD" - ID 15)',
      input: { storage: '4TB SSD' },
      expectedSubCriteriaId: 15,
    },

    // Processor tests (C6)
    {
      description: 'Processor: "Intel Core i7 12700H" (should match "Core i7 / Ryzen 7 / Apple M1-M2" - ID 29)',
      input: { processor: 'Intel Core i7 12700H' },
      expectedSubCriteriaId: 29,
    },
    {
      description: 'Processor: "i7" short input (should match "Core i7 / Ryzen 7 / Apple M1-M2" - ID 29)',
      input: { processor: 'i7' },
      expectedSubCriteriaId: 29,
    },
    {
      description: 'Processor: "AMD Ryzen 5 5600X" (should match "Core i5 / Ryzen 5" - ID 28)',
      input: { processor: 'AMD Ryzen 5 5600X' },
      expectedSubCriteriaId: 28,
    },
    {
      description: 'Processor: "Apple M3 Pro" (should match "Core i9 / Ryzen 9 / Apple M3 Pro-Max / Ultra" - ID 30)',
      input: { processor: 'Apple M3 Pro' },
      expectedSubCriteriaId: 30,
    },
    {
      description: 'Processor: "Intel Celeron N4020" (should match "Celeron / N-Series" - ID 26)',
      input: { processor: 'Intel Celeron N4020' },
      expectedSubCriteriaId: 26,
    },

    // Battery tests (C4)
    {
      description: 'Battery: "60Wh" (should match "60 - 74 Wh" - ID 18)',
      input: { battery: '60Wh' },
      expectedSubCriteriaId: 18,
    },
    {
      description: 'Battery: "41wh" (should match "< 45 Wh" - ID 16)',
      input: { battery: '41wh' },
      expectedSubCriteriaId: 16,
    },

    // Weight tests (C5)
    {
      description: 'Weight: "1.4kg" (should match "1.2 - 1.49 kg" - ID 24)',
      input: { weight: '1.4kg' },
      expectedSubCriteriaId: 24,
    },
    {
      description: 'Weight: "1.65 kg" (should match "1.5 - 1.99 kg" - ID 23)',
      input: { weight: '1.65 kg' },
      expectedSubCriteriaId: 23,
    },

    // Screen Size tests (C7)
    {
      description: 'Screen Size: "14.0" (should match "14 - 14.99 Inch" - ID 33)',
      input: { screenSize: '14.0' },
      expectedSubCriteriaId: 33,
    },

    // Release Year tests (C8)
    {
      description: 'Release Year: "2024" (should match "2024 - 2025" - ID 40)',
      input: { releaseYear: '2024' },
      expectedSubCriteriaId: 40,
    },
  ];

  let passedCount = 0;

  for (const tc of testCases) {
    try {
      const results = await mapSpecsToSubCriteria(prisma, tc.input);
      const isMatched = results.includes(tc.expectedSubCriteriaId);

      if (isMatched) {
        console.log(`[PASS] ${tc.description}`);
        passedCount++;
      } else {
        console.error(
          `[FAIL] ${tc.description}\n       Expected sub-criteria ID: ${tc.expectedSubCriteriaId}\n       Actual matched IDs: ${JSON.stringify(
            results
          )}`
        );
      }
    } catch (error) {
      console.error(`[ERROR] ${tc.description} failed with error:`, error);
    }
  }

  console.log(`\n=== TEST SUMMARY: ${passedCount}/${testCases.length} Passed ===`);
  if (passedCount === testCases.length) {
    console.log('ALL TESTS COMPLETED SUCCESSFULLY! 🎉');
  } else {
    console.error('SOME TESTS FAILED! ❌');
    process.exit(1);
  }
}

runTests()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
