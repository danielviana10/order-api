# 🧾 Order API

API de gerenciamento de pedidos construída com **NestJS**, utilizando arquitetura modular, banco de dados relacional com **PostgreSQL + Prisma**, processamento assíncrono com **BullMQ + Redis** e simulação de fluxo de pagamentos com **webhooks e idempotência**.

---

## Tecnologias utilizadas

- [NestJS](https://nestjs.com/)
- [Prisma ORM](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)
- [BullMQ](https://docs.bullmq.io/)
- JWT Authentication
- bcrypt
- TypeScript

---

## Funcionalidades

### Usuários
- Criar usuário
- Buscar usuários (findAll / findOne)
- Atualizar usuário
- Soft delete (remoção lógica)
- Hash de senha com bcrypt

---

### Pedidos (Orders)
- Criar pedidos
- Idempotência via `idempotency-key`
- Processamento assíncrono com fila (BullMQ)
- Simulação de pagamento externo
- Atualização de status (PENDING → PROCESSING → COMPLETED/FAILED)
- Soft delete

---

### Sistema de Pagamento (simulado)
- Integração com worker assíncrono
- Geração de `externalId`
- Webhook de retorno de pagamento
- Atualização de status baseada no gateway
- Proteção contra duplicidade (idempotência)

---

### Filas (Queue System)
- Processamento de pedidos em background
- Retry automático com backoff exponencial
- Tratamento de falhas
- Logging de jobs

---

### Autenticação
- Login com JWT
- Refresh token armazenado no banco
- Proteção de rotas com Guards

---

### Cache (Redis)
- Invalidação de cache após alterações
- Uso opcional para performance em listagens

---

## Arquitetura

O projeto segue uma arquitetura modular:


src/
├── auth/
├── users/
├── orders/
│ ├── processors/
│ ├── webhooks/
│ ├── dto/
│ └── utils/
├── infra/
│ ├── database (Prisma)
│ └── queue (BullMQ)
├── common/
│ ├── filters
│ ├── interceptors
│ └── pipes


---

## Fluxo de Pedido

1. Usuário cria um pedido
2. API registra pedido como `PENDING`
3. Job é enviado para fila (BullMQ)
4. Worker processa pedido
5. Sistema simula gateway de pagamento
6. Gateway chama webhook
7. Status do pedido é atualizado automaticamente

---

## Idempotência

Para evitar duplicidade de pedidos:

- Cada request pode enviar `Idempotency-Key`
- O sistema verifica se o pedido já existe antes de criar um novo
- Garante segurança em retries e falhas de rede

---

## Webhook

Endpoint responsável por receber eventos do “gateway de pagamento”:


POST /api/webhooks/payment


Responsável por:
- Validar pagamento
- Atualizar status do pedido
- Garantir idempotência (não processar duplicado)

---

## Testes

- Jest configurado
- Testes unitários de services
- Estrutura preparada para E2E

---

## Como rodar o projeto

```bash
# instalar dependências
npm install

# subir banco
docker-compose up -d

# rodar migrations
npx prisma migrate dev

# iniciar aplicação
npm run start:dev
```

Variáveis de ambiente
DATABASE_URL=
JWT_SECRET=
REDIS_HOST=
REDIS_PORT=
PORT=3000

Próximos passos
- Paginação (cursor-based)
- Observabilidade (logs estruturados + tracing)
- Rate limiting
- Testes E2E completos
- Integração com gateway real de pagamento

Autor

Desenvolvido por Daniel Viana

Projeto focado em backend, arquitetura e sistemas escaláveis.
