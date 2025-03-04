# Development Guidelines for @produtive/messages

## Commands
- Build: `npm run build`
- Test all: `npm test`
- Test single: `npm test -- -t "test name"`
- Lint: `npm run lint`

## Code Style
- ES Modules format (import/export, not require())
- Async/await for asynchronous operations
- Class-based design with dependency injection
- Explicit error handling with informative messages
- JSDoc comments for public methods

## Naming Conventions
- camelCase for variables, methods, functions
- PascalCase for classes
- Use descriptive names that reflect purpose
- Prefix private members with underscore

## Project Structure
- `src/adapters`: External API integrations
- `src/db`: Database repositories
- `src/utils`: Shared utilities
- `test`: Unit tests mirroring src structure