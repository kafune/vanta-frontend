/**
 * FilterAnalytics Component
 * Dashboard showing filter usage statistics and trends
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Download, RefreshCw } from "lucide-react";

export function FilterAnalytics() {
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // Queries
  const filterStats = trpc.analytics.getFilterStats.useQuery({ dateFrom, dateTo });
  const topFilters = trpc.analytics.getTopFilters.useQuery({ limit: 10, dateFrom, dateTo });
  const filterTrends = trpc.analytics.getFilterTrends.useQuery({ dateFrom, dateTo, groupBy: "day" });
  const filterByUser = trpc.analytics.getFilterUsageByUser.useQuery({ limit: 10, dateFrom, dateTo });

  const handleRefresh = () => {
    filterStats.refetch();
    topFilters.refetch();
    filterTrends.refetch();
    filterByUser.refetch();
  };

  const handleDownloadReport = () => {
    // Generate CSV report
    const stats = filterStats.data;
    if (!stats) return;

    const csvContent = `Filter Usage Report
Generated: ${new Date().toLocaleString()}

SUMMARY STATISTICS
Total Filters Used: ${stats.totalFilters}
Average Results per Filter: ${stats.avgResults}
Average Duration (ms): ${stats.avgDuration}
Total Results Returned: ${stats.totalResults}

BREAKDOWN BY TYPE
Status Filters: ${stats.byType.status}
Date Filters: ${stats.byType.date}
Price Filters: ${stats.byType.price}
Sort Filters: ${stats.byType.sort}

TOP USED FILTERS
${topFilters.data?.map((f) => `${f.filterType}: ${f.usageCount} times (avg ${f.avgResults} results)`).join("\n")}
`;

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(csvContent));
    element.setAttribute("download", `filter-usage-report-${new Date().toISOString().split("T")[0]}.csv`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const COLORS = ["#4ECDC4", "#FF6B6B", "#FFE66D", "#95E1D3", "#C7CEEA"];

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
        <CardHeader>
          <CardTitle className="text-[#EFEFEF]">Filtrar por Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div>
              <label className="text-xs text-[rgba(239,239,239,0.5)] mb-1 block">Data Inicial</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#EFEFEF]"
              />
            </div>
            <div>
              <label className="text-xs text-[rgba(239,239,239,0.5)] mb-1 block">Data Final</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#EFEFEF]"
              />
            </div>
            <Button onClick={handleRefresh} variant="outline" className="border-[rgba(255,255,255,0.1)]">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button onClick={handleDownloadReport} variant="outline" className="border-[rgba(255,255,255,0.1)]">
              <Download className="w-4 h-4 mr-2" />
              Baixar Relatório
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      {filterStats.data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-[#4ECDC4]">{filterStats.data.totalFilters}</div>
              <p className="text-xs text-[rgba(239,239,239,0.5)] mt-2">Total de Filtros</p>
            </CardContent>
          </Card>
          <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-[#FF6B6B]">{filterStats.data.avgResults}</div>
              <p className="text-xs text-[rgba(239,239,239,0.5)] mt-2">Média de Resultados</p>
            </CardContent>
          </Card>
          <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-[#FFE66D]">{filterStats.data.avgDuration}ms</div>
              <p className="text-xs text-[rgba(239,239,239,0.5)] mt-2">Duração Média</p>
            </CardContent>
          </Card>
          <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-[#95E1D3]">{filterStats.data.totalResults}</div>
              <p className="text-xs text-[rgba(239,239,239,0.5)] mt-2">Total de Resultados</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Type Distribution */}
      {filterStats.data && (
        <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
          <CardHeader>
            <CardTitle className="text-[#EFEFEF]">Distribuição por Tipo de Filtro</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Status", value: filterStats.data.byType.status },
                    { name: "Data", value: filterStats.data.byType.date },
                    { name: "Preço", value: filterStats.data.byType.price },
                    { name: "Ordenação", value: filterStats.data.byType.sort },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Used Filters */}
      {topFilters.data && topFilters.data.length > 0 && (
        <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
          <CardHeader>
            <CardTitle className="text-[#EFEFEF]">Top 10 Filtros Mais Utilizados</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topFilters.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="filterType" stroke="rgba(239,239,239,0.5)" />
                <YAxis stroke="rgba(239,239,239,0.5)" />
                <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)" }} />
                <Bar dataKey="usageCount" fill="#4ECDC4" name="Vezes Utilizadas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Filter Usage Trends */}
      {filterTrends.data && filterTrends.data.length > 0 && (
        <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
          <CardHeader>
            <CardTitle className="text-[#EFEFEF]">Tendência de Uso de Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filterTrends.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="period" stroke="rgba(239,239,239,0.5)" />
                <YAxis stroke="rgba(239,239,239,0.5)" />
                <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)" }} />
                <Legend />
                <Line type="monotone" dataKey="status" stroke="#4ECDC4" name="Status" />
                <Line type="monotone" dataKey="date" stroke="#FF6B6B" name="Data" />
                <Line type="monotone" dataKey="price" stroke="#FFE66D" name="Preço" />
                <Line type="monotone" dataKey="sort" stroke="#95E1D3" name="Ordenação" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Filter Usage by User */}
      {filterByUser.data && filterByUser.data.length > 0 && (
        <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
          <CardHeader>
            <CardTitle className="text-[#EFEFEF]">Top Usuários por Uso de Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filterByUser.data.map((user) => (
                <div key={user.userId} className="flex justify-between items-center p-3 bg-[rgba(255,255,255,0.05)] rounded">
                  <div>
                    <p className="text-[#EFEFEF]">Usuário #{user.userId}</p>
                    <p className="text-xs text-[rgba(239,239,239,0.5)]">{user.filterTypes.join(", ")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#4ECDC4] font-bold">{user.usageCount}</p>
                    <p className="text-xs text-[rgba(239,239,239,0.5)]">utilizações</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
