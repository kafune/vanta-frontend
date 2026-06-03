import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Package, MapPin, Bell, LogOut, Edit2, Save, X, Heart, ShoppingCart, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/hooks/useCart";
import ProductReviews from "@/components/ProductReviews";
import { trpc } from "@/lib/trpc";

interface Order {
  id: string;
  date: string;
  total: number;
  status: "confirmado" | "preparacao" | "entregue" | "cancelado";
  items: number;
  trackingNumber: string;
}

interface Address {
  id: string;
  name: string;
  street: string;
  number: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}


const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  pendente: { bg: "bg-yellow-500/10", text: "text-yellow-400", label: "Aguardando pagamento" },
  confirmado: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Confirmado" },
  enviado: { bg: "bg-indigo-500/10", text: "text-indigo-400", label: "Enviado" },
  entregue: { bg: "bg-green-500/10", text: "text-green-400", label: "Entregue" },
  cancelado: { bg: "bg-red-500/10", text: "text-red-400", label: "Cancelado" },
};

// Componente de Favoritos
function FavoritesTab() {
  const { favorites, removeFavorite } = useFavorites();
  const { addItem } = useCart();

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      size: "M",
      color: product.color,
    });
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  if (favorites.length === 0) {
    return (
      <Card className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)]">
        <CardContent className="pt-12 pb-12 text-center">
          <Heart size={48} className="mx-auto mb-4 text-[rgba(239,239,239,0.3)]" />
          <p className="text-[rgba(239,239,239,0.6)] mb-4">Nenhum produto favorito ainda</p>
          <p className="text-[rgba(239,239,239,0.4)] text-sm">Clique no ícone de coração para adicionar produtos aos favoritos</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {favorites.map((product) => (
        <Card key={product.id} className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] overflow-hidden hover:bg-[rgba(255,255,255,0.08)] transition-colors">
          <div className="relative h-48 bg-[rgba(255,255,255,0.03)] overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <CardContent className="pt-4">
            <h3 className="text-[#EFEFEF] font-semibold mb-2">{product.name}</h3>
            <p className="text-[rgba(239,239,239,0.6)] text-sm mb-2">{product.color}</p>
            <p className="text-[#EFEFEF] font-bold mb-4">€{product.price.toFixed(2)}</p>
            <div className="flex gap-2">
              <Button
                onClick={() => handleAddToCart(product)}
                className="flex-1 bg-[#EFEFEF] text-[#0B0B0B] hover:bg-white text-sm"
              >
                <ShoppingCart size={14} className="mr-2" />
                Carrinho
              </Button>
              <Button
                onClick={() => {
                  removeFavorite(product.id);
                  toast.success("Removido dos favoritos");
                }}
                variant="outline"
                className="border-[rgba(255,255,255,0.1)] text-[#EFEFEF] hover:bg-[rgba(255,255,255,0.1)]"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function UserAccount() {
  const { user, logout, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "+351 912 345 678",
  });
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const ordersQuery = trpc.orders.getByUser.useQuery(undefined, { enabled: !!user });
  const myOrders = ordersQuery.data ?? [];

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: "#0B0B0B" }}>
        <Navbar />
        <div className="pt-32 pb-20 px-4 text-center">
          <p className="text-[rgba(239,239,239,0.6)]">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen" style={{ background: "#0B0B0B" }}>
        <Navbar />
        <div className="pt-32 pb-20 px-4 text-center">
          <p className="text-[rgba(239,239,239,0.6)] mb-4">Você precisa estar autenticado para acessar esta página.</p>
          <Button onClick={() => setLocation("/")} className="bg-[#EFEFEF] text-[#0B0B0B] hover:bg-white">
            Voltar à Home
          </Button>
        </div>
      </div>
    );
  }

  const handleSaveProfile = () => {
    toast.success("Perfil atualizado com sucesso!");
    setIsEditingProfile(false);
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/");
    toast.success("Desconectado com sucesso!");
  };

  return (
    <div className="min-h-screen" style={{ background: "#0B0B0B" }}>
      <Navbar />

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-heading text-5xl font-bold text-[#EFEFEF] mb-2">
              Minha Conta
            </h1>
            <p className="text-[rgba(239,239,239,0.6)]">
              Gerencie seu perfil, pedidos e preferências
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User size={16} />
                <span className="hidden sm:inline">Perfil</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package size={16} />
                <span className="hidden sm:inline">Pedidos</span>
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Heart size={16} />
                <span className="hidden sm:inline">Favoritos</span>
              </TabsTrigger>
              <TabsTrigger value="addresses" className="flex items-center gap-2">
                <MapPin size={16} />
                <span className="hidden sm:inline">Endereços</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell size={16} />
                <span className="hidden sm:inline">Notificações</span>
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex items-center gap-2">
                <Star size={16} />
                <span className="hidden sm:inline">Avaliações</span>
              </TabsTrigger>
            </TabsList>

            {/* Perfil */}
            <TabsContent value="profile" className="mt-8">
              <Card className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)]">
                <CardHeader>
                  <CardTitle className="text-[#EFEFEF]">Informações Pessoais</CardTitle>
                  <CardDescription>Atualize seus dados de perfil</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isEditingProfile ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-[rgba(239,239,239,0.8)]">
                          Nome
                        </Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) =>
                            setProfileData({ ...profileData, name: e.target.value })
                          }
                          className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#EFEFEF]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-[rgba(239,239,239,0.8)]">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) =>
                            setProfileData({ ...profileData, email: e.target.value })
                          }
                          className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#EFEFEF]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-[rgba(239,239,239,0.8)]">
                          Telefone
                        </Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) =>
                            setProfileData({ ...profileData, phone: e.target.value })
                          }
                          className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#EFEFEF]"
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={handleSaveProfile}
                          className="bg-[#EFEFEF] text-[#0B0B0B] hover:bg-white flex items-center gap-2"
                        >
                          <Save size={16} />
                          Guardar
                        </Button>
                        <Button
                          onClick={() => setIsEditingProfile(false)}
                          variant="outline"
                          className="border-[rgba(255,255,255,0.1)] text-[#EFEFEF] hover:bg-[rgba(255,255,255,0.05)] flex items-center gap-2"
                        >
                          <X size={16} />
                          Cancelar
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <p className="text-[rgba(239,239,239,0.6)] text-sm">Nome</p>
                        <p className="text-[#EFEFEF] font-semibold">{profileData.name}</p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[rgba(239,239,239,0.6)] text-sm">Email</p>
                        <p className="text-[#EFEFEF] font-semibold">{profileData.email}</p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[rgba(239,239,239,0.6)] text-sm">Telefone</p>
                        <p className="text-[#EFEFEF] font-semibold">{profileData.phone}</p>
                      </div>

                      <Button
                        onClick={() => setIsEditingProfile(true)}
                        variant="outline"
                        className="border-[rgba(255,255,255,0.1)] text-[#EFEFEF] hover:bg-[rgba(255,255,255,0.05)] flex items-center gap-2"
                      >
                        <Edit2 size={16} />
                        Editar Perfil
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Logout */}
              <div className="mt-8">
                <Button
                  onClick={handleLogout}
                  className="w-full bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 flex items-center justify-center gap-2"
                >
                  <LogOut size={16} />
                  Desconectar
                </Button>
              </div>
            </TabsContent>

            {/* Pedidos */}
            <TabsContent value="orders" className="mt-8 space-y-4">
              {myOrders.length > 0 ? (
                myOrders.map((order) => {
                  const sc = statusColors[order.status] ?? { bg: "bg-[rgba(255,255,255,0.06)]", text: "text-[rgba(239,239,239,0.7)]", label: order.status };
                  return (
                    <Card
                      key={order.id}
                      className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] cursor-pointer hover:bg-[rgba(255,255,255,0.08)] transition-colors"
                      onClick={() => setLocation(`/track/${order.id}`)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="space-y-2">
                            <p className="text-[#EFEFEF] font-semibold font-mono text-sm">{order.id}</p>
                            <p className="text-[rgba(239,239,239,0.6)] text-sm">
                              {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <div className="space-y-2 sm:text-right">
                            <p className="text-[#EFEFEF] font-semibold">R$ {(order.totalPrice / 100).toFixed(2)}</p>
                            <div className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold ${sc.bg} ${sc.text}`}>
                              {sc.label}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)]">
                  <CardContent className="pt-6 text-center">
                    <p className="text-[rgba(239,239,239,0.6)]">
                      {ordersQuery.isLoading ? "Carregando..." : "Nenhum pedido encontrado"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Favoritos */}
            <TabsContent value="favorites" className="mt-8">
              <FavoritesTab />
            </TabsContent>

            {/* Endereços */}
            <TabsContent value="addresses" className="mt-8 space-y-4">
              <Card className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)]">
                <CardContent className="pt-6 text-center">
                  <MapPin className="mx-auto mb-3 text-[rgba(239,239,239,0.3)]" size={28} />
                  <p className="text-[rgba(239,239,239,0.6)]">Nenhum endereço cadastrado ainda.</p>
                  <p className="text-[rgba(239,239,239,0.4)] text-sm mt-1">O cadastro de endereços será disponibilizado em breve.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notificações */}
            <TabsContent value="notifications" className="mt-8">
              <Card className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)]">
                <CardHeader>
                  <CardTitle className="text-[#EFEFEF]">Preferências de Notificação</CardTitle>
                  <CardDescription>Controle como você recebe atualizações</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#EFEFEF] font-semibold">Confirmação de Pedido</p>
                      <p className="text-[rgba(239,239,239,0.6)] text-sm">
                        Receba confirmação quando seu pedido for processado
                      </p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#EFEFEF] font-semibold">Atualizações de Envio</p>
                      <p className="text-[rgba(239,239,239,0.6)] text-sm">
                        Notificações sobre o status de entrega
                      </p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#EFEFEF] font-semibold">Promoções e Ofertas</p>
                      <p className="text-[rgba(239,239,239,0.6)] text-sm">
                        Receba informações sobre novos produtos e descontos
                      </p>
                    </div>
                    <input type="checkbox" className="w-4 h-4" />
                  </div>

                  <Button className="w-full bg-[#EFEFEF] text-[#0B0B0B] hover:bg-white mt-6">
                    Guardar Preferências
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Avaliações */}
            <TabsContent value="reviews" className="mt-8">
              <Card className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)]">
                <CardHeader>
                  <CardTitle className="text-[#EFEFEF]">Minhas Avaliações</CardTitle>
                  <CardDescription>Veja e gerencie suas avaliações de produtos</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-[rgba(239,239,239,0.6)] text-center py-6">
                    Você poderá avaliar os produtos após receber seus pedidos.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
}
