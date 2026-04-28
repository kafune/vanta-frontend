# Sistema de Analytics de Filtros de Pedidos

## Visão Geral

O sistema de analytics de filtros foi desenvolvido para rastrear e analisar como os administradores utilizam os filtros de pedidos no painel administrativo. Este sistema fornece insights valiosos sobre quais filtros são mais utilizados, padrões de uso e eficiência operacional.

## Arquitetura

### Banco de Dados

A tabela `filterUsageLogs` armazena todos os eventos de uso de filtros:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | VARCHAR(64) | Identificador único do log |
| `userId` | INT | ID do usuário administrativo |
| `filterType` | VARCHAR(64) | Tipo de filtro: "status", "date", "price", "sort" |
| `filterValue` | TEXT | Valores JSON do filtro aplicado |
| `resultsCount` | INT | Número de resultados retornados |
| `duration` | INT | Tempo de execução em milissegundos |
| `createdAt` | TIMESTAMP | Data/hora do evento |

### Procedimentos tRPC

O router `analytics` fornece os seguintes procedimentos:

#### `logFilterUsage`

Registra um evento de uso de filtro.

**Input:**
```typescript
{
  filterType: "status" | "date" | "price" | "sort",
  filterValue?: Record<string, any>,
  resultsCount?: number,
  duration?: number
}
```

**Output:**
```typescript
{
  success: boolean,
  logId: string
}
```

#### `getFilterStats`

Retorna estatísticas agregadas de uso de filtros.

**Input:**
```typescript
{
  dateFrom?: string,  // YYYY-MM-DD
  dateTo?: string     // YYYY-MM-DD
}
```

**Output:**
```typescript
{
  totalFilters: number,
  byType: {
    status: number,
    date: number,
    price: number,
    sort: number
  },
  avgResults: number,
  avgDuration: number,
  totalResults: number
}
```

#### `getTopFilters`

Retorna os filtros mais utilizados.

**Input:**
```typescript
{
  limit?: number,     // Padrão: 10
  dateFrom?: string,
  dateTo?: string
}
```

**Output:**
```typescript
Array<{
  filterType: string,
  filterValue: string | null,
  usageCount: number,
  avgResults: number,
  avgDuration: number
}>
```

#### `getFilterTrends`

Retorna tendências de uso ao longo do tempo.

**Input:**
```typescript
{
  dateFrom?: string,
  dateTo?: string,
  groupBy?: "day" | "week" | "month"  // Padrão: "day"
}
```

**Output:**
```typescript
Array<{
  period: string,
  status: number,
  date: number,
  price: number,
  sort: number,
  total: number
}>
```

#### `getFilterUsageByUser`

Retorna estatísticas de uso por usuário administrativo.

**Input:**
```typescript
{
  limit?: number,     // Padrão: 10
  dateFrom?: string,
  dateTo?: string
}
```

**Output:**
```typescript
Array<{
  userId: number,
  usageCount: number,
  filterTypes: string[]
}>
```

## Integração no Frontend

### Componente FilterAnalytics

O componente `FilterAnalytics` exibe um dashboard completo com:

- **Seletor de Data**: Permite filtrar dados por intervalo de datas
- **Cartões de Resumo**: Exibe métricas principais (total de filtros, média de resultados, duração média, total de resultados)
- **Gráfico de Pizza**: Distribuição de uso por tipo de filtro
- **Gráfico de Barras**: Top 10 filtros mais utilizados
- **Gráfico de Linhas**: Tendências de uso ao longo do tempo
- **Tabela de Usuários**: Top usuários por número de utilizações
- **Botão de Download**: Exporta relatório em CSV

### Logging Automático

O componente `OrderFilters` registra automaticamente cada uso de filtro através da mutação `logFilterUsage`. O tipo de filtro é detectado automaticamente com base nos campos preenchidos:

- Se há filtros de status → tipo "status"
- Se há datas → tipo "date"
- Se há faixa de preço → tipo "price"
- Se há ordenação → tipo "sort"

## Acesso ao Dashboard

O dashboard de analytics está disponível no painel administrativo através da aba "Análise". Apenas usuários com role "admin" podem acessar.

**URL:** `/admin` → Aba "Análise"

## Casos de Uso

### 1. Identificar Filtros Mais Utilizados

Use `getTopFilters` para descobrir quais filtros os administradores mais utilizam. Isso pode informar decisões sobre quais filtros otimizar ou destacar.

### 2. Analisar Eficiência de Filtros

Compare `avgResults` entre diferentes tipos de filtros para entender qual tipo de filtro retorna mais resultados úteis em média.

### 3. Monitorar Padrões de Uso

Use `getFilterTrends` para identificar padrões temporais, como períodos de pico de uso ou tendências sazonais.

### 4. Avaliar Desempenho de Usuários

Use `getFilterUsageByUser` para identificar usuários que mais utilizam filtros avançados, o que pode indicar expertise ou necessidade de treinamento.

### 5. Otimizar Interface

Dados de `resultsCount` e `duration` podem informar otimizações de UX, como sugerir filtros mais eficientes ou reorganizar a interface.

## Testes

O sistema inclui 9 testes vitest que cobrem:

- Logging de eventos de filtro
- Cálculo de estatísticas
- Identificação de filtros mais utilizados
- Análise de tendências
- Filtragem por data
- Cálculo correto de breakdowns
- Respeitando limites de resultados

Execute os testes com:

```bash
pnpm test server/routers/analytics.test.ts
```

## Segurança

- Apenas usuários com role "admin" podem acessar os procedimentos de analytics
- Todos os dados são filtrados por data para evitar sobrecarga
- Os dados são agregados para proteger a privacidade individual

## Performance

- As queries são otimizadas com índices no banco de dados
- Os dados são agregados em memória para cálculos rápidos
- Recomenda-se limpar logs antigos periodicamente (> 90 dias)

## Próximas Melhorias

- Exportação de relatórios em PDF
- Alertas automáticos para padrões anormais
- Integração com ferramentas de BI
- Análise preditiva de uso
- Comparação de períodos

## Suporte

Para dúvidas ou relatórios de bugs, entre em contato com a equipe de desenvolvimento.
