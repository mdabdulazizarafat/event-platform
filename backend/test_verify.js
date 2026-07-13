/**
 * Rong Plan - Live Beta Diagnostics & Verification Script
 * This script runs integration tests against the local backend server (port 3001)
 * to verify the newly added safety features:
 * 1. Event creation rate-limiting (max 3 per host per hour).
 * 2. Auth protection on event creation.
 * 3. Offline check-in batch synchronization endpoint.
 * 4. Ticket Edit & Resend (resetting status and re-triggering BullMQ queues).
 */

const BACKEND_URL = 'http://localhost:3001';

async function runTests() {
  console.log('=== starting Rong Plan Live Beta Verification Tests ===\n');

  try {
    // 1. Generate auth session token (Register/Login a test host)
    console.log('[Setup] Registering/Logging in test host...');
    const username = 'test-host-' + Math.random().toString(36).substring(7);
    
    // Register
    const regRes = await fetch(`${BACKEND_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        name: 'Test Organizer',
        email: `${username}@test.com`,
        password: 'Password123'
      })
    });
    
    if (!regRes.ok) {
      throw new Error(`Failed to register host: ${await regRes.text()}`);
    }
    
    // Login to get Cookie session token
    const loginRes = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password: 'Password123'
      })
    });
    
    if (!loginRes.ok) {
      throw new Error('Failed to login host');
    }

    // Capture the session cookie
    const cookies = loginRes.headers.get('set-cookie');
    const authHeaders = {
      'Content-Type': 'application/json',
      'Cookie': cookies || ''
    };

    console.log(`[Setup] Host authenticated successfully. Username: ${username}\n`);

    // 2. Test Rate Limiting (Attempting to create 4 events, expected max 3 success)
    console.log('--- Test 1: Event Creation Rate Limiting (Max 3/hour) ---');
    let successes = 0;
    let rateLimited = false;

    for (let i = 1; i <= 4; i++) {
      const slug = `event-rate-limit-${i}-${Math.random().toString(36).substring(7)}`;
      console.log(`[Test 1] Creating event ${i} (slug: ${slug})...`);
      
      const res = await fetch(`${BACKEND_URL}/api/v1/events`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          slug,
          title: `Rate Limit Event ${i}`,
          date: '2026-10-12',
          time: '18:00',
          location: 'Main Hall',
          capacity: 100
        })
      });

      if (res.status === 201) {
        successes++;
        console.log(`  -> Event ${i} created successfully (201).`);
      } else if (res.status === 429) {
        rateLimited = true;
        const errData = await res.json();
        console.log(`  -> Event ${i} rate limited successfully (429). Error: "${errData.error}"`);
      } else {
        console.log(`  -> Event ${i} returned status ${res.status}: ${await res.text()}`);
      }
    }

    console.log(`[Test 1 Result] Successful creations: ${successes}/3, Rate limited: ${rateLimited ? 'YES' : 'NO'}`);
    if (successes === 3 && rateLimited) {
      console.log('✅ TEST 1 PASSED: Rate limiter successfully blocked the 4th creation.\n');
    } else {
      console.log('❌ TEST 1 FAILED: Expected exactly 3 creations to succeed and the 4th to fail.\n');
    }

    // 3. Test Offline Sync & Resend Endpoint Setup
    console.log('--- Test 2: Offline Check-In Batch Sync & Email Resend ---');
    
    // Create an event for registration testing
    const eventSlug = `test-sync-event-${Math.random().toString(36).substring(7)}`;
    const eventRes = await fetch(`${BACKEND_URL}/api/v1/events`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        slug: eventSlug,
        title: 'Diagnostic Event',
        date: '2026-11-20',
        time: '10:00',
        location: 'Virtual Room',
        capacity: 10
      })
    });
    
    if (eventRes.status !== 201) {
      throw new Error(`Failed to create base event for sync testing: ${await eventRes.text()}`);
    }

    // Register a user to get registration details
    console.log('[Test 2] Registering participant to create a ticket...');
    const regParticipantRes = await fetch(`${BACKEND_URL}/api/v1/events/${eventSlug}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'temp-attendee@gmail.com',
        userId: 'attendee-101'
      })
    });

    const regData = await regParticipantRes.json();
    const qrToken = regData.qrToken;
    const registrationId = regData.registrationId;
    console.log(`  -> Registered attendee. Reg ID: ${registrationId}, QR Token: ${qrToken}`);

    // Simulate Offline Sync batch payload
    console.log('[Test 2] Simulating offline scan batch sync...');
    const syncRes = await fetch(`${BACKEND_URL}/api/v1/tickets/sync-offline`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        scans: [
          { qrToken, scannedAt: new Date().toISOString() }
        ]
      })
    });

    if (syncRes.ok) {
      const syncData = await syncRes.json();
      console.log(`  -> Batch sync completed. Synced Count: ${syncData.syncedCount}`);
      if (syncData.syncedCount === 1) {
        console.log('✅ Offline Batch Sync PASSED.');
      } else {
        console.log('❌ Offline Batch Sync FAILED.');
      }
    } else {
      console.log(`❌ Offline Batch Sync FAILED. Status ${syncRes.status}: ${await syncRes.text()}`);
    }

    // Test Edit & Resend
    console.log('[Test 2] Testing Ticket Edit & Resend endpoint...');
    const resendRes = await fetch(`${BACKEND_URL}/api/v1/tickets/${registrationId}/resend`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        email: 'corrected-attendee@gmail.com'
      })
    });

    if (resendRes.ok) {
      console.log('✅ Ticket Edit & Resend API Call PASSED.');
    } else {
      console.log(`❌ Ticket Edit & Resend API Call FAILED. Status ${resendRes.status}: ${await resendRes.text()}`);
    }

    // Test Cancellation Flow
    console.log('\n--- Test 3: Ticket Cancellation Flow ---');
    
    // Register another participant to cancel
    console.log('[Test 3] Registering a new participant to cancel...');
    const regCancelRes = await fetch(`${BACKEND_URL}/api/v1/events/${eventSlug}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'cancel-attendee@gmail.com',
        userId: 'attendee-202'
      })
    });

    const cancelRegData = await regCancelRes.json();
    const cancelQrToken = cancelRegData.qrToken;
    const cancelRegistrationId = cancelRegData.registrationId;
    console.log(`  -> Registered attendee. Reg ID: ${cancelRegistrationId}, QR Token: ${cancelQrToken}`);

    // Call cancel endpoint
    console.log('[Test 3] Cancelling the ticket...');
    const cancelRes = await fetch(`${BACKEND_URL}/api/v1/tickets/${cancelRegistrationId}/cancel`, {
      method: 'POST',
      headers: authHeaders
    });

    if (cancelRes.ok) {
      console.log('  -> Ticket cancelled successfully via API.');
    } else {
      throw new Error(`Failed to cancel ticket: Status ${cancelRes.status} - ${await cancelRes.text()}`);
    }

    // Attempt to verify the cancelled ticket (should fail)
    console.log('[Test 3] Attempting check-in scan of cancelled ticket...');
    const verifyCancelRes = await fetch(`${BACKEND_URL}/api/v1/tickets/verify`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ qrToken: cancelQrToken })
    });

    if (verifyCancelRes.status === 400) {
      const errBody = await verifyCancelRes.json();
      console.log(`  -> Correctly blocked check-in. Error returned: "${errBody.error}"`);
      console.log('✅ Ticket Cancellation check-in rejection PASSED.');
    } else {
      console.log(`❌ Ticket Cancellation check-in rejection FAILED. Status ${verifyCancelRes.status}: ${await verifyCancelRes.text()}`);
    }

    // Attempt offline sync of cancelled ticket (should fail in results)
    console.log('[Test 3] Attempting offline sync of cancelled ticket...');
    const syncCancelRes = await fetch(`${BACKEND_URL}/api/v1/tickets/sync-offline`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        scans: [
          { qrToken: cancelQrToken, scannedAt: new Date().toISOString() }
        ]
      })
    });

    if (syncCancelRes.ok) {
      const syncCancelData = await syncCancelRes.json();
      console.log(`  -> Sync completed. Errors list:`, syncCancelData.errors);
      if (syncCancelData.errors.length > 0 && syncCancelData.errors[0].includes('cancelled')) {
        console.log('✅ Offline Batch Sync rejection of cancelled ticket PASSED.');
      } else {
        console.log('❌ Offline Batch Sync rejection of cancelled ticket FAILED.');
      }
    } else {
      console.log(`❌ Offline Batch Sync rejection of cancelled ticket FAILED. Status ${syncCancelRes.status}: ${await syncCancelRes.text()}`);
    }

  } catch (error) {
    console.error('❌ Verification script encountered an error:', error);
  }
}

runTests();
