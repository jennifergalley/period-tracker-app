# GitHub Copilot Instructions

## 1. General Coding Guidelines

### TypeScript & React
- Always use TypeScript for all files and components.
- Prefer functional React components and React Hooks over class components.
- Use ES6+ features and modern JavaScript/TypeScript syntax.
- Use named exports for utility functions and constants.
- Avoid using `any` type; prefer explicit and strict typing.
- Use destructuring for props and state where possible.
- Prefer composition over inheritance.
- Use PropTypes or TypeScript interfaces for all component props.
- Use default values for props where appropriate.
- Use meaningful variable and function names.
- Keep functions small and focused; avoid large monolithic functions.
- Use early returns to reduce nesting.

### Asynchronous Code
- Use async/await for asynchronous code, and handle errors gracefully.

### State Management
- Use context and hooks for state management, not Redux or MobX.

### DRY & Modularity
- Keep code DRY (Don't Repeat Yourself) and modular.
- Place new helper methods in the appropriate file in the `features` directory.
- Place new handler methods in `Handlers.tsx` and re-use them to follow DRY principles.

### Constants & Theming
- Use universal constants (such as emoji arrays) in a single file and import them everywhere.
- Never hardcode strings, colors, or magic numbers; use constants or theme variables.

### Error Handling & Null Checks
- Always check for null/undefined where appropriate, especially with dates and user input.

### Mobile App Best Practices
- Write code that is idiomatic for React Native/Expo mobile apps.
- Ensure all code is mobile-friendly and performant.
- Use platform-specific code only when necessary, and document it clearly.
- Test on both Android and iOS simulators/emulators if possible.

### Package Management
- Always use import statements instead of require.
- Keep dependencies minimal and only add necessary packages.
- Place import statements at the top of the file, grouped by external and internal imports.

## 2. Project Structure & Organization

### File/Folder Structure
- `components/` — Reusable UI components (buttons, cards, etc.)
- `features/` — Business/domain logic, helpers, and utilities
- `app/(tabs)/` — Main app screens (calendar, mood, statistics, settings, etc.)
- `assets/` — Images, fonts, icons, and static files
- `types.d.ts` — Global type definitions
- `CommonStyles.tsx` — Shared styles
- `Theme.tsx` — Theme and color management
- `.github/` — Project configuration and Copilot instructions

### File Placement
- Use the `features` directory for domain-specific logic and helpers.
- Use the `components` directory for reusable UI components.
- Use the `app/(tabs)` directory for screen-level components/pages.
- Use the `assets` directory for images, fonts, and static resources.

## 3. Documentation & Comments

### Documentation
- All exported functions, classes, and complex logic must have JSDoc comments.
- All files should have a summary comment at the top describing their purpose.
- Update documentation and comments when code changes.

### Comments
- Use inline comments to explain tricky or non-obvious code.
- Never delete comments that are already there unless they are todos you are checking off or pertain to code you are deleting.
- Use comments to explain non-obvious logic, but avoid redundant comments.

## 4. Code Style & Formatting
- Follow the existing code style and formatting (Prettier/ESLint if configured).
- Keep dependencies up to date and avoid unnecessary packages.
- Write clear, concise commit messages and PR descriptions.

## 5. Accessibility & User Experience
- Use accessible components and props where possible.
- Ensure color contrast is sufficient for readability.
- Use semantic elements and ARIA attributes as needed.
- Provide feedback for user actions (loading, errors, success, etc.).

## 6. Performance
- Avoid unnecessary re-renders and expensive computations in render.
- Use React.memo, useCallback, and useMemo where appropriate.
- Lazy load screens and assets when possible.

## 7. Testing Guidelines

### Testing Philosophy
- All new features should include appropriate unit tests when feasible.
- Prioritize testing pure utility functions and business logic over UI components.
- Focus on testing critical functionality: date calculations, cycle predictions, data transformations.
- Tests should be simple, readable, and maintainable.

### Test Coverage Priorities
1. **High Priority** — Utility functions in `features/` directory (date utils, cycle utils, symptom utils, weight utils)
2. **Medium Priority** — Data models and classes (DateRange, DateRangeList)
3. **Lower Priority** — UI components (visual regression testing is less critical for this project)

### Unit Testing with Jest

#### Test File Organization
- Place test files in the `tests/` folder.
- Use the naming convention: `[filename].test.ts` or `[filename].test.tsx`
- Example: `features/DateUtils.tsx` → `tests/DateUtils.test.ts`
- Keep test file names consistent with the source files they test.

#### Writing Unit Tests
Use Jest as the testing framework (standard for React Native/Expo projects).

**Key principles:**
- Test one thing per test case.
- Use descriptive test names that explain what is being tested and the expected outcome.
- Follow the Arrange-Act-Assert pattern.
- Mock external dependencies and async operations.
- Test edge cases, boundary conditions, and error handling.

**Example test structure for utility functions:**
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

#### What to Test in This Project

**DateUtils** — Test date formatting, date comparisons, date range operations:
- `startOfDay()` — normalizes dates correctly
- `formatDate()` — formats dates in expected format
- `formatDateRange()` — handles same-day and multi-day ranges
- `getDaysInMonth()` — returns correct day counts for all months including leap years
- `isToday()` — correctly identifies current date

**CycleUtils** — Test period tracking and predictions:
- `logPeriod()` — adds periods correctly, handles overlaps, auto-adds when appropriate
- `getFertileWindow()` — calculates fertile days accurately
- `getCycleDay()` — returns correct cycle day for any date
- `predictPeriods()` — generates accurate predictions for the next year
- Edge cases: first period logged, gaps in data, irregular cycles

**WeightUtils** — Test weight log operations:
- `filterAndSortWeightLogs()` — filters by date range and sorts chronologically
- `addOrUpdateWeightLog()` — adds new entries and updates existing ones
- `deleteWeightLog()` — removes entries correctly

**SymptomUtils** — Test symptom aggregation:
- `computeMostFrequentSymptoms()` — correctly ranks symptoms by frequency
- `computeSymptomByCycleDay()` — maps symptoms to cycle days accurately
- Handle empty logs, missing data gracefully

**DateRange & DateRangeList** — Test data models:
- `containsDate()` — date membership tests
- `getDatesInRange()` — returns all dates in range
- `toJSON()` / `fromJSON()` — serialization round-trips correctly
- `merge()` — combines overlapping ranges
- `getLastRangeBefore()` — finds correct previous range

#### Test Data
- Use consistent, predictable test data for date-based tests.
- Create helper functions for generating test data (e.g., `createTestPeriodRanges()`).
- Store complex test data in `test/` directory if needed.

#### Running Tests
- Run all tests: `npm test`
- Run tests in watch mode: `npm test -- --watch`
- Run specific test file: `npm test DateUtils.test.ts`
- Generate coverage report: `npm test -- --coverage`

#### Setup Instructions for Testing
To add Jest testing to this project:
1. Install dependencies: `npm install --save-dev jest @types/jest ts-jest`
2. Add test script to package.json: `"test": "jest"`
3. Create `jest.config.js` with TypeScript support and path aliases
4. Write tests following the guidelines above

### When to Skip Tests
- Simple presentational components with no logic
- Third-party library integrations (test your usage, not the library)
- Configuration files and constants
- One-off scripts or utilities

### Continuous Improvement
- Add tests when fixing bugs to prevent regression.
- Refactor tests when refactoring code to keep them maintainable.
- Review test coverage periodically and add tests for critical untested paths.
