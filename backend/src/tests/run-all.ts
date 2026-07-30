import { setupTestDatabase } from './setup';
import { runAuthTests } from './auth.test';
import { runEventTests } from './event.test';
import { runTicketTests } from './ticket.test';
import { runPaymentTests } from './payment.test';
import { pool } from '../db/pool';

async function runAllSuites() {
  console.log('\n========================================================');
  console.log('  RONG PLAN EVENT PLATFORM - INTEGRATION TEST ENGINE');
  console.log('========================================================');

  const startTime = Date.now();
  let passedSuites = 0;
  let failedSuites = 0;

  try {
    await setupTestDatabase();

    // 1. Auth Suite
    try {
      await runAuthTests();
      passedSuites++;
    } catch (err) {
      failedSuites++;
    }

    // 2. Event Suite
    try {
      await runEventTests();
      passedSuites++;
    } catch (err) {
      failedSuites++;
    }

    // 3. Ticket Suite
    try {
      await runTicketTests();
      passedSuites++;
    } catch (err) {
      failedSuites++;
    }

    // 4. Payment Suite
    try {
      await runPaymentTests();
      passedSuites++;
    } catch (err) {
      failedSuites++;
    }

    const duration = Date.now() - startTime;
    console.log('\n========================================================');
    console.log(`  TEST RESULTS: ${passedSuites} SUITES PASSED | ${failedSuites} SUITES FAILED`);
    console.log(`  EXECUTION TIME: ${duration}ms`);
    console.log('========================================================\n');

    await setupTestDatabase(); // Final cleanup
    await pool.end();

    if (failedSuites > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err: any) {
    console.error('Fatal test harness error:', err.message);
    await pool.end();
    process.exit(1);
  }
}

if (require.main === module) {
  runAllSuites();
}

export { runAllSuites };
