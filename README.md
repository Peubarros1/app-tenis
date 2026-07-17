# Tennis Platform — Recife

Plataforma web para jogadores de tênis em Recife: encontrar quadras (públicas e privadas), organizar partidas/peladas e, quando possível, reservar horários.

## Stack

- **Next.js 16** (App Router) + **TypeScript** — full-stack (Route Handlers/Server Actions, sem backend separado)
- **PostgreSQL + PostGIS** (busca geoespacial) via **Prisma ORM**
- **Redis** — cache, filas e pub/sub do chat de partidas
- **NextAuth.js (Auth.js v5)** — autenticação (e-mail/senha via Credentials + Google opcional)
- **Tailwind CSS**
- **Google Maps JavaScript API** — mapa de quadras (etapa 5)

## Arquitetura

O código em `src/` segue uma separação inspirada em Clean Architecture, adaptada a um projeto Next.js full-stack:

```
src/
├── app/                        # Rotas do Next.js (App Router), páginas e Route Handlers
├── components/                  # Componentes de UI compartilhados (Server/Client Components)
├── domain/
│   ├── entities/                # Entidades e regras de domínio (sem dependências externas)
│   ├── repositories/             # Interfaces de repositório (contratos)
│   └── errors/                   # Erros de domínio
├── application/
│   └── use-cases/                # Casos de uso (orquestram entidades + repositórios)
├── infrastructure/
│   ├── persistence/prisma/       # Implementações Prisma dos repositórios
│   └── services/                 # Integrações externas (mapas, e-mail, push)
├── lib/
│   ├── auth.ts                   # Config completa do NextAuth (Node runtime: adapter, providers)
│   ├── auth.config.ts            # Config compartilhada, edge-safe (sem Prisma/bcrypt)
│   ├── auth-edge.ts              # Instância do NextAuth usada só pelo proxy.ts (Edge Runtime)
│   └── validation/                # Schemas Zod compartilhados
├── proxy.ts                      # Proteção de rotas autenticadas (antigo "middleware")
└── generated/prisma/              # Cliente Prisma gerado (não versionado)
```

Camadas superiores (`app`) dependem de `application`, que depende de `domain`; `infrastructure` implementa os contratos definidos em `domain/repositories`. Isso mantém a lógica de negócio testável e independente do framework.

## Banco de dados

Schema completo em [`prisma/schema.prisma`](prisma/schema.prisma). Diagrama ER e decisões de modelagem em [`docs/er-diagram.md`](docs/er-diagram.md).

## Desenvolvimento local

Pré-requisitos: Node.js 22+, Docker.

```bash
# 1. Subir Postgres (PostGIS) e Redis
npm run docker:up

# 2. Instalar dependências (gera o Prisma Client automaticamente)
npm install

# 3. Copiar variáveis de ambiente (gere um AUTH_SECRET com: openssl rand -base64 32)
cp .env.example .env

# 4. Rodar migrations
npm run prisma:migrate

# 5. Subir o servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Scripts

| Script                              | Descrição                            |
| ----------------------------------- | ------------------------------------ |
| `npm run dev`                       | Servidor de desenvolvimento          |
| `npm run build`                     | Build de produção                    |
| `npm run lint`                      | ESLint                               |
| `npm run typecheck`                 | Checagem de tipos (`tsc --noEmit`)   |
| `npm run format` / `format:check`   | Prettier                             |
| `npm run docker:up` / `docker:down` | Sobe/derruba Postgres e Redis locais |
| `npm run prisma:migrate`            | Aplica migrations do Prisma          |
| `npm run prisma:generate`           | Gera o Prisma Client                 |

## Roadmap de etapas

1. ✅ Setup do projeto
2. ✅ Modelagem do banco de dados
3. ✅ Autenticação (NextAuth)
4. Perfil do jogador
5. Quadras (mapa, busca, filtros)
6. Reservas (pública oficial / pública sem sistema / privada)
7. Partidas / peladas
8. Chat em tempo real
9. Social (amigos, convites, notificações)
10. Avaliações e estatísticas
