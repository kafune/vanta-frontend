# Sistema de Cashback - VANTA

## Visão Geral

O sistema de cashback permite que usuários autenticados ganhem **10% de crédito** em cada compra, que pode ser utilizado como desconto em compras futuras.

## Arquitetura

### Banco de Dados

**Tabela `cashbackBalance`**
- Rastreia o saldo disponível de cashback por usuário
- Campos: `userId`, `totalEarned`, `totalSpent`, `availableBalance`
- Relacionamento 1:1 com usuário (cada usuário tem um saldo)

**Tabela `cashbackTransactions`**
- Auditoria de todas as transações de cashback
- Tipos: `earned` (ganho em compra) ou `spent` (usado como desconto)
- Rastreabilidade completa de origem e uso

### Backend (tRPC Procedures)

**`cashback.getBalance`** (protectedProcedure)
- Retorna saldo disponível do usuário autenticado
- Inclui: `availableBalance`, `totalEarned`, `totalSpent`

**`cashback.applyCashback`** (protectedProcedure)
- Valida se o usuário tem saldo suficiente
- Calcula desconto máximo (não pode exceder o total da compra)
- Retorna: `discountAmount`, `newBalance`

**`cashback.recordEarned`** (protectedProcedure)
- Registra cashback ganho após compra bem-sucedida
- Cálculo: 10% do valor total da compra
- Atualiza saldo e cria transação de auditoria

**`cashback.recordSpent`** (protectedProcedure)
- Registra cashback gasto como desconto
- Valida saldo suficiente
- Atualiza saldo e cria transação de auditoria

**`cashback.getTransactions`** (protectedProcedure)
- Retorna histórico de transações do usuário
- Ordenado por data de criação

### Frontend

**CartDrawer Integration**
- Exibe saldo disponível de cashback
- Checkbox para aplicar cashback na compra
- Mostra desconto de cashback na seção de totais
- Registra cashback ganho após checkout bem-sucedido

**Fluxo Completo**
1. Usuário visualiza carrinho
2. Se autenticado e tem cashback disponível, vê opção de usar
3. Seleciona checkbox "Usar cashback nesta compra"
4. Desconto é aplicado ao total
5. Após checkout bem-sucedido:
   - Cashback gasto é registrado
   - Novo cashback é ganho (10% do total final)
   - Saldo é atualizado

## Cálculos

### Ganho de Cashback
```
cashbackEarned = orderTotal * 0.10
```

### Aplicação de Cashback
```
cashbackDiscount = min(availableBalance, orderTotal)
finalTotal = orderTotal - cashbackDiscount
```

### Atualização de Saldo
```
availableBalance = totalEarned - totalSpent
```

## Exemplos de Uso

### Cenário 1: Primeira Compra
1. Usuário compra por €100
2. Ganha €10 em cashback
3. Saldo: €10 disponível

### Cenário 2: Segunda Compra com Cashback
1. Usuário tem €10 em cashback
2. Compra por €80
3. Aplica €10 de cashback
4. Total pago: €70
5. Ganha €7 em cashback (10% de €70)
6. Novo saldo: €7 disponível

### Cenário 3: Cashback Parcial
1. Usuário tem €50 em cashback
2. Compra por €30
3. Aplica €30 de cashback (máximo do total)
4. Total pago: €0
5. Ganha €0 em cashback (10% de €0)
6. Novo saldo: €20 disponível

## Testes

Todos os testes estão em `server/routers/cashback.test.ts`:

```bash
pnpm test
```

Testes cobrem:
- Cálculo correto de 10% de cashback
- Criação de saldo para novo usuário
- Registro de transações earned e spent
- Validação de saldo insuficiente
- Cálculo de saldo após múltiplas transações
- Histórico de transações

## Segurança

- ✅ Validação 100% server-side
- ✅ Requer autenticação para usar cashback
- ✅ Rastreamento imutável de todas as transações
- ✅ Saldo é recalculado a cada operação
- ✅ Prevenção de gasto superior ao disponível

## Fluxo de Integração

1. **Usuário faz login** → Sistema cria saldo de cashback se não existir
2. **Usuário adiciona itens ao carrinho** → Pode ver saldo disponível
3. **Usuário aplica cashback** → Desconto é calculado e exibido
4. **Checkout bem-sucedido** → Cashback é registrado (gasto + ganho)
5. **Próxima compra** → Novo saldo está disponível

## Próximas Melhorias

- [ ] Expiração de cashback (ex: 12 meses)
- [ ] Limites de cashback por transação
- [ ] Programa de cashback escalonado (ex: 5% para user, 10% para VIP)
- [ ] Conversão de cashback em vouchers
- [ ] Integração com programa de referência
