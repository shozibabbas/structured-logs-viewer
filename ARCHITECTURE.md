# Architecture Diagram

## Layered Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│                    (Browser / React Components)                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   /app/logs  │  │ /app/settings│  │  /components │          │
│  │   page.tsx   │  │   page.tsx   │  │   LogTable   │          │
│  └──────┬───────┘  └──────┬───────┘  │  LogFilters  │          │
│         │                 │           └──────────────┘          │
│         └─────────────────┴────────────────┐                    │
│                                            ↓                    │
│                                  ┌──────────────┐               │
│                                  │    /hooks    │               │
│                                  │  useData.ts  │               │
│                                  └──────┬───────┘               │
└─────────────────────────────────────────┼────────────────────────┘
                                          │
                                          ↓
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                                │
│  ┌──────────────────┐          ┌──────────────────┐            │
│  │  /api/logs       │          │  /api/settings   │            │
│  │  route.ts        │          │  route.ts        │            │
│  │  (GET)           │          │  (GET/PUT)       │            │
│  └────────┬─────────┘          └────────┬─────────┘            │
│           │                             │                       │
│           │   Orchestrates              │                       │
│           │                             │                       │
└───────────┼─────────────────────────────┼────────────────────────┘
            │                             │
            ↓                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                        │
│  ┌─────────────────────────┐    ┌──────────────────────────┐   │
│  │  /services              │    │  /services               │   │
│  │  logParser.service.ts   │    │  settings.service.ts     │   │
│  │                         │    │                          │   │
│  │  • parseLogFiles()      │    │  • validateSettings()    │   │
│  │  • parseLogLine()       │    │  • normalizeSettings()   │   │
│  │  • applyPacketTracking()│    │  • createDefaultSettings()│  │
│  │  • extractPacketIds()   │    │                          │   │
│  └────────┬────────────────┘    └────────┬─────────────────┘   │
│           │                              │                      │
│           │  Pure Functions              │                      │
│           │  (No Side Effects)           │                      │
└───────────┼──────────────────────────────┼───────────────────────┘
            │                              │
            ↓                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       DATA ACCESS LAYER                          │
│  ┌──────────────────────┐       ┌─────────────────────────┐    │
│  │  /data/repositories  │       │  /data/repositories     │    │
│  │  logFile.repository  │       │  settings.repository    │    │
│  │                      │       │                         │    │
│  │  • readLogFiles()    │       │  • getSettings()        │    │
│  │  • readLogFile()     │       │  • updateSettings()     │    │
│  │  • directoryExists() │       │                         │    │
│  └──────────┬───────────┘       └────────┬────────────────┘    │
│             │                            │                      │
└─────────────┼────────────────────────────┼───────────────────────┘
              │                            │
              ↓                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL DEPENDENCIES                         │
│  ┌───────────────┐                  ┌──────────────┐           │
│  │  File System  │                  │   SQLite DB  │           │
│  │  /logs/*.log  │                  │  settings.db │           │
│  └───────────────┘                  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘

                               ↕
                            
┌─────────────────────────────────────────────────────────────────┐
│                         TYPE DEFINITIONS                         │
│                         (Used by all layers)                     │
│                                                                  │
│  /types/log.types.ts       /types/settings.types.ts            │
│  /types/api.types.ts       /utils/ui.utils.ts                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Example: Fetching Logs

```
1. User opens /logs page
   └─> LogsViewerPage component renders

2. useEffect calls useLogs() hook
   └─> useLogs() → fetch('/api/logs')

3. API Route: GET /api/logs
   ├─> getLogFileRepository()
   ├─> getSettingsRepository()
   │
   ├─> logFileRepo.readLogFiles()          [Data Layer]
   │   └─> Returns: ParsedFile[]
   │
   ├─> settingsRepo.getSettings()          [Data Layer]
   │   └─> Returns: LogSettings
   │
   ├─> parseLogFiles(files, settings)      [Business Layer]
   │   ├─> parseLogFile(file)
   │   │   └─> parseLogLine(line)
   │   ├─> applyPacketTracking()
   │   └─> sortLogsByTimestamp()
   │   └─> Returns: LogEntry[]
   │
   ├─> extractPacketIds(logs)              [Business Layer]
   │   └─> Returns: string[]
   │
   └─> NextResponse.json({ logs, packets })

4. Hook receives response
   └─> Updates state: setLogs(), setPackets()

5. Component re-renders
   ├─> filterLogs() filters data            [Utils]
   ├─> LogFilters renders controls          [Component]
   └─> LogTable renders logs                [Component]
```

## Component Dependency Graph

```
app/logs/page.tsx
├── uses: useLogs() hook
├── uses: filterLogs() util
├── uses: extractLogLevels() service
└── renders:
    ├── LogFilters component
    │   └── uses: formatPacketId() util
    ├── LogTable component
    │   └── uses: getLogLevelColor() util
    ├── LoadingSpinner component
    ├── ErrorMessage component
    └── EmptyState component

app/settings/page.tsx
├── uses: useSettings() hook
└── renders:
    ├── LoadingSpinner component
    └── Alert component

hooks/useData.ts
├── uses: LogEntry type
├── uses: LogSettings type
├── uses: LogsApiResponse type
└── calls: /api/logs, /api/settings

components/logs/LogTable.tsx
├── uses: LogEntry type
├── uses: getLogLevelColor() util
└── uses: formatPacketId() util

components/logs/LogFilters.tsx
└── uses: formatPacketId() util
```

## Separation of Concerns Matrix

```
┌──────────────┬─────────┬──────────┬──────────┬─────────┬────────┐
│ Layer        │ Types   │ I/O      │ Business │ API     │ UI     │
│              │ (Pure)  │ (Effects)│ (Pure)   │ (Orch.) │ (View) │
├──────────────┼─────────┼──────────┼──────────┼─────────┼────────┤
│ /types       │    ✓    │          │          │         │        │
├──────────────┼─────────┼──────────┼──────────┼─────────┼────────┤
│ /data/repos  │    ✓    │    ✓     │          │         │        │
├──────────────┼─────────┼──────────┼──────────┼─────────┼────────┤
│ /services    │    ✓    │          │    ✓     │         │        │
├──────────────┼─────────┼──────────┼──────────┼─────────┼────────┤
│ /app/api     │    ✓    │          │          │    ✓    │        │
├──────────────┼─────────┼──────────┼──────────┼─────────┼────────┤
│ /hooks       │    ✓    │    ✓     │          │         │        │
├──────────────┼─────────┼──────────┼──────────┼─────────┼────────┤
│ /components  │    ✓    │          │          │         │   ✓    │
├──────────────┼─────────┼──────────┼──────────┼─────────┼────────┤
│ /utils       │    ✓    │          │    ✓     │         │        │
└──────────────┴─────────┴──────────┴──────────┴─────────┴────────┘

✓ = Responsible for this concern
```

## Key Principles Illustrated

### 1. Single Responsibility
Each box in the diagram has ONE job

### 2. Dependency Direction
Arrows point DOWN (outer layers depend on inner)
- UI → API → Services → Data → External

### 3. Pure Core
Business logic (Services) is pure - no I/O, no side effects

### 4. Testability
Each layer can be tested in isolation:
- Services: Unit tests (pure functions)
- Repositories: Integration tests (mock database)
- API: Integration tests (mock repositories)
- Components: Component tests (mock hooks)

### 5. Flexibility
Easy to swap implementations:
- Replace SQLite with PostgreSQL → Only touch repositories
- Add caching → Only touch repositories
- Change UI framework → Only touch components
- Add new business rule → Only touch services
