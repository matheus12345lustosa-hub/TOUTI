# Fluxo de Telas (User Flows) - Adega dos Cometas

## 1. Fluxo Principal: Realizar Venda (PDV)
Este é o fluxo mais crítico, focado em **Velocidade**.

```mermaid
sequenceDiagram
    actor Operador
    participant UI as Interface PDV
    participant API as Backend Service
    participant Stock as Estoque
    participant DB as Banco de Dados

    Operador->>UI: F2 (Foca Busca/Leitor)
    Operador->>UI: Scaneia Produto (Barcode)
    UI->>API: GET /products/{ean}
    API-->>UI: Retorna Produto + Preço (Atacado/Varejo)
    UI->>UI: Adiciona ao Carrinho (Som com feedback visual)
    
    Operador->>UI: (Opcional) Identifica Cliente (CPF/Nome)
    
    Operador->>UI: F10 (Finalizar)
    UI->>UI: Abre Modal Pagamento
    Operador->>UI: Seleciona Forma (PIX/Dinheiro)
    Operador->>UI: Enter (Confirmar)
    
    UI->>API: POST /sales (Checkout)
    API->>Stock: Valida e Baixa Estoque
    API->>DB: Salva Venda
    API-->>UI: Sucesso + URL NFC-e
    
    UI->>Operador: Imprime Comprovante
    UI->>UI: Limpa Tela (Pronto para próxima)
```

## 2. Fluxo: Abertura e Fechamento de Caixa
Essencial para o controle financeiro.

```mermaid
graph TD
    Start((Início)) --> Login[Login Operador];
    Login --> Verify{Caixa Aberto?};
    Verify -- Não --> OpenScreen[Tela Abertura de Caixa];
    OpenScreen --> InputMoney[Informar Fundo de Troco];
    InputMoney --> ConfirmOpen[Confirmar Abertura];
    ConfirmOpen --> POS[Tela Principal PDV];
    
    Verify -- Sim --> POS;
    
    POS --> CloseButton[Botão Fechar Caixa];
    CloseButton --> CountScreen[Tela de Sangria/Contagem];
    CountScreen --> InputCount[Informar Valores em Gaveta];
    InputCount --> Diff{Diferença?};
    Diff -- Sim --> Alert[Alerta de Quebra de Caixa];
    Diff -- Não --> Report[Relatório de Fechamento];
    Report --> End((Fim do Turno));
```
