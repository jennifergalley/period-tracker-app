# Testing Guide

This project uses **Jest** for unit testing, following best practices for React Native/Expo applications.

## Setup Complete ✅

The testing infrastructure is fully configured with:
- **Jest** - Testing framework
- **TypeScript support** - via babel-jest
- **React Native Testing Library** - For component testing (if needed)
- **Path aliases** - `@/features`, `@/components`, etc.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run a specific test file
npm test DateUtils.test.ts
```

## Test File Organization

Tests are located in the **tests/** folder:

```
tests/
  ├── DateUtils.test.ts          ← Tests for features/DateUtils.tsx
  ├── DateRange.test.ts          ← Tests for features/DateRange.tsx
  └── ...

features/
  ├── DateUtils.tsx
  ├── DateRange.tsx
  └── ...
```

## Writing Tests

### Test File Naming

Use the `.test.ts` or `.test.tsx` extension:
- `DateUtils.tsx` → `DateUtils.test.ts`
- `MyComponent.tsx` → `MyComponent.test.tsx`

### Basic Test Structure

```typescript
import { functionName } from './UtilityFile';

describe('UtilityFile', () => {
  describe('functionName', () => {
    it('should return expected result for typical input', () => {
      // Arrange
      const input = /* test data */;
      
      // Act
      const result = functionName(input);
      
      // Assert
      expect(result).toEqual(/* expected output */);
    });

    it('should handle edge case correctly', () => {
      // Test edge cases
    });

    it('should handle null/undefined input gracefully', () => {
      // Test error conditions
    });
  });
});
```

## What to Test

### ✅ High Priority - Utility Functions

**DateUtils** - Date formatting, comparisons, and calculations
- `startOfDay()`, `formatDate()`, `getDaysInMonth()`, `isToday()`

**CycleUtils** - Period tracking and predictions
- `logPeriod()`, `getFertileWindow()`, `getCycleDay()`, `predictPeriods()`

**WeightUtils** - Weight log operations
- `filterAndSortWeightLogs()`, `addOrUpdateWeightLog()`, `deleteWeightLog()`

**SymptomUtils** - Symptom aggregation and analysis
- `computeMostFrequentSymptoms()`, `computeSymptomByCycleDay()`

### ✅ Medium Priority - Data Models

**DateRange & DateRangeList** - Data structures
- `containsDate()`, `getDatesInRange()`, `toJSON()`, `fromJSON()`, `merge()`

### ⚠️ Lower Priority - UI Components

Component tests can be added later if needed. Focus on business logic first.

## Example Tests

See the existing test files for examples:
- `tests/DateUtils.test.ts` - Pure function testing
- `tests/DateRange.test.ts` - Class/data model testing

## Tips for Writing Good Tests

1. **Test one thing per test** - Each `it()` should verify one behavior
2. **Use descriptive names** - "should return correct days for February in leap year"
3. **Follow Arrange-Act-Assert** - Set up, execute, verify
4. **Test edge cases** - null values, empty arrays, boundary conditions
5. **Avoid timezone issues** - Use explicit time strings or `toISOString().slice(0, 10)` for date comparisons

## Coverage Goals

- **High coverage** on utility functions (80%+)
- **Medium coverage** on data models (60%+)
- **Lower priority** on UI components (optional)

Run `npm run test:coverage` to see coverage reports.

## Continuous Integration

When adding new features:
1. Write tests for any new utility functions
2. Run tests before committing: `npm test`
3. Fix any failing tests
4. Add tests when fixing bugs to prevent regression

## Troubleshooting

### Tests fail with timezone errors
Use `.toISOString().slice(0, 10)` for date comparisons instead of direct equality checks.

### Module resolution errors
Check that `@/` path aliases are correctly configured in `jest.config.js`.

### Expo/React Native mocking issues
Relevant mocks are configured in `jest.setup.js`. Add new mocks there if needed.

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Best Practices](https://testingjavascript.com/)
