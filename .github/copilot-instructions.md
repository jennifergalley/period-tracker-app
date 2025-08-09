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
