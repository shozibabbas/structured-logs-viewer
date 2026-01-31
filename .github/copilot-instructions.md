# Production-Grade Coding Standards

## Core Principles

### 1. Separation of Concerns
Always separate code into distinct layers with clear responsibilities:

- **Types Layer** (`/types`): TypeScript interfaces and type definitions
- **Data Layer** (`/data/repositories`): Database access and file I/O
- **Business Logic Layer** (`/services`): Pure functions, business rules, transformations
- **API Layer** (`/app/api`): HTTP request/response handling, orchestration
- **UI Layer** (`/components`, `/app/**/page.tsx`): React components, presentation logic
- **Utilities** (`/utils`): Reusable helper functions
- **Hooks** (`/hooks`): React hooks for state management and side effects

### 2. Type Safety
- ✅ **ALWAYS** define explicit types for all data structures
- ✅ **NEVER** use `any` type without documented justification
- ✅ **DO** create dedicated type files organized by domain
- ✅ **DO** use type imports with `import type` for clarity

### 3. Single Responsibility Principle
Each file, function, and component should have ONE clear purpose:

```typescript
// ❌ BAD: Mixed concerns
function fetchAndProcessAndDisplayLogs() { }

// ✅ GOOD: Separated concerns
function fetchLogs() { }              // Data layer
function processLogs() { }            // Business logic
function DisplayLogs() { }            // UI layer
```

### 4. Pure Functions
Business logic must be pure (no side effects):

```typescript
// ✅ GOOD: Pure function
export function parseLogLine(line: string): LogEntry | null {
  // No side effects, predictable output
}

// ❌ BAD: Side effects
export function parseLogLine(line: string) {
  console.log(line);  // Side effect
  database.save(line); // Side effect
}
```

## File Organization

### Directory Structure
```
/
├── types/              # Type definitions
│   ├── log.types.ts
│   ├── settings.types.ts
│   └── api.types.ts
├── data/               # Data access layer
│   └── repositories/
│       ├── settings.repository.ts
│       └── logFile.repository.ts
├── services/           # Business logic
│   ├── logParser.service.ts
│   └── settings.service.ts
├── utils/              # Utility functions
│   └── ui.utils.ts
├── hooks/              # Custom React hooks
│   └── useData.ts
├── components/         # Reusable UI components
│   ├── common/
│   └── logs/
└── app/                # Next.js app directory
    ├── api/            # API routes
    ├── logs/           # Feature pages
    └── settings/
```

### Naming Conventions

#### Files
- **Types**: `*.types.ts`
- **Services**: `*.service.ts`
- **Repositories**: `*.repository.ts`
- **Components**: `PascalCase.tsx`
- **Utilities**: `camelCase.utils.ts`
- **Hooks**: `useCustomHook.ts`

#### Functions/Variables
- **Functions**: `camelCase`
- **Components**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`

## Layer-Specific Rules

### Types Layer (`/types`)
```typescript
/**
 * ✅ RULES:
 * - One domain per file
 * - Export interfaces and types only
 * - No implementation code
 * - Document complex types
 */

// types/log.types.ts
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  // ... other fields
}

export type LogLevel = 'INFO' | 'ERROR' | 'WARNING';
```

### Data Layer (`/data/repositories`)
```typescript
/**
 * ✅ RULES:
 * - Repository pattern for all data access
 * - No business logic
 * - Handle errors appropriately
 * - Use dependency injection where possible
 */

export class SettingsRepository {
  constructor(private db: Database) {}
  
  public getSettings(): LogSettings {
    return this.db.prepare('SELECT * FROM settings').get();
  }
  
  public updateSettings(input: UpdateSettingsInput): LogSettings {
    // Only data access, no validation or transformation
  }
}
```

### Business Logic Layer (`/services`)
```typescript
/**
 * ✅ RULES:
 * - Pure functions only
 * - No side effects (no I/O, no mutations)
 * - Comprehensive unit testable
 * - Single responsibility per function
 */

export function parseLogFiles(
  files: ParsedFile[],
  options?: PacketTrackingOptions
): LogEntry[] {
  // Pure transformation logic
  // No database calls
  // No file I/O
  // No console.log
}
```

### API Layer (`/app/api`)
```typescript
/**
 * ✅ RULES:
 * - Thin controllers - orchestrate only
 * - Delegate to services and repositories
 * - Handle errors with proper HTTP status codes
 * - Type API responses
 */

export async function GET() {
  try {
    const repo = getLogFileRepository();      // Data layer
    const settings = getSettingsRepository(); // Data layer
    
    const files = await repo.readLogFiles();
    const logs = parseLogFiles(files);        // Business layer
    
    return NextResponse.json<LogsApiResponse>({ logs });
  } catch (error) {
    return NextResponse.json<LogsApiError>(
      { error: 'Failed' },
      { status: 500 }
    );
  }
}
```

### UI Layer (`/components`, `/app/**/page.tsx`)
```typescript
/**
 * ✅ RULES:
 * - Components handle presentation only
 * - Use hooks for data fetching
 * - Delegate logic to utils/services
 * - Props over prop drilling (use composition)
 * - No business logic in components
 */

export function LogTable({ logs, packetsEnabled }: LogTableProps) {
  // Only rendering logic
  // No data fetching
  // No transformations
  // No calculations
}
```

### Hooks Layer (`/hooks`)
```typescript
/**
 * ✅ RULES:
 * - Encapsulate data fetching and state
 * - Return consistent interface
 * - Handle loading and error states
 * - Reusable across components
 */

export function useLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ...fetch logic
  
  return { logs, loading, error, refetch };
}
```

## Code Quality Standards

### 1. Documentation
```typescript
/**
 * ✅ REQUIRED for:
 * - Public functions and classes
 * - Complex algorithms
 * - Non-obvious behavior
 */

/**
 * Parses a log line into a structured LogEntry object
 * 
 * @param line - Raw log line string
 * @param fileName - Source file name for tracking
 * @param lineNumber - Line number in source file
 * @returns Parsed LogEntry or null if format doesn't match
 */
export function parseLogLine(
  line: string,
  fileName: string,
  lineNumber: number
): LogEntry | null {
  // Implementation
}
```

### 2. Error Handling
```typescript
// ✅ GOOD: Explicit error handling
try {
  const data = await fetchData();
  return processData(data);
} catch (error) {
  console.error('Error in fetchData:', error);
  return { error: error instanceof Error ? error.message : 'Unknown error' };
}

// ❌ BAD: Silent failures
const data = await fetchData().catch(() => null);
```

### 3. Immutability
```typescript
// ✅ GOOD: Immutable operations
const newArray = [...oldArray, newItem];
const newObject = { ...oldObject, updated: true };

// ❌ BAD: Mutations
oldArray.push(newItem);
oldObject.updated = true;
```

### 4. Modularity
```typescript
// ✅ GOOD: Small, focused functions
function parseTimestamp(timestamp: string): Date { }
function sortByTimestamp(entries: LogEntry[]): LogEntry[] { }
function extractPacketIds(entries: LogEntry[]): string[] { }

// ❌ BAD: Giant multi-purpose function
function doEverything(data: any): any { }
```

## Testing Standards

### Test File Organization
```
/services
  ├── logParser.service.ts
  └── logParser.service.test.ts  // Co-located tests
```

### What to Test
- ✅ **DO** test business logic (services)
- ✅ **DO** test utilities
- ✅ **DO** test data transformations
- ⚠️ **OPTIONAL** test components (integration/e2e preferred)
- ❌ **DON'T** test trivial getters/setters

## Performance Standards

### 1. Memoization
```typescript
// ✅ GOOD: Memoize expensive computations
const filteredLogs = useMemo(
  () => filterLogs(logs, filters),
  [logs, filters]
);
```

### 2. Avoid Unnecessary Re-renders
```typescript
// ✅ GOOD: Extract callbacks
const handleChange = useCallback((value: string) => {
  setValue(value);
}, []);
```

### 3. Efficient Data Structures
```typescript
// ✅ GOOD: Use Set for unique values
const uniqueIds = new Set(logs.map(log => log.id));

// ❌ BAD: Use array with includes
const uniqueIds = logs.filter((log, index, self) => 
  self.findIndex(l => l.id === log.id) === index
);
```

## Security Standards

### 1. Input Validation
```typescript
// ✅ GOOD: Validate all inputs
export function validateSettings(input: UpdateSettingsInput) {
  if (!input.packetStartPattern?.trim()) {
    return { valid: false, errors: ['Pattern required'] };
  }
  
  try {
    new RegExp(input.packetStartPattern);
  } catch {
    return { valid: false, errors: ['Invalid regex'] };
  }
  
  return { valid: true, errors: [] };
}
```

### 2. SQL Injection Prevention
```typescript
// ✅ GOOD: Parameterized queries
db.prepare('UPDATE settings SET value = ? WHERE id = ?').run(value, id);

// ❌ BAD: String concatenation
db.exec(`UPDATE settings SET value = '${value}' WHERE id = ${id}`);
```

### 3. XSS Prevention
```typescript
// ✅ GOOD: React auto-escapes
<div>{userInput}</div>

// ⚠️ DANGEROUS: dangerouslySetInnerHTML (avoid)
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

## Accessibility Standards

```typescript
// ✅ GOOD: Semantic HTML and ARIA
<button 
  onClick={handleClick}
  aria-label="Close dialog"
  disabled={loading}
>
  Close
</button>

// ❌ BAD: div soup
<div onClick={handleClick}>Close</div>
```

## Git Commit Standards

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `test`: Test additions/changes
- `chore`: Build process, dependencies

### Examples
```
feat(logs): add packet filtering functionality

- Implement packet ID tracking in log parser
- Add packet filter dropdown to UI
- Update API to return packet information

Closes #123
```

## Code Review Checklist

Before submitting code, ensure:

- [ ] Code follows layer separation principles
- [ ] All functions have single responsibility
- [ ] Types are explicitly defined
- [ ] Error handling is comprehensive
- [ ] No console.log in production code
- [ ] Documentation is complete
- [ ] No unused imports or variables
- [ ] Performance optimizations applied (memoization)
- [ ] Accessibility considerations addressed
- [ ] Tests written for business logic
- [ ] Build passes without errors/warnings

## Refactoring Checklist

When refactoring existing code:

1. [ ] Identify mixed concerns
2. [ ] Extract types to `/types` directory
3. [ ] Move data access to `/data/repositories`
4. [ ] Extract business logic to `/services`
5. [ ] Create reusable components in `/components`
6. [ ] Extract hooks to `/hooks`
7. [ ] Update imports to use new structure
8. [ ] Verify build and tests pass
9. [ ] Update documentation

---

## Summary

**Golden Rules:**
1. **Separate** types, data, business logic, and UI
2. **Pure** functions for business logic
3. **Type** everything explicitly
4. **Document** public APIs
5. **Handle** errors properly
6. **Test** business logic
7. **Optimize** performance with memoization
8. **Validate** all inputs
9. **Commit** with clear messages
10. **Review** against checklist

**Remember:** Production-grade code is:
- ✅ Maintainable
- ✅ Testable
- ✅ Scalable
- ✅ Secure
- ✅ Performant
- ✅ Documented
