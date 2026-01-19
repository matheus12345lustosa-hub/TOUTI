# Arquitetura do Sistema - Adega dos Cometas

## 1. Visão Geral da Arquitetura (Clean Architecture / Modular)

O sistema segue uma arquitetura **Modular Monolith**. Isso permite que o sistema seja desenvolvido como uma única unidade implantável (simplicidade), mas com limites de módulo estritos (manutenibilidade), facilitando uma futura extração para Microserviços se necessário.

### Diagrama de Contexto (C4 Level 1)

```mermaid
graph TD
    User((Operador/Gerente)) -->|HTTPS| Frontend[Frontend Next.js (PDV Web)];
    Frontend -->|API REST/TRPC| Backend[Backend API Code];
    Backend -->|ORM| DB[(PostgreSQL)];
    Backend -->|Integração| SEFAZ[SEFAZ (NFC-e)];
    Frontend -->|USB/Bluetooth| Hardware[Hardware (Impressora, Leitor, Balança)];
    Backend -->|Integração| TEF[Gateway de Pagamento / TEF];
```

## 2. Diagrama de Módulos e Dependências

A regra de ouro é: **Dependências apontam para o centro (Domínio) ou para módulos utilitários.** Módulos de *Feature* (Vendas) dependem de *Core* (Catálogo, Identidade), mas *Core* não deve depender de *Feature*.

```mermaid
graph TD
    subgraph "Core Domain"
        Identity[Identidade & Acesso]
        Catalog[Catálogo de Produtos]
        Settings[Configurações Loja]
    end

    subgraph "Operational Domain"
        Stock[Estoque & Vasilhames]
        Customers[Clientes (CRM)]
    end

    subgraph "Feature Domain"
        Sales[Vendas / Frente de Caixa]
        Finance[Financeiro]
        Fiscal[Fiscal / NFC-e]
    end

    %% Relacionamentos
    Sales --> Catalog
    Sales --> Identity
    Sales --> Customers
    Sales --> Stock
    Sales --> Fiscal
    Sales --> Settings

    Stock --> Catalog
    Fiscal --> Sales
    Finance --> Sales
```

## 3. Estrutura de Pastas Sugerida (Feature-Based)

Esta estrutura garante que cada "Módulo" tenha tudo que precisa para funcionar (Componentes, Hooks, Lógicas de Backend), facilitando a manutenção.

```
/src
  /app                  # Next.js App Router (Roteamento)
    /(auth)             # Rotas de Autenticação
    /(dashboard)        # Rotas Admin
    /pos                # Rota exclusiva do PDV (Frente de Caixa)
    /api                # API Endpoints
  
  /modules              # Módulos de Negócio (O CORAÇÃO DO SISTEMA)
    /catalog
      /components       # UI específica (ProductCard, etc)
      /models           # Types/Interfaces
      /services         # Lógica de Negócio (ProductService)
      /hooks            # React Hooks
    /sales
      /components       # (PosScreen, CartItem, PaymentModal)
      /services         # (CartService, CheckoutTransaction)
    /stock
      /components
      /services
    /fiscal
    /identity
  
  /shared               # Código compartilhado entre módulos
    /ui                 # Componentes Base (Botões, Inputs - Design System)
    /lib                # Utilitários (DB Connection, Formatters)
    /hooks              # Hooks Genéricos (useClickOutside)
    
  /prisma               # Definição do Banco de Dados
```

## 4. Tecnologias Principais

| Camada | Tecnologia | Justificativa |
| :--- | :--- | :--- |
| **Frontend** | React (Next.js) | Performance, SSR, Ecossistema rico. |
| **Estilização** | Tailwind CSS + Shadcn/UI | Beleza, Rapidez, Acessibilidade. |
| **Backend** | Next.js API Routes | Simplicidade de deploy, Type-safety compartilhado. |
| **Banco de Dados** | PostgreSQL | Robustez, Relacional, Suporte a JSONB. |
| **ORM** | Prisma | Produtividade, Migrations seguras. |
| **State** | Zustand | Gerenciamento de estado do carrinho (leve e rápido). |
