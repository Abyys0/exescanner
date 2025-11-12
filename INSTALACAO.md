# Guia de Instalação e Execução - ExeScanner Monitor

## 📋 Pré-requisitos

- **Node.js** 18+ (recomendado: Node.js 20 LTS)
- **npm** ou **yarn**
- Sistema operacional: Windows, Linux ou macOS

## 🚀 Instalação

### 1. Backend (Servidor)

```bash
cd "Web e Exe\server"
npm install
```

### 2. Frontend (Interface Web)

```bash
cd "Web e Exe\web"
npm install
```

## ⚙️ Configuração

### Backend

1. Copie o arquivo de exemplo de variáveis de ambiente:
```bash
cd server
copy .env.example .env
```

2. Edite o `.env` com suas configurações:
```env
PORT=3001
JWT_SECRET=seu_secret_super_seguro_aqui_mude_isso
SCANNER_API_TOKEN=token_para_autenticar_scanner
DB_PATH=./data/scanner.db
CORS_ORIGIN=http://localhost:5173
```

### Frontend

1. Copie o arquivo de exemplo:
```bash
cd web
copy .env.example .env
```

2. Configure as URLs (geralmente não precisa mudar):
```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=http://localhost:3001
```

## 🏃 Execução

### Modo Desenvolvimento

**Terminal 1 - Backend:**
```bash
cd "Web e Exe\server"
npm run dev
```
O servidor estará rodando em `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd "Web e Exe\web"
npm run dev
```
A interface web estará em `http://localhost:5173`

### Modo Produção

**Backend:**
```bash
cd server
npm run build
npm start
```

**Frontend:**
```bash
cd web
npm run build
npm run preview
```

## 🔑 Acesso Inicial

Abra o navegador em `http://localhost:5173` e faça login com:

- **Usuário:** admin
- **Senha:** admin

⚠️ **IMPORTANTE:** Mude as credenciais padrão em produção editando `server/src/routes/auth.ts`

## 📊 Testando o Sistema

### 1. Testar Backend (Health Check)

```bash
curl http://localhost:3001/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Testar Login

```bash
curl -X POST http://localhost:3001/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"admin\"}"
```

### 3. Enviar Evento de Teste (simular scanner)

```bash
curl -X POST http://localhost:3001/api/ingest/event ^
  -H "Content-Type: application/json" ^
  -H "x-scanner-token: seu_token_do_env" ^
  -d "{\"sessionId\":\"test-session\",\"type\":\"finding\",\"data\":{\"fileName\":\"teste.exe\",\"filePath\":\"C:\\\\test\\\\teste.exe\",\"type\":\"PEAnomaly\",\"severity\":\"HIGH\",\"hash\":\"abc123\"}}"
```

## 🛠️ Estrutura de Diretórios

```
Web e Exe/
├── server/                 # Backend Node.js
│   ├── src/
│   │   ├── index.ts       # Servidor principal
│   │   ├── db/            # Configuração SQLite
│   │   ├── models/        # CRUD do banco
│   │   ├── routes/        # Endpoints REST
│   │   ├── middleware/    # Autenticação JWT
│   │   └── types/         # TypeScript types
│   ├── package.json
│   └── .env
│
└── web/                   # Frontend React
    ├── src/
    │   ├── main.tsx       # Entry point
    │   ├── App.tsx        # Rotas principais
    │   ├── components/    # Componentes reutilizáveis
    │   ├── pages/         # Páginas da aplicação
    │   ├── services/      # API client e WebSocket
    │   └── types/         # TypeScript types
    ├── package.json
    └── .env
```

## 🔌 Integrando com o Scanner C#

No seu projeto ExeScanner C#, adicione a classe `MonitoringClient` (veja README.md principal) e use:

```csharp
var monitor = new MonitoringClient("http://localhost:3001", "seu_token");
var sessionId = await monitor.CreateSessionAsync("Varredura Manual", "C:\\scan");

// Durante a varredura
await monitor.SendProgressAsync(sessionId, 45, "FileSystem", 5000);
await monitor.SendFindingAsync(sessionId, new Detection { ... });

// Ao finalizar
await monitor.SendDoneAsync(sessionId, new { analyzed = 100, suspects = 5 });
```

## 📝 Scripts Disponíveis

### Backend
- `npm run dev` - Modo desenvolvimento com hot reload
- `npm run build` - Compilar TypeScript
- `npm start` - Rodar versão compilada
- `npm run lint` - Verificar código

### Frontend
- `npm run dev` - Servidor de desenvolvimento Vite
- `npm run build` - Build de produção
- `npm run preview` - Preview do build
- `npm run lint` - ESLint

## 🐛 Troubleshooting

### Erro: "Port 3001 already in use"
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Erro: "Cannot connect to WebSocket"
- Verifique se o backend está rodando
- Confirme as URLs no `.env` do frontend
- Verifique o CORS no backend

### Erro: "Database locked"
- Feche outras conexões ao SQLite
- Delete o arquivo `.db-wal` e `.db-shm` se existirem
- Reinicie o backend

### Frontend não carrega estilos
```bash
cd web
rm -rf node_modules
npm install
npm run dev
```

## 📚 Documentação Adicional

- **API Endpoints:** Ver `README.md` principal
- **WebSocket Events:** Ver `README.md` principal  
- **Database Schema:** Ver `README.md` principal

## 🔒 Segurança

Para produção:
1. Mude `JWT_SECRET` para um valor aleatório forte
2. Mude `SCANNER_API_TOKEN`
3. Configure HTTPS no servidor
4. Atualize credenciais padrão
5. Configure firewall adequadamente
6. Use variáveis de ambiente, não hardcode secrets

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs do console (backend e browser)
2. Confirme que todas as dependências foram instaladas
3. Valide as configurações dos arquivos `.env`
4. Teste os endpoints individualmente com curl

---

✅ Sistema pronto para uso após seguir estes passos!
