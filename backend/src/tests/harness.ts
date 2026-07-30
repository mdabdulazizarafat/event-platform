/**
 * Lightweight Standalone Test Harness (Jest API Compatible)
 * Works seamlessly in both Jest and standalone node environments.
 */

class Expectation {
  constructor(private val: any) {}

  toBe(expected: any) {
    if (this.val !== expected) {
      throw new Error(`Expected ${JSON.stringify(this.val)} to be ${JSON.stringify(expected)}`);
    }
  }

  toEqual(expected: any) {
    const vStr = JSON.stringify(this.val);
    const eStr = JSON.stringify(expected);
    if (vStr !== eStr) {
      throw new Error(`Expected ${vStr} to equal ${eStr}`);
    }
  }

  toBeDefined() {
    if (this.val === undefined) {
      throw new Error('Expected value to be defined');
    }
  }

  toBeTruthy() {
    if (!this.val) {
      throw new Error(`Expected ${JSON.stringify(this.val)} to be truthy`);
    }
  }

  toBeGreaterThan(num: number) {
    if (typeof this.val !== 'number' || this.val <= num) {
      throw new Error(`Expected ${this.val} to be greater than ${num}`);
    }
  }

  toContain(item: any) {
    if (!Array.isArray(this.val) && typeof this.val !== 'string') {
      throw new Error(`Expected array/string, got ${typeof this.val}`);
    }
    if (!this.val.includes(item)) {
      throw new Error(`Expected ${JSON.stringify(this.val)} to contain ${JSON.stringify(item)}`);
    }
  }
}

export const expect = (val: any) => new Expectation(val);

export async function describe(name: string, fn: () => void | Promise<void>) {
  console.log(`\n=== SUITE: ${name} ===`);
  await fn();
}

export async function it(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    console.log(`  ✓ [PASS] ${name}`);
  } catch (err: any) {
    console.error(`  ✗ [FAIL] ${name} -> ${err.message}`);
    throw err;
  }
}
