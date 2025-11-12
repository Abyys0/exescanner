# Checklist de Verificação - ExeScanner Monitor

Use este checklist para garantir que o sistema está funcionando corretamente.

## ✅ Pré-Instalação

- [ ] Node.js 18+ instalado (`node --version`)
- [ ] npm disponível (`npm --version`)
- [ ] Portas 3001 e 5173 livres

## ✅ Instalação

### Backend
- [ ] `cd server && npm install` executado com sucesso
- [ ] Arquivo `.env` criado a partir de `.env.example`
- [ ] `JWT_SECRET` configurado no `.env`
- [ ] `SCANNER_API_TOKEN` configurado no `.env`
- [ ] Sem erros de compilação TypeScript

### Frontend
- [ ] `cd web && npm install` executado com sucesso
- [ ] Arquivo `.env` criado a partir de `.env.example`
- [ ] URLs no `.env` estão corretas (localhost:3001)
- [ ] Sem erros de compilação TypeScript

## ✅ Inicialização

### Backend (porta 3001)
- [ ] `npm run dev` iniciou sem erros
- [ ] Mensagem "Server running on port 3001" exibida
- [ ] Mensagem "Database initialized" exibida
- [ ] Sem erros no console

### Frontend (porta 5173)
- [ ] `npm run dev` iniciou sem erros
- [ ] Mensagem com URL local exibida
- [ ] Navegador abre automaticamente (ou abrir manualmente)
- [ ] Sem erros no console do terminal

## ✅ Testes de Funcionalidade

### 1. Health Check
```bash
curl http://localhost:3001/health
```
- [ ] Retorna `{"status":"ok","timestamp":"..."}`

### 2. Login
No navegador em `http://localhost:5173`:
- [ ] Página de login carrega corretamente
- [ ] Tema dark com acentos neon visível
- [ ] Campos de usuário e senha funcionam
- [ ] Login com admin/admin funciona
- [ ] Token é salvo no localStorage
- [ ] Redireciona para dashboard após login

### 3. Dashboard (Página Início)
- [ ] Sidebar de navegação visível à esquerda
- [ ] Cards de métricas exibidos (4 cards)
- [ ] Valores das métricas carregam (podem ser 0 inicialmente)
- [ ] Sem erros no console do navegador (F12)

### 4. Navegação
- [ ] Clicar em "Resultados" funciona
- [ ] Clicar em "Varredura" mostra página placeholder
- [ ] Clicar em "Críticos" mostra página placeholder
- [ ] Clicar em "Logs" mostra página placeholder
- [ ] Clicar em "Configurações" mostra página placeholder
- [ ] Clicar em "Enviar Scanner" mostra página placeholder
- [ ] Item ativo na sidebar é destacado

### 5. API - Criar Sessão
Obtenha o token fazendo login via curl:
```bash
curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin\"}"
```
- [ ] Retorna token e dados do usuário

Criar sessão (substitua TOKEN):
```bash
curl -X POST http://localhost:3001/api/sessions -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" -d "{\"name\":\"Teste\",\"targetPath\":\"C:\\\\test\",\"status\":\"running\"}"
```
- [ ] Retorna dados da sessão criada com ID

### 6. API - Enviar Evento (Simular Scanner)
Substitua SEU_TOKEN pelo valor do SCANNER_API_TOKEN:
```bash
curl -X POST http://localhost:3001/api/ingest/event -H "Content-Type: application/json" -H "x-scanner-token: SEU_TOKEN" -d "{\"sessionId\":\"test-session\",\"type\":\"finding\",\"data\":{\"fileName\":\"teste.exe\",\"filePath\":\"C:\\\\temp\\\\teste.exe\",\"type\":\"YARA\",\"severity\":\"HIGH\",\"hash\":\"abc123\"}}"
```
- [ ] Retorna `{"success":true}`
- [ ] Evento é salvo no banco

### 7. Página de Resultados
Após enviar alguns eventos de teste:
- [ ] Navegar para "Resultados"
- [ ] Tabela carrega com os resultados
- [ ] Colunas visíveis: Arquivo, Tipo, Severidade, Status, Data
- [ ] Badge de severidade colorido
- [ ] Clicar em uma linha abre modal
- [ ] Modal mostra detalhes completos
- [ ] Botão "Marcar como Revisado" funciona
- [ ] Filtro de severidade funciona
- [ ] Paginação funciona (se houver muitos resultados)

### 8. WebSocket
Abra DevTools (F12) → Console e execute:
```javascript
// Verificar conexão WebSocket
performance.getEntriesByType('resource').filter(r => r.name.includes('socket.io'))
```
- [ ] Mostra conexões WebSocket estabelecidas
- [ ] Sem erros de conexão no console

### 9. Banco de Dados
Verifique o arquivo:
```
server/data/scanner.db
```
- [ ] Arquivo existe
- [ ] Tamanho > 0 bytes
- [ ] Pode ser aberto com SQLite browser

### 10. Logout
- [ ] Clicar em "Sair" na sidebar
- [ ] Redireciona para tela de login
- [ ] Token removido do localStorage
- [ ] Não pode acessar páginas protegidas sem login

## ✅ Integração com Scanner C#

### Código de Teste
- [ ] MonitoringClient compilado sem erros
- [ ] Consegue criar sessão via API
- [ ] Consegue enviar eventos de progresso
- [ ] Consegue enviar findings
- [ ] Consegue enviar evento "done"
- [ ] Eventos aparecem no dashboard web

### Monitoramento em Tempo Real
- [ ] Scanner C# envia eventos
- [ ] WebSocket recebe eventos no frontend
- [ ] Dashboard atualiza em tempo real
- [ ] Sem delay perceptível

## ✅ Performance

- [ ] Dashboard carrega em < 2 segundos
- [ ] Navegação entre páginas é instantânea
- [ ] Tabela de resultados renderiza rapidamente (< 1s)
- [ ] WebSocket responde em < 100ms
- [ ] Sem memory leaks (verificar Task Manager)

## ✅ Responsividade

- [ ] Dashboard funciona em 1920x1080
- [ ] Dashboard funciona em 1366x768
- [ ] Sidebar colapsa em telas menores (se implementado)
- [ ] Tabelas têm scroll horizontal se necessário
- [ ] Modal não quebra em telas pequenas

## ✅ Segurança

- [ ] JWT expira corretamente
- [ ] Não pode acessar API sem token válido
- [ ] Scanner token é validado
- [ ] Credenciais não aparecem em logs
- [ ] CORS configurado corretamente

## ✅ Erros e Edge Cases

- [ ] Login com credenciais erradas mostra erro
- [ ] API retorna erro 401 sem autenticação
- [ ] API retorna erro 404 para rotas inexistentes
- [ ] Frontend mostra loading durante requisições
- [ ] Frontend mostra mensagem se não houver resultados
- [ ] Backend continua rodando após erro de query

## ✅ Logs e Debug

### Backend
- [ ] Logs informativos no console
- [ ] Stack traces legíveis em erros
- [ ] Sem warnings desnecessários

### Frontend
- [ ] Console sem erros React
- [ ] Sem warnings de keys faltando
- [ ] DevTools → Network mostra requisições corretas
- [ ] DevTools → Application → Local Storage tem token

## ✅ Build de Produção

### Backend
```bash
cd server
npm run build
```
- [ ] Build completa sem erros
- [ ] Pasta `dist/` criada
- [ ] Arquivos .js gerados

### Frontend
```bash
cd web
npm run build
```
- [ ] Build completa sem erros
- [ ] Pasta `dist/` criada
- [ ] index.html e assets gerados

### Execução do Build
```bash
# Backend
cd server
npm start

# Frontend
npm run preview
```
- [ ] Backend roda a partir do build
- [ ] Frontend serve o build corretamente
- [ ] Funcionalidades idênticas ao modo dev

## 📊 Resultado

Total de checks: ~80

- ✅ Todos passaram: **Sistema 100% funcional!**
- ⚠️ 1-5 falharam: Investigar e corrigir
- ❌ 6+ falharam: Revisar instalação

## 🐛 Problemas Comuns

| Problema | Solução |
|----------|---------|
| Porta em uso | `taskkill /F /IM node.exe` |
| Dependencies error | Deletar node_modules e reinstalar |
| CORS error | Verificar CORS_ORIGIN no .env |
| WebSocket não conecta | Verificar URLs no .env do frontend |
| 401 Unauthorized | Token expirado, fazer login novamente |
| Database locked | Fechar todas as conexões ao SQLite |

## 📝 Notas

- Marque cada item conforme testa
- Alguns checks podem não aplicar no ambiente de dev
- Builds de produção são opcionais para desenvolvimento
- WebSocket em produção pode requerer configuração adicional

---

✅ Checklist completo = Sistema pronto para uso!
