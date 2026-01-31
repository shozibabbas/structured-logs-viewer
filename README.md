# 📊 Structured Logs Viewer

A modern, web-based log viewer built with Next.js for analyzing and filtering structured application logs. Perfect for development, debugging, and monitoring applications that generate structured log files.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=flat)

## ✨ Features

- 📁 **Multi-file Support** - Automatically reads and combines multiple log files
- 🔍 **Advanced Filtering** - Filter by log level (INFO, ERROR, WARNING, etc.) and source file
- 🔎 **Full-text Search** - Search across messages, modules, and timestamps
- 📊 **Clean Interface** - View logs in an organized table with syntax highlighting
- 🔄 **Real-time Refresh** - Reload logs on demand to see latest entries
- 📝 **Multi-line Log Support** - Properly handles stack traces and multi-line entries
- ⚡ **Fast & Responsive** - Built with performance in mind using Next.js App Router
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/shozibabbas/structured-logs-viewer.git
cd structured-logs-viewer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📖 Usage

### Adding Log Files

Place your `.log` files in the `logs/` directory at the project root:

```
structured-logs-viewer/
├── logs/
│   ├── application.log
│   ├── errors.log
│   ├── debug.log
│   └── access.log
├── app/
├── lib/
└── ...
```

### Supported Log Format

The viewer expects logs in the following pipe-delimited format:

```
YYYY-MM-DD HH:MM:SS,mmm | LEVEL | module_name | message
```

**Example:**
```
2026-01-30 14:32:15,123 | INFO | auth.service | User authentication successful
2026-01-30 14:32:16,456 | ERROR | db.connection | Connection timeout after 30s
2026-01-30 14:32:17,789 | WARNING | cache.redis | Cache miss for key: user_session_abc123
```

**Supported Log Levels:**
- `INFO`
- `WARNING` / `WARN`
- `ERROR`
- `DEBUG`
- `CRITICAL` / `FATAL`

### Generating Compatible Logs

#### Python

Configure Python's logging module to output in the expected format:

```python
import logging
import os

# Set log level from environment or default to INFO
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()

# Configure logging format to match the viewer's expected format
logging.basicConfig(
    level=LOG_LEVEL,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)

# Create logger for your module
log = logging.getLogger("your_module_name")

# Use it in your code
log.info("Application started successfully")
log.warning("Cache miss for key: %s", cache_key)
log.error("Database connection failed: %s", error_message)
```

#### JavaScript/Node.js

Using popular logging libraries like Winston or Pino:

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss,SSS' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} | ${level.toUpperCase()} | ${process.env.MODULE_NAME || 'app'} | ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/application.log' })
  ]
});

logger.info('User authentication successful');
logger.error('Connection timeout after 30s');
```

#### Other Languages

The key is to use a format string that outputs:
1. **Timestamp** in `YYYY-MM-DD HH:MM:SS,mmm` format
2. **Pipe separator** (` | `)
3. **Log level** (INFO, ERROR, etc.)
4. **Pipe separator** (` | `)
5. **Module/logger name**
6. **Pipe separator** (` | `)
7. **Message**

### Multi-line Logs & Stack Traces

The parser automatically handles multi-line log entries, such as stack traces:

```
2026-01-30 14:35:42,123 | ERROR | api.handler | Request failed with exception
Traceback (most recent call last):
  File "/app/api/handler.py", line 42, in process_request
    result = process_data(request.body)
ValueError: Invalid input format
```

### Viewing Logs

1. Navigate to [http://localhost:3000](http://localhost:3000)
2. Click **"View Logs"**
3. Use the filters and search bar to find specific entries
4. Click **"Refresh"** to reload logs from disk

## 🛠️ API Reference

### `GET /api/logs`

Retrieves all parsed log entries from the `logs/` directory.

**Response:**
```json
{
  "logs": [
    {
      "timestamp": "2026-01-30 14:32:15,123",
      "level": "INFO",
      "module": "auth.service",
      "message": "User authentication successful",
      "fileName": "application.log",
      "rawLine": "2026-01-30 14:32:15,123 | INFO | auth.service | User authentication successful",
      "lineNumber": 42
    }
  ],
  "totalEntries": 1523,
  "files": ["application.log", "errors.log"]
}
```

**Error Responses:**

- `404` - Logs directory not found
- `500` - Failed to read log files

## 📂 Project Structure

```
structured-logs-viewer/
├── app/
│   ├── api/
│   │   └── logs/
│   │       └── route.ts          # API endpoint for reading logs
│   ├── logs/
│   │   └── page.tsx              # Main logs viewer interface
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── lib/
│   └── logParser.ts              # Log parsing utilities
├── logs/                         # Place your .log files here
│   └── sample.log                # Example log file
├── public/                       # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

## 🧪 Development

### Build for Production

```bash
npm run build
npm start
```

### Run Linter

```bash
npm run lint
```

### Type Checking

```bash
npx tsc --noEmit
```

## 🎨 Customization

### Change Log Directory

By default, logs are read from the `logs/` directory. To use a different location, modify the path in `app/api/logs/route.ts`:

```typescript
const logsDir = path.join(process.cwd(), 'your-logs-directory');
```

### Custom Log Format

To support a different log format, update the regex pattern in `lib/logParser.ts`:

```typescript
const logPattern = /your-custom-pattern/;
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Heroicons](https://heroicons.com/)

## 📧 Contact

Project Link: [https://github.com/shozibabbas/structured-logs-viewer](https://github.com/shozibabbas/structured-logs-viewer)

---

<p align="center">Made with ❤️ for developers who love clean logs</p>
