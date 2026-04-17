# Testes E2E Manual — Sistema de Cupom e Cashback

Este documento descreve os testes manuais que devem ser executados para validar o sistema de cupom OTTO10 e cashback.

## Pré-requisitos

- Estar autenticado como admin
- Cupom OTTO10 criado (10% de desconto)
- Acesso ao Admin Dashboard

## Teste 1: Validação do Cupom OTTO10

### Objetivo
Verificar que o cupom OTTO10 existe, é válido e oferece 10% de desconto.

### Passos
1. Acesse a loja: https://3000-is51q8d8mvzexpw9gifuc-1179566a.us2.manus.computer
2. Faça login com sua conta admin
3. Navegue para o carrinho (clique no ícone de sacola)
4. Adicione um produto ao carrinho (ex: €100)
5. Abra o CartDrawer (clique no ícone de sacola novamente)
6. Na seção de cupom, insira "OTTO10"
7. Clique em "Aplicar Cupom"

### Resultado Esperado
- ✅ Cupom é aceito
- ✅ Desconto de 10% é aplicado (€100 → €90)
- ✅ Mensagem de sucesso aparece

### Resultado Observado
_[Preencher após executar]_

---

## Teste 2: Bloqueio de Reutilização de Cupom

### Objetivo
Verificar que um usuário não pode usar o mesmo cupom duas vezes.

### Passos
1. Após aplicar o cupom OTTO10 com sucesso (Teste 1)
2. Clique em "Finalizar Compra"
3. Confirme o pedido
4. Retorne à loja
5. Adicione outro produto ao carrinho
6. Abra o CartDrawer
7. Tente aplicar "OTTO10" novamente

### Resultado Esperado
- ✅ Cupom é rejeitado
- ✅ Mensagem de erro: "Você já usou este cupom"
- ✅ Desconto não é aplicado

### Resultado Observado
_[Preencher após executar]_

---

## Teste 3: Geração de Cashback

### Objetivo
Verificar que 10% de cashback é gerado após uma compra.

### Passos
1. Acesse sua página de perfil (clique no ícone de usuário no navbar)
2. Anote o "Saldo Disponível" atual
3. Retorne à loja
4. Adicione um produto ao carrinho (ex: €50)
5. Abra o CartDrawer
6. Clique em "Finalizar Compra"
7. Confirme o pedido
8. Retorne à página de perfil

### Resultado Esperado
- ✅ "Saldo Disponível" aumentou em €5 (10% de €50)
- ✅ "Total Ganho" aumentou em €5
- ✅ Uma nova transação "Ganho" aparece no histórico

### Resultado Observado
_[Preencher após executar]_

---

## Teste 4: Uso de Cashback em Compra

### Objetivo
Verificar que cashback pode ser aplicado como desconto em uma nova compra.

### Passos
1. Acesse sua página de perfil
2. Anote o "Saldo Disponível" (ex: €5)
3. Retorne à loja
4. Adicione um produto ao carrinho (ex: €20)
5. Abra o CartDrawer
6. Marque a checkbox "Usar Cashback"
7. Verifique que o desconto é aplicado (€20 - €5 = €15)
8. Clique em "Finalizar Compra"
9. Confirme o pedido
10. Retorne à página de perfil

### Resultado Esperado
- ✅ Cashback foi deduzido do total (€20 → €15)
- ✅ "Saldo Disponível" agora é €0
- ✅ "Total Gasto" aumentou em €5
- ✅ Uma nova transação "Gasto" aparece no histórico
- ✅ 10% de cashback foi gerado da compra de €15 (€1.50)

### Resultado Observado
_[Preencher após executar]_

---

## Teste 5: Filtros de Histórico de Transações

### Objetivo
Verificar que os filtros de histórico funcionam corretamente.

### Passos
1. Acesse sua página de perfil
2. Na seção "Histórico de Transações", clique em "Ganho"
3. Verifique que apenas transações de ganho aparecem
4. Clique em "Gasto"
5. Verifique que apenas transações de gasto aparecem
6. Clique em "Todas"
7. Verifique que todas as transações aparecem

### Resultado Esperado
- ✅ Filtro "Ganho" mostra apenas transações com ícone verde (📈)
- ✅ Filtro "Gasto" mostra apenas transações com ícone azul (📉)
- ✅ Filtro "Todas" mostra todas as transações

### Resultado Observado
_[Preencher após executar]_

---

## Teste 6: Responsividade da Página de Perfil

### Objetivo
Verificar que a página de perfil é responsiva em diferentes tamanhos de tela.

### Passos
1. Acesse sua página de perfil em desktop (largura > 1024px)
2. Verifique layout com 3 colunas de informações
3. Redimensione o navegador para tablet (768px - 1024px)
4. Verifique layout com 2 colunas
5. Redimensione para mobile (< 768px)
6. Verifique layout com 1 coluna

### Resultado Esperado
- ✅ Desktop: 3 colunas (info + 3 cards de cashback)
- ✅ Tablet: 2 colunas
- ✅ Mobile: 1 coluna (stack vertical)
- ✅ Todos os elementos são legíveis e acessíveis

### Resultado Observado
_[Preencher após executar]_

---

## Resumo de Testes

| Teste | Status | Observações |
|-------|--------|-------------|
| 1. Validação do Cupom OTTO10 | ⬜ | |
| 2. Bloqueio de Reutilização | ⬜ | |
| 3. Geração de Cashback | ⬜ | |
| 4. Uso de Cashback | ⬜ | |
| 5. Filtros de Histórico | ⬜ | |
| 6. Responsividade | ⬜ | |

**Legenda:**
- ⬜ Não executado
- ✅ Passou
- ❌ Falhou

---

## Notas

- Todos os testes devem ser executados em sequência
- Se algum teste falhar, documente o erro e a ação esperada
- Após completar todos os testes, atualize este documento com os resultados
