# Comandos Rápidos - ExeScanner Monitor

## 🚀 Instalação e Inicialização

### Instalação Automática (Recomendado)
```bash
instalar.bat
```

### Instalação Manual
```bash
# Backend
cd server
npm install
copy .env.example .env

# Frontend
cd ..\web
npm install
copy .env.example .env
```

### Iniciar Sistema (Automático)
```bash
iniciar.bat
```

### Iniciar Manual
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd web
npm run dev
```

## 🧪 Testes e Debug

### Testar Backend
```bash
# Health check
curl http://localhost:3001/health

# Login
curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin\"}"

# Criar sessão (substitua TOKEN pelo token recebido no login)
curl -X POST http://localhost:3001/api/sessions -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" -d "{\"name\":\"Teste\",\"targetPath\":\"C:\\\\test\",\"status\":\"running\"}"

# Listar sessões
curl http://localhost:3001/api/sessions -H "Authorization: Bearer TOKEN"
```

### Enviar Evento de Teste (Simular Scanner)
```bash
# Substitua SEU_TOKEN pelo valor de SCANNER_API_TOKEN do .env
curl -X POST http://localhost:3001/api/ingest/event ^
  -H "Content-Type: application/json" ^
  -H "x-scanner-token: SEU_TOKEN" ^
  -d "{\"sessionId\":\"test-123\",\"type\":\"finding\",\"data\":{\"fileName\":\"malware.exe\",\"filePath\":\"C:\\\\temp\\\\malware.exe\",\"type\":\"YARA\",\"severity\":\"CRITICAL\",\"hash\":\"abc123def456\",\"details\":{\"rule\":\"GenericMalware\"}}}"
```

### Verificar Logs
```bash
# Backend (console do terminal)
# Frontend (DevTools do navegador - F12)
```

## 🔧 Build para Produção

### Backend
```bash
cd server
npm run build
npm start
```

### Frontend
```bash
cd web
npm run build
npm run preview
```

## 🗄️ Banco de Dados

### Localização
```
server/data/scanner.db
```

### Resetar Banco
```bash
# Parar o backend primeiro!
cd server
del data\scanner.db
del data\scanner.db-wal
del data\scanner.db-shm
# Reiniciar o backend - banco será recriado automaticamente
```

### Consultar SQLite Diretamente
```bash
# Instalar sqlite3 CLI
# Windows: baixar de https://sqlite.org/download.html

sqlite3 server/data/scanner.db

# Comandos úteis:
.tables                    # Listar tabelas
.schema sessions          # Ver schema da tabela
SELECT * FROM sessions;   # Ver todas as sessões
SELECT * FROM results WHERE severity = 'CRITICAL';
.quit                     # Sair
```

## 📝 Desenvolvimento

### Adicionar Dependência
```bash
# Backend
cd server
npm install nome-do-pacote

# Frontend
cd web
npm install nome-do-pacote
```

### Verificar Erros (Lint)
```bash
# Backend
cd server
npm run lint

# Frontend
cd web
npm run lint
```

### Formatar Código (se tiver prettier configurado)
```bash
npm run format
```

## 🌐 URLs Importantes

- **Frontend Dev:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/health
- **API Docs:** Ver README.md

## 🔑 Credenciais Padrão

- **Usuário:** admin
- **Senha:** admin

**⚠️ MUDAR EM PRODUÇÃO!**

## 🛠️ Troubleshooting

### Porta já em uso
```bash
# Backend (porta 3001)
netstat -ano | findstr :3001
taskkill /PID <número> /F

# Frontend (porta 5173)
netstat -ano | findstr :5173
taskkill /PID <número> /F
```

### Limpar Cache
```bash
# Backend
cd server
rd /s /q node_modules
del package-lock.json
npm install

# Frontend
cd web
rd /s /q node_modules
rd /s /q .vite
del package-lock.json
npm install
```

### Reinstalar Tudo
```bash
# Na raiz de "Web e Exe"
cd server
rd /s /q node_modules
cd ..\web
rd /s /q node_modules
cd ..
instalar.bat
```

## 📊 Monitoramento

### Ver Processos Node Rodando
```bash
tasklist | findstr node
```

### Matar Todos os Processos Node
```bash
taskkill /IM node.exe /F
```

### Ver Conexões WebSocket Ativas
```bash
# No código do servidor, adicione log:
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  console.log('Total clients:', io.sockets.sockets.size);
});
```

## 🔐 Segurança

### Gerar JWT Secret Aleatório
```bash
# PowerShell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Mudar Senha do Admin
Edite `server/src/routes/auth.ts` e altere a hash:

```bash
# Gerar hash bcrypt da nova senha
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('suaSenha', 10))"
```

## 📦 Deploy

### Copiar para Servidor
```
Web e Exe/
├── server/
│   ├── src/
│   ├── package.json
│   └── .env (configurado)
└── web/
    ├── dist/ (após npm run build)
    └── package.json
```

### Servidor Linux
```bash
# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Backend
cd server
npm install --production
npm run build
npm start

# Frontend (servir com nginx ou similar)
cd web
npm run build
# Copiar dist/ para /var/www/html
```

### Usando PM2 (Process Manager)
```bash
npm install -g pm2

# Backend
cd server
pm2 start npm --name "exescanner-api" -- start
pm2 save
pm2 startup
```

## 🔄 Atualizações

### Atualizar Dependências
```bash
# Backend
cd server
npm update

# Frontend
cd web
npm update
```

### Verificar Vulnerabilidades
```bash
npm audit
npm audit fix
```

## 📚 Referências Rápidas

- **Express.js:** https://expressjs.com/
- **Socket.IO:** https://socket.io/docs/v4/
- **React:** https://react.dev/
- **Vite:** https://vitejs.dev/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **SQLite:** https://sqlite.org/docs.html

---

💡 **Dica:** Mantenha este arquivo aberto em outra janela durante o desenvolvimento!
