/**
 * User Profile Page
 * Displays user information, cashback balance, and transaction history
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Loader2, LogOut, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, logout, loading: authLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'earned' | 'spent'>('all');

  // Queries
  const getCashbackBalanceQuery = trpc.cashback.getBalance.useQuery(undefined, {
    enabled: !!user,
  });
  const getTransactionsQuery = trpc.cashback.getTransactions.useQuery(undefined, {
    enabled: !!user,
  });
  const logoutMutation = trpc.auth.logout.useMutation();

  // Redirect if not authenticated
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-[#EFEFEF]" size={40} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-[rgba(239,239,239,0.6)]">Você precisa estar autenticado para acessar esta página</p>
        <Button
          onClick={() => setLocation("/")}
          className="bg-[#FFFFFF] text-[#0B0B0B] hover:bg-[#F0F0F0]"
        >
          Voltar para Home
        </Button>
      </div>
    );
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutMutation.mutateAsync();
      await logout();
      toast.success("Desconectado com sucesso");
      setLocation("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Erro ao desconectar");
      setIsLoggingOut(false);
    }
  };

  const cashbackBalance = getCashbackBalanceQuery.data;
  const allTransactions = getTransactionsQuery.data || [];
  const earnedTransactions = allTransactions.filter((t) => t.type === "earned");
  const spentTransactions = allTransactions.filter((t) => t.type === "spent");
  
  const filteredTransactions = transactionFilter === 'all' 
    ? allTransactions 
    : allTransactions.filter((t) => t.type === transactionFilter);
  const transactions = filteredTransactions;

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#EFEFEF]">
      {/* Header */}
      <div className="border-b border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">Meu Perfil</h1>
              <p className="text-[rgba(239,239,239,0.5)]">Gerencie sua conta e visualize seu cashback</p>
            </div>
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <LogOut size={16} className="mr-2" />
              {isLoggingOut ? "Desconectando..." : "Desconectar"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* User Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* User Card */}
          <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] p-6 col-span-1 md:col-span-1">
            <div className="space-y-4">
              <div>
                <p className="text-[rgba(239,239,239,0.4)] text-sm font-mono-label mb-1">Nome</p>
                <p className="font-heading font-semibold text-lg">{user.name || "Usuário"}</p>
              </div>
              <div>
                <p className="text-[rgba(239,239,239,0.4)] text-sm font-mono-label mb-1">Email</p>
                <p className="font-mono-label text-sm break-all">{user.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-[rgba(239,239,239,0.4)] text-sm font-mono-label mb-1">Método de Login</p>
                <p className="font-mono-label text-sm capitalize">{user.loginMethod || "N/A"}</p>
              </div>
              <div>
                <p className="text-[rgba(239,239,239,0.4)] text-sm font-mono-label mb-1">Membro desde</p>
                <p className="font-mono-label text-sm">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString("pt-PT") : "N/A"}
                </p>
              </div>
            </div>
          </Card>

          {/* Cashback Balance Cards */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Earned */}
            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[rgba(239,239,239,0.5)] text-sm font-mono-label mb-1">Total Ganho</p>
                  <p className="font-display text-2xl font-bold text-green-400">
                    €{cashbackBalance ? (cashbackBalance.totalEarned / 100).toFixed(2) : "0.00"}
                  </p>
                </div>
                <TrendingUp className="text-green-400" size={24} />
              </div>
              <p className="text-[rgba(239,239,239,0.3)] text-xs">
                {earnedTransactions.length} compras realizadas
              </p>
            </Card>

            {/* Total Spent */}
            <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[rgba(239,239,239,0.5)] text-sm font-mono-label mb-1">Total Gasto</p>
                  <p className="font-display text-2xl font-bold text-red-400">
                    €{cashbackBalance ? (cashbackBalance.totalSpent / 100).toFixed(2) : "0.00"}
                  </p>
                </div>
                <TrendingDown className="text-red-400" size={24} />
              </div>
              <p className="text-[rgba(239,239,239,0.3)] text-xs">
                {spentTransactions.length} descontos aplicados
              </p>
            </Card>

            {/* Available Balance */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[rgba(239,239,239,0.5)] text-sm font-mono-label mb-1">Saldo Disponível</p>
                  <p className="font-display text-2xl font-bold text-blue-400">
                    €{cashbackBalance ? (cashbackBalance.availableBalance / 100).toFixed(2) : "0.00"}
                  </p>
                </div>
                <Wallet className="text-blue-400" size={24} />
              </div>
              <p className="text-[rgba(239,239,239,0.3)] text-xs">Pronto para usar</p>
            </Card>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold">Histórico de Transações</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setTransactionFilter('all')}
                  className={`px-3 py-1 rounded text-sm font-mono-label transition-all ${
                    transactionFilter === 'all'
                      ? 'bg-[#FFFFFF] text-[#0B0B0B]'
                      : 'bg-[rgba(255,255,255,0.1)] text-[rgba(239,239,239,0.6)] hover:bg-[rgba(255,255,255,0.15)]'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setTransactionFilter('earned')}
                  className={`px-3 py-1 rounded text-sm font-mono-label transition-all ${
                    transactionFilter === 'earned'
                      ? 'bg-green-500 text-white'
                      : 'bg-[rgba(255,255,255,0.1)] text-[rgba(239,239,239,0.6)] hover:bg-[rgba(255,255,255,0.15)]'
                  }`}
                >
                  Ganho
                </button>
                <button
                  onClick={() => setTransactionFilter('spent')}
                  className={`px-3 py-1 rounded text-sm font-mono-label transition-all ${
                    transactionFilter === 'spent'
                      ? 'bg-blue-500 text-white'
                      : 'bg-[rgba(255,255,255,0.1)] text-[rgba(239,239,239,0.6)] hover:bg-[rgba(255,255,255,0.15)]'
                  }`}
                >
                  Gasto
                </button>
              </div>
            </div>

            {getTransactionsQuery.isLoading || getCashbackBalanceQuery.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-[rgba(239,239,239,0.4)]" size={32} />
              </div>
            ) : getCashbackBalanceQuery.isError || getTransactionsQuery.isError ? (
              <Card className="bg-red-500/10 border-red-500/20 p-8 text-center">
                <p className="text-red-400 font-heading">Erro ao carregar dados</p>
                <p className="text-[rgba(239,239,239,0.3)] text-sm mt-2">
                  Tente recarregar a página
                </p>
              </Card>
            ) : transactions.length === 0 ? (
              <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] p-8 text-center">
                <p className="text-[rgba(239,239,239,0.5)]">Nenhuma transação ainda</p>
                <p className="text-[rgba(239,239,239,0.3)] text-sm mt-2">
                  Suas transações de cashback aparecerão aqui
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <Card
                    key={transaction.id}
                    className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] p-4 hover:border-[rgba(255,255,255,0.15)] transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === "earned"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {transaction.type === "earned" ? (
                            <TrendingUp size={20} />
                          ) : (
                            <TrendingDown size={20} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-heading font-semibold text-sm truncate">
                            {transaction.description}
                          </p>
                          <p className="text-[rgba(239,239,239,0.4)] text-xs">
                            {new Date(transaction.createdAt).toLocaleDateString("pt-PT", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p
                          className={`font-heading font-bold text-lg ${
                            transaction.type === "earned" ? "text-green-400" : "text-blue-400"
                          }`}
                        >
                          {transaction.type === "earned" ? "+" : "-"}€{(transaction.amount / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
