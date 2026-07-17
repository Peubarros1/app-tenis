# Diagrama ER — Etapa 2

Modelo de dados completo em `prisma/schema.prisma`. Diagrama abaixo (renderiza no GitHub e em qualquer visualizador Mermaid).

```mermaid
erDiagram
    USER ||--o{ ACCOUNT : "possui"
    USER ||--o{ SESSION : "possui"
    USER ||--o{ FAVORITE_COURT : "favorita"
    USER ||--o{ COURT_REVIEW : "avalia"
    USER ||--o{ COURT : "é dono de (privada)"
    USER ||--o{ BOOKING : "reserva"
    USER ||--o{ MATCH : "organiza"
    USER ||--o{ MATCH_PARTICIPANT : "participa"
    USER ||--o{ MATCH_MESSAGE : "envia"
    USER ||--o{ FRIENDSHIP : "solicita/recebe"
    USER ||--o{ NOTIFICATION : "recebe"
    USER ||--o{ PLAYER_RATING : "avalia/é avaliado"

    COURT ||--o{ COURT_PHOTO : "tem"
    COURT ||--o{ COURT_OPENING_HOUR : "tem"
    COURT ||--o{ COURT_REVIEW : "recebe"
    COURT ||--o{ FAVORITE_COURT : "é favoritada"
    COURT ||--o{ BOOKING : "recebe"
    COURT ||--o{ MATCH : "sedia"

    MATCH ||--o{ MATCH_PARTICIPANT : "tem"
    MATCH ||--o{ MATCH_MESSAGE : "tem (chat)"
    MATCH ||--o{ PLAYER_RATING : "gera avaliações pós-jogo"

    USER {
        string id PK
        string email UK
        string name
        SkillLevel skillLevel
        string neighborhood
        float latitude
        float longitude
    }

    COURT {
        string id PK
        string name
        CourtType courtType
        BookingMode bookingMode
        SurfaceType surfaceType
        boolean isLighted
        string neighborhood
        float latitude
        float longitude
        geography location
        int hourlyPriceCents
        string ownerId FK
    }

    COURT_PHOTO {
        string id PK
        string courtId FK
        string url
        int position
    }

    COURT_OPENING_HOUR {
        string id PK
        string courtId FK
        int dayOfWeek
        string opensAt
        string closesAt
    }

    COURT_REVIEW {
        string id PK
        string courtId FK
        string userId FK
        int rating
        string comment
    }

    FAVORITE_COURT {
        string userId PK,FK
        string courtId PK,FK
    }

    BOOKING {
        string id PK
        string courtId FK
        string userId FK
        datetime startTime
        datetime endTime
        BookingStatus status
        string externalReference
    }

    MATCH {
        string id PK
        string organizerId FK
        string courtId FK
        datetime scheduledAt
        int maxPlayers
        MatchStatus status
        MatchVisibility visibility
    }

    MATCH_PARTICIPANT {
        string id PK
        string matchId FK
        string userId FK
        ParticipantStatus status
    }

    MATCH_MESSAGE {
        string id PK
        string matchId FK
        string userId FK
        string content
    }

    FRIENDSHIP {
        string id PK
        string requesterId FK
        string addresseeId FK
        FriendshipStatus status
    }

    PLAYER_RATING {
        string id PK
        string matchId FK
        string raterId FK
        string ratedUserId FK
        int rating
    }

    NOTIFICATION {
        string id PK
        string userId FK
        NotificationType type
        json payload
        datetime readAt
    }
```

## Decisões de modelagem

**Geolocalização híbrida (`latitude`/`longitude` + `location` PostGIS).**
Guardamos `latitude`/`longitude` como `Float` simples — o Prisma Client lê/escreve neles normalmente (mapa, formulários). A coluna `location` (`geography(Point,4326)`) é mantida em sincronia automaticamente por um trigger de banco (`sync_court_location`) e serve só para buscas de proximidade eficientes (`ST_DWithin`, `ORDER BY location <-> ponto`) via SQL raw na camada de infraestrutura, com índice GIST. Vantagem: Prisma Client continua 100% tipado para o CRUD comum, e a busca geoespacial fica isolada na camada `infrastructure` sem vazar SQL para o resto da aplicação. Desvantagem: qualquer novo caminho que grave `Court` direto no banco (fora do trigger) precisa lembrar de popular lat/lng — mitigado porque o trigger dispara em qualquer INSERT/UPDATE dessas colunas, independente da origem.

**3 tipos de quadra, resolvidos por dois campos ortogonais.**
`courtType` (`PUBLIC_OFFICIAL` / `PUBLIC_UNOFFICIAL` / `PRIVATE`) descreve a natureza da quadra; `bookingMode` (`OFFICIAL_INTEGRATION` / `INTERNAL` / `INFORMATIONAL`) descreve como a _reserva_ é tratada. Separar os dois evita um enum combinatório e permite, por exemplo, uma quadra pública ganhar integração oficial futuramente sem mudar seu `courtType`.

**`Booking` só existe quando faz sentido reservar.**
Quadras `INFORMATIONAL` não geram linhas em `Booking` — a UI mostra `bookingInstructions`/`officialBookingUrl` em vez de um calendário. Isso evita modelar reservas "falsas" para quadras sem agenda real.

**Constraint de não sobreposição (`Booking_no_overlap`).**
Um `EXCLUDE USING gist` garante, no nível do banco, que a mesma quadra não tenha duas reservas `PENDING`/`CONFIRMED` com horários sobrepostos — evita condições de corrida que uma checagem só na aplicação não garantiria sob concorrência.

**`PlayerRating` é sobre o jogador, `CourtReview` é sobre a quadra.**
São conceitos diferentes (avaliação entre jogadores após uma partida vs. avaliação de uma quadra) e por isso vivem em tabelas separadas, cada uma com sua própria unicidade (`@@unique`) evitando avaliações duplicadas.

**Tabelas de auth (`Account`, `Session`, `VerificationToken`) já seguem o schema esperado pelo adapter Prisma do NextAuth**, antecipando a Etapa 3 sem exigir migração de dados depois.
