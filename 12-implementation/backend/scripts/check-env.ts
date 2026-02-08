/**
 * Environment Check Script
 *
 * Validates that all required environment variables are set.
 */

import { config } from '../src/config';

const requiredEnvVars = [
  { name: 'DATABASE_URL', value: config.database.url },
  { name: 'JWT_ACCESS_SECRET', value: config.jwt.accessSecret },
  { name: 'JWT_REFRESH_SECRET', value: config.jwt.refreshSecret },
  { name: 'ENCRYPTION_KEY', value: config.encryption.key },
  { name: 'HASH_SALT', value: config.encryption.salt },
];

const optionalEnvVars = [
  { name: 'REDIS_HOST', value: config.redis.host },
  { name: 'REDIS_PORT', value: config.redis.port },
  { name: 'REDIS_PASSWORD', value: config.redis.password },
];

console.log('Checking environment variables...\n');

let hasErrors = false;

// Check required variables
console.log('Required variables:');
requiredEnvVars.forEach(({ name, value }) => {
  if (!value || value.length === 0) {
    console.error(`  ❌ ${name} is not set`);
    hasErrors = true;
  } else {
    console.log(`  ✓ ${name} is set`);
  }
});

console.log('\nOptional variables:');
optionalEnvVars.forEach(({ name, value }) => {
  if (value) {
    console.log(`  ✓ ${name} is set`);
  } else {
    console.log(`  ⚠ ${name} is not set`);
  }
});

console.log('\nConfiguration:');
console.log(`  Environment: ${config.env}`);
console.log(`  Port: ${config.port}`);
console.log(`  Log Level: ${config.logLevel}`);

if (hasErrors) {
  console.error('\n❌ Some required environment variables are missing!');
  console.error('Please set them in your .env file.\n');
  process.exit(1);
}

console.log('\n✅ All required environment variables are set!\n');
process.exit(0);
