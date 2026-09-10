# Esquema relacional — ArenaGo

Este diagrama representa o modelo definido em `schema.prisma`. Os campos marcados
como `FK` são as chaves estrangeiras que mantêm cada relação.

```mermaid
erDiagram
    Usuario {
        String id PK
        String nome
        String email UK
        String senha
        String telefone
        String cpf UK
        String endereco
        Perfil perfil
        Boolean ativo
        DateTime dataCriacao
        DateTime dataAtualizacao
    }

    Quadra {
        String id PK
        String nome
        TipoQuadra tipo
        String descricao
        String tamanho
        Int capacidade
        Decimal precoHora
        String horarioInicio
        String horarioFim
        Int durationPadraoMinutos
        Boolean ativa
        DateTime dataCriacao
        DateTime dataAtualizacao
    }

    Reserva {
        String id PK
        String numeroReserva UK
        String usuarioId FK
        String quadraId FK
        DateTime dataReserva
        String horarioInicio
        String horarioFim
        StatusReserva status
        String motivoCancelamento
        String canceladaPorId FK
        Decimal valorAluguel
        DateTime dataCriacao
        DateTime dataAtualizacao
    }

    Comanda {
        String id PK
        String numeroComanda UK
        String reservaId FK,UK
        String usuarioId FK
        StatusComanda status
        Decimal subtotalConsumos
        Decimal valorAluguel
        Decimal total
        String formaPagamento
        Decimal valorPago
        Decimal troco
        String observacoes
        DateTime dataFechamento
        DateTime dataPagamento
        DateTime dataCriacao
        DateTime dataAtualizacao
    }

    ItemComanda {
        String id PK
        String comandaId FK
        String produtoId FK
        Int quantidade
        Decimal precoUnitario
        Decimal subtotal
        DateTime dataCriacao
    }

    Produto {
        String id PK
        String nome
        String descricao
        String categoriaId FK
        Decimal preco
        Int estoqueAtual
        Int estoqueMinimo
        Boolean ativo
        DateTime dataCriacao
        DateTime dataAtualizacao
    }

    Categoria {
        String id PK
        String nome UK
        String descricao
        Boolean ativa
        DateTime dataCriacao
    }

    Bloqueio {
        String id PK
        String quadraId FK
        DateTime dataBloqueio
        String horarioInicio
        String horarioFim
        MotivoBloqueio motivo
        String criadoPorId FK
        DateTime dataCriacao
    }

    Historico {
        String id PK
        String usuarioId FK
        TipoAcao tipoAcao
        String entidade
        String entidadeId
        String descricao
        String dadosAnteriores
        String dadosNovos
        String ipAddress
        DateTime dataAcao
    }

    Usuario ||--o{ Reserva : realiza
    Usuario o|--o{ Reserva : cancela
    Quadra ||--o{ Reserva : recebe
    Reserva ||--o| Comanda : gera
    Usuario ||--o{ Comanda : possui
    Comanda ||--o{ ItemComanda : contem
    Produto ||--o{ ItemComanda : compoe
    Categoria ||--o{ Produto : classifica
    Quadra ||--o{ Bloqueio : recebe
    Usuario ||--o{ Bloqueio : cria
    Usuario ||--o{ Historico : registra
```

## Cardinalidades principais

- Uma reserva pertence a exatamente um usuário e uma quadra.
- Uma reserva pode ter, no máximo, uma comanda; cada comanda pertence a uma
  única reserva. A chave estrangeira fica somente em `Comanda.reservaId`.
- Uma reserva pode ter sido cancelada por nenhum ou por um usuário. Um usuário
  pode cancelar várias reservas.
- Uma comanda pode possuir vários itens; cada item aponta para um único produto.
- Uma categoria possui vários produtos, e cada produto pertence a uma categoria.
- Usuários podem criar vários bloqueios e registros de histórico.
