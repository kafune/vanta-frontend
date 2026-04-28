import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Plus, Edit, Trash2, Check, X, Mail } from "lucide-react";
import { ResendNotificationDialog } from "@/components/ResendNotificationDialog";
import { OrderFilters, OrderFiltersState } from "@/components/OrderFilters";
import { FilterAnalytics } from "@/components/FilterAnalytics";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedTab, setSelectedTab] = useState("sales");
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState("");
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string | undefined>();
  const [resendDialogOpen, setResendDialogOpen] = useState(false);
  const [selectedOrderForResend, setSelectedOrderForResend] = useState<{ id: string; email?: string; status?: string } | null>(null);

  // Queries
  const [orderFilters, setOrderFilters] = useState<OrderFiltersState>({
    statuses: [],
  });
  const salesSummary = trpc.admin.sales.summary.useQuery();
  const couponsList = trpc.admin.coupons.list.useQuery();
  const ordersList = trpc.admin.orders.list.useQuery({
    statuses: orderFilters.statuses.length > 0 ? (orderFilters.statuses as any) : undefined,
    dateFrom: orderFilters.dateFrom,
    dateTo: orderFilters.dateTo,
    priceMin: orderFilters.priceMin,
    priceMax: orderFilters.priceMax,
    sortBy: (orderFilters.sortBy || "date") as any,
    sortOrder: (orderFilters.sortOrder || "desc") as any,
  });

  // Mutations
  const createCoupon = trpc.admin.coupons.create.useMutation();
  const updateOrderStatus = trpc.admin.orders.updateStatus.useMutation();

  const handleOpenResendDialog = (order: any) => {
    setSelectedOrderForResend({
      id: order.id,
      email: "customer@example.com",
      status: order.status,
    });
    setResendDialogOpen(true);
  };

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#EFEFEF] mb-4">Acesso Negado</h1>
          <p className="text-[rgba(239,239,239,0.6)] mb-6">Você não tem permissão para acessar esta página.</p>
          <Button onClick={() => window.location.href = "/"} className="bg-white text-black hover:bg-[rgba(255,255,255,0.9)]">
            Voltar para Home
          </Button>
        </div>
      </div>
    );
  }

  const handleCreateCoupon = async () => {
    if (!newCouponCode.trim() || !newCouponDiscount.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      await createCoupon.mutateAsync({
        code: newCouponCode,
        discountType: "percentage",
        discountValue: parseFloat(newCouponDiscount),
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      toast.success("Cupom criado com sucesso!");
      setNewCouponCode("");
      setNewCouponDiscount("");
      couponsList.refetch();
    } catch (error) {
      toast.error("Erro ao criar cupom");
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus.mutateAsync({
        orderId,
        status: newStatus as any,
        sendNotification: true,
      });
      toast.success("Status do pedido atualizado!");
      ordersList.refetch();
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleResendSuccess = () => {
    ordersList.refetch();
  };

  const handleFiltersChange = (filters: OrderFiltersState) => {
    setOrderFilters(filters);
  };

  // Calculate status counts
  const statusCounts = {
    pendente: salesSummary.data?.statusBreakdown.pendente || 0,
    confirmado: salesSummary.data?.statusBreakdown.confirmado || 0,
    enviado: salesSummary.data?.statusBreakdown.enviado || 0,
    entregue: salesSummary.data?.statusBreakdown.entregue || 0,
    cancelado: salesSummary.data?.statusBreakdown.cancelado || 0,
  };

  const chartData = ordersList.data
    ? ordersList.data.slice(0, 7).map((order: any) => ({
        id: order.id.slice(0, 8),
        valor: order.totalPrice,
      }))
    : [];

  const statusData = salesSummary.data
    ? [
        { name: "Pendente", value: salesSummary.data.statusBreakdown.pendente },
        { name: "Confirmado", value: salesSummary.data.statusBreakdown.confirmado },
        { name: "Enviado", value: salesSummary.data.statusBreakdown.enviado },
        { name: "Entregue", value: salesSummary.data.statusBreakdown.entregue },
        { name: "Cancelado", value: salesSummary.data.statusBreakdown.cancelado },
      ]
    : [];

  const COLORS = ["#FF6B6B", "#FFA500", "#4ECDC4", "#45B7D1", "#95A5A6"];

  return (
    <div className="min-h-screen bg-[#0B0B0B]" style={{ background: "#0B0B0B" }}>
      {/* Header */}
      <div className="border-b border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setLocation("/")}
              variant="ghost"
              size="sm"
              className="text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="font-heading text-2xl font-bold text-[#EFEFEF]">Painel Admin</h1>
          </div>
          <div className="text-sm text-[rgba(239,239,239,0.5)]">Bem-vindo, {user?.name}</div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]">
            <TabsTrigger value="sales" className="data-[state=active]:bg-[rgba(255,255,255,0.1)]">
              Vendas
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-[rgba(255,255,255,0.1)]">
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="coupons" className="data-[state=active]:bg-[rgba(255,255,255,0.1)]">
              Cupons
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-[rgba(255,255,255,0.1)]">
              Análise
            </TabsTrigger>
          </TabsList>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[rgba(239,239,239,0.6)]">Receita Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#EFEFEF]">
                    €{salesSummary.data?.totalRevenue.toFixed(2) || "0.00"}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[rgba(239,239,239,0.6)]">Total de Pedidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#EFEFEF]">{salesSummary.data?.totalOrders || 0}</div>
                </CardContent>
              </Card>

              <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[rgba(239,239,239,0.6)]">Ticket Médio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#EFEFEF]">
                    €{salesSummary.data?.averageOrderValue.toFixed(2) || "0.00"}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[rgba(239,239,239,0.6)]">Pedidos Entregues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">{salesSummary.data?.statusBreakdown.entregue || 0}</div>
                </CardContent>
              </Card>
            </div>

            {/* Chart */}
            <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
              <CardHeader>
                <CardTitle className="text-[#EFEFEF]">Últimos Pedidos (Valor)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="id" stroke="rgba(239,239,239,0.5)" />
                    <YAxis stroke="rgba(239,239,239,0.5)" />
                    <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)" }} />
                    <Bar dataKey="valor" fill="#4ECDC4" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6 mt-6">
            {/* Advanced Filters */}
            <OrderFilters
              onFiltersChange={handleFiltersChange}
              statusCounts={statusCounts}
              isExpanded={true}
            />

            <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
              <CardHeader>
                <CardTitle className="text-[#EFEFEF]">Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[rgba(255,255,255,0.08)]">
                        <th className="text-left py-3 px-2 text-[rgba(239,239,239,0.6)]">ID</th>
                        <th className="text-left py-3 px-2 text-[rgba(239,239,239,0.6)]">Cliente</th>
                        <th className="text-left py-3 px-2 text-[rgba(239,239,239,0.6)]">Valor</th>
                        <th className="text-left py-3 px-2 text-[rgba(239,239,239,0.6)]">Status</th>
                        <th className="text-left py-3 px-2 text-[rgba(239,239,239,0.6)]">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordersList.data?.map((order) => (
                        <tr key={order.id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)]">
                          <td className="py-3 px-2 text-[#EFEFEF] font-mono text-xs">{order.id.slice(0, 8)}</td>
                          <td className="py-3 px-2 text-[rgba(239,239,239,0.7)]">Pedido #{order.id.slice(0, 6)}</td>
                          <td className="py-3 px-2 text-[#EFEFEF]">€{order.totalPrice.toFixed(2)}</td>
                          <td className="py-3 px-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                order.status === "entregue"
                                  ? "bg-green-500/20 text-green-400"
                                  : order.status === "cancelado"
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-blue-500/20 text-blue-400"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex gap-2 items-center">
                              <Select
                                value={order.status}
                                onValueChange={(newStatus) => handleUpdateOrderStatus(order.id, newStatus)}
                              >
                                <SelectTrigger className="w-32 h-8 bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[0.75rem]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] border-[rgba(255,255,255,0.1)]">
                                  <SelectItem value="pendente" className="text-[#EFEFEF]">
                                    Pendente
                                  </SelectItem>
                                  <SelectItem value="confirmado" className="text-[#EFEFEF]">
                                    Confirmado
                                  </SelectItem>
                                  <SelectItem value="enviado" className="text-[#EFEFEF]">
                                    Enviado
                                  </SelectItem>
                                  <SelectItem value="entregue" className="text-[#EFEFEF]">
                                    Entregue
                                  </SelectItem>
                                  <SelectItem value="cancelado" className="text-[#EFEFEF]">
                                    Cancelado
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleOpenResendDialog(order)}
                                className="h-8 w-8 p-0 text-[rgba(239,239,239,0.6)] hover:text-blue-400 hover:bg-blue-500/10"
                                title="Reenviar notificação"
                              >
                                <Mail className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons" className="space-y-6 mt-6">
            <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
              <CardHeader>
                <CardTitle className="text-[#EFEFEF]">Criar Novo Cupom</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Código (ex: VANTA10)"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                    className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#EFEFEF]"
                  />
                  <Input
                    placeholder="Desconto (%)"
                    type="number"
                    value={newCouponDiscount}
                    onChange={(e) => setNewCouponDiscount(e.target.value)}
                    className="w-32 bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#EFEFEF]"
                  />
                  <Button onClick={handleCreateCoupon} className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
              <CardHeader>
                <CardTitle className="text-[#EFEFEF]">Cupons Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[rgba(255,255,255,0.08)]">
                        <th className="text-left py-3 px-2 text-[rgba(239,239,239,0.6)]">Código</th>
                        <th className="text-left py-3 px-2 text-[rgba(239,239,239,0.6)]">Desconto</th>
                        <th className="text-left py-3 px-2 text-[rgba(239,239,239,0.6)]">Usos</th>
                        <th className="text-left py-3 px-2 text-[rgba(239,239,239,0.6)]">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {couponsList.data?.map((coupon) => (
                        <tr key={coupon.id} className="border-b border-[rgba(255,255,255,0.05)]">
                          <td className="py-3 px-2 text-[#EFEFEF] font-mono">{coupon.code}</td>
                          <td className="py-3 px-2 text-[rgba(239,239,239,0.7)]">
                            {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `€${coupon.discountValue / 100}`}
                          </td>
                          <td className="py-3 px-2 text-[rgba(239,239,239,0.7)]">
                            {coupon.currentUses}/{coupon.maxUses || "∞"}
                          </td>
                          <td className="py-3 px-2">
                            {coupon.isActive ? (
                              <span className="text-green-400 flex items-center gap-1">
                                <Check className="w-4 h-4" /> Ativo
                              </span>
                            ) : (
                              <span className="text-red-400 flex items-center gap-1">
                                <X className="w-4 h-4" /> Inativo
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6 mt-6">
            <FilterAnalytics />
          </TabsContent>
        </Tabs>
      </div>
      {/* Resend Notification Dialog */}
      {selectedOrderForResend && (
        <ResendNotificationDialog
          open={resendDialogOpen}
          onOpenChange={setResendDialogOpen}
          orderId={selectedOrderForResend.id}
          customerEmail={selectedOrderForResend.email}
          orderStatus={selectedOrderForResend.status}
          onSuccess={handleResendSuccess}
        />
      )}
    </div>
  );
}
