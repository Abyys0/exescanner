# ExeScanner - Sistema de Monitoramento Web

Sistema de monitoramento em tempo real para acompanhar os resultados do scanner ExeScanner via dashboard web.

## 📖 Documentação

- **[INSTALACAO.md](INSTALACAO.md)** - Guia completo de instalação e configuração
- **[RESUMO.md](RESUMO.md)** - Visão geral do sistema e status de implementação
- **[COMANDOS.md](COMANDOS.md)** - Comandos úteis para desenvolvimento e troubleshooting
- **README.md** (este arquivo) - Documentação técnica da API e arquitetura

## 📁 Estrutura

```
Web e Exe/
├── server/          # Backend Node.js + Express + Socket.IO
│   ├── src/
│   │   ├── routes/      # REST API endpoints
│   │   ├── models/      # Data models & DB operations
│   │   ├── middleware/  # Auth & validation
│   │   ├── types/       # TypeScript interfaces
│   │   ├── db/          # SQLite setup
│   │   └── index.ts     # Server entry point
│   ├── data/            # SQLite database (auto-created)
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── web/             # Frontend React + Vite + TypeScript
    ├── src/
    │   ├── pages/       # Dashboard pages
    │   ├── components/  # Reusable UI components
    │   ├── services/    # API & WebSocket clients
    │   ├── hooks/       # Custom React hooks
    │   ├── store/       # State management (Zustand)
    │   └── App.tsx      # Main app component
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── .env.example
```

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd "Web e Exe/server"

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Edit .env and set your secrets:
# - JWT_SECRET (production)
# - SCANNER_API_TOKEN (scanner authentication)

# Run in development
npm run dev

# Or build and run production
npm run build
npm start
```

**Default credentials:**
- Username: `admin`
- Password: `admin`

### 2. Frontend Setup

```bash
cd "Web e Exe/web"

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Run development server
npm run dev

# Or build for production
npm run build
npm run preview
```

Visit http://localhost:5173

## 🔌 API Endpoints

### Authentication
- `POST /auth/login` - Login and get JWT token
  ```json
  {
    "username": "admin",
    "password": "admin"
  }
  ```

### Sessions
- `GET /sessions` - List all sessions (recent first)
- `POST /sessions` - Create new session
  ```json
  {
    "clientLabel": "Scanner Client 1"
  }
  ```
- `GET /sessions/:id` - Get session details

### Results
- `GET /results?sessionId=<id>&page=1&limit=50` - Get paginated results
- `GET /results?severity=CRITICAL` - Filter by severity
- `GET /results/critical?sessionId=<id>` - Get HIGH/CRITICAL only
- `POST /results/ack` - Mark result as reviewed
  ```json
  {
    "id": "result-uuid"
  }
  ```

### Logs
- `GET /logs?sessionId=<id>&level=ERROR&page=1` - Get paginated logs

### Ingest (Scanner → Server)
- `POST /ingest/event` - Receive scanner events
  - Headers: `x-scanner-token: <SCANNER_API_TOKEN>`
  - Body:
    ```json
    {
      "type": "progress|finding|error|done",
      "payload": { ... }
    }
    ```

## 📡 WebSocket Events

### Client → Server
- `join:session` - Join a session room
  ```javascript
  socket.emit('join:session', sessionId);
  ```
- `leave:session` - Leave a session room

### Server → Client
- `progress` - Scan progress update
  ```javascript
  {
    sessionId: string,
    percent: number,
    module: string,
    elapsedMs: number
  }
  ```
- `finding` - New result detected
  ```javascript
  {
    id: string,
    sessionId: string,
    filename: string,
    path: string,
    status: 'OK' | 'SUSPECT',
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    detectedAt: string,
    type?: string,
    hash?: string
  }
  ```
- `error` - Scan error
  ```javascript
  {
    sessionId: string,
    message: string,
    code?: string
  }
  ```
- `done` - Scan completed
  ```javascript
  {
    sessionId: string,
    summary?: {
      totalFiles: number,
      suspectCount: number,
      criticalCount: number,
      duration: number
    }
  }
  ```

## 🔗 Integrating with ExeScanner

### Option 1: HTTP Webhook (Recommended)

Add to your scanner code (C#):

```csharp
using System.Net.Http;
using System.Text;
using System.Text.Json;

public class MonitoringClient
{
    private readonly HttpClient _http;
    private readonly string _baseUrl = "http://localhost:3001";
    private readonly string _token = "scanner-secret-token-change-me";

    public async Task SendProgressAsync(string sessionId, int percent, string module, long elapsedMs)
    {
        await SendEventAsync("progress", new {
            sessionId,
            percent,
            module,
            elapsedMs
        });
    }

    public async Task SendFindingAsync(string sessionId, Detection detection)
    {
        await SendEventAsync("finding", new {
            sessionId,
            filename = detection.Evidence.FileName,
            path = detection.Evidence.FullPath,
            status = detection.Severity > DetectionSeverity.Low ? "SUSPECT" : "OK",
            severity = detection.Severity.ToString().ToUpper(),
            detectedAt = DateTime.UtcNow.ToString("o"),
            type = detection.Category,
            hash = detection.Evidence.SHA256Hash
        });
    }

    public async Task SendDoneAsync(string sessionId, ScanSummary summary)
    {
        await SendEventAsync("done", new {
            sessionId,
            summary = new {
                totalFiles = summary.TotalFiles,
                suspectCount = summary.SuspectCount,
                criticalCount = summary.CriticalCount,
                duration = summary.DurationMs
            }
        });
    }

    private async Task SendEventAsync(string type, object payload)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/ingest/event");
        request.Headers.Add("x-scanner-token", _token);
        request.Content = new StringContent(
            JsonSerializer.Serialize(new { type, payload }),
            Encoding.UTF8,
            "application/json"
        );
        
        await _http.SendAsync(request);
    }
}
```

### Option 2: Socket.IO Direct (Advanced)

Install `SocketIOClient` NuGet package and connect directly.

## 🎨 Features

### Dashboard Pages

1. **Início** - Metrics cards:
   - Total files analyzed
   - Suspects found
   - Critical issues
   - Active sessions
   - Average scan duration

2. **Varredura** - Real-time monitoring:
   - Progress bar with percentage
   - Current module being scanned
   - Elapsed time
   - Live log stream

3. **Resultados** - Results table:
   - Filename, path, status, severity, timestamp
   - Filters: text search, status, severity
   - Pagination
   - Click row → details modal with actions

4. **Críticos** - Priority list:
   - HIGH and CRITICAL findings only
   - Auto-populated after scan completion
   - Red neon border for unreviewed items
   - Badge with priority level

5. **Logs** - Timeline view:
   - Real-time log stream via WebSocket
   - Filter by level (INFO/WARN/ERROR)
   - Color-coded entries
   - Context expansion

6. **Configurações** - UI for thresholds/patterns (mock)

7. **Enviar Scanner** - Client management:
   - Generate download link (mock)
   - Execution instructions
   - Connection status indicator
   - "Start Scan" button to create session

### UX Highlights

- ✅ Dark theme with neon blue/green accents
- ✅ Smooth transitions and hover effects
- ✅ Real-time updates via WebSocket (no polling)
- ✅ Auto-refresh critical list on scan completion
- ✅ Banner notification for new unreviewed criticals
- ✅ Responsive layout (desktop/tablet/mobile)
- ✅ ARIA labels for accessibility
- ✅ Loading states and error handling

## 🛠 Development

### Backend Structure
- **Express** - REST API framework
- **Socket.IO** - Real-time bidirectional communication
- **better-sqlite3** - Embedded SQL database
- **JWT** - Stateless authentication
- **TypeScript** - Type safety

### Frontend Structure
- **React 18** - UI library
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Lightweight state management
- **Socket.IO Client** - WebSocket integration
- **Axios** - HTTP client
- **React Router** - SPA routing

## 📊 Database Schema

### sessions
```sql
id TEXT PRIMARY KEY
clientLabel TEXT
status TEXT  -- 'ACTIVE' | 'DONE' | 'ERROR'
startedAt TEXT
finishedAt TEXT
totalFiles INTEGER
suspectCount INTEGER
criticalCount INTEGER
```

### results
```sql
id TEXT PRIMARY KEY
sessionId TEXT
filename TEXT
path TEXT
status TEXT  -- 'OK' | 'SUSPECT'
severity TEXT  -- 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
detectedAt TEXT
type TEXT
hash TEXT
notes TEXT
reviewed INTEGER (0/1)
reviewedAt TEXT
```

### logs
```sql
id TEXT PRIMARY KEY
sessionId TEXT
level TEXT  -- 'INFO' | 'WARN' | 'ERROR'
message TEXT
timestamp TEXT
context TEXT (JSON)
```

## 🔐 Security Notes

⚠️ **For Production:**

1. Change `JWT_SECRET` in `.env`
2. Change `SCANNER_API_TOKEN` in `.env`
3. Use strong password for admin user (or implement proper user DB)
4. Enable HTTPS
5. Set proper CORS origins
6. Add rate limiting (already included: `express-rate-limit`)
7. Use Helmet security headers (already included)

## 📝 License

MIT

## 🆘 Support

For issues or questions about the monitoring dashboard, check:
- Backend logs: server console output
- Frontend logs: browser DevTools console
- Database: `server/data/scanner.db` (SQLite browser tools)

Default ports:
- Backend: 3001
- Frontend: 5173
