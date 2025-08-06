# Frontend Tests

This directory contains all frontend unit tests for the Audio Frequency Generator.

## Test Files

- `utils.test.ts` - Tests for utility functions (frequency/volume conversions, formatting)
- `dual-oscillator.test.ts` - Tests for dual oscillator functionality (mixing, detune, sync logic)

## Running Tests

```bash
# Run all tests
npm test

# Run tests without watch mode
npm run test:run

# Run specific test file
npx vitest run src/__tests__/utils.test.ts
```

## Test Structure

Tests are organized using Vitest with the following structure:
- Each major feature has its own test file
- Tests are grouped by functionality using `describe()` blocks
- Individual test cases use `it()` for specific behavior verification

## Adding New Tests

When adding new features, create corresponding test files in this directory:
1. Import the functions/components to test
2. Use descriptive test names that explain the expected behavior  
3. Group related tests using `describe()` blocks
4. Test both happy path and edge cases