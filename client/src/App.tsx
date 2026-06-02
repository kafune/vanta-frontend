import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Product from "./pages/Product";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import OrderTracking from "./pages/OrderTracking";
import CategoryProducts from "./pages/CategoryProducts";
import ModelDetails from "./pages/ModelDetails";
import UserAccount from "./pages/UserAccount";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import SearchResults from "./pages/SearchResults";
import Collections from "./pages/Collections";
import CollectionDetail from "./pages/CollectionDetail";
// Envolve uma página com o Layout compartilhado (Navbar + Footer), repassando
// os props que o wouter injeta (ex.: params de rota como :id, :collectionId).
const withLayout = (Component: React.ComponentType<any>) => (props: any) => (
  <Layout>
    <Component {...props} />
  </Layout>
);

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      {/* Páginas que já renderizam seu próprio Navbar/Footer ou header — mantidas como estão */}
      <Route path={"/"} component={Home} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/produto/:id"} component={Product} />
      <Route path={"/categoria/:category"} component={CategoryProducts} />
      <Route path={"/modelo/:id"} component={ModelDetails} />
      <Route path={"/account"} component={UserAccount} />

      {/* Páginas que antes ficavam sem navegação — agora com Navbar + Footer via Layout */}
      <Route path={"/profile"} component={withLayout(Profile)} />
      <Route path={"/wishlist"} component={withLayout(Wishlist)} />
      <Route path={"/search"} component={withLayout(SearchResults)} />
      <Route path={"/collections"} component={withLayout(Collections)} />
      <Route path={"/collection/:collectionId"} component={withLayout(CollectionDetail)} />
      <Route path={"/checkout/success"} component={withLayout(CheckoutSuccess)} />
      <Route path={"/track/:orderId"} component={withLayout(OrderTracking)} />
      <Route path={"/404"} component={withLayout(NotFound)} />
      <Route component={withLayout(NotFound)} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster
            toastOptions={{
              style: {
                background: '#111111',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#EFEFEF',
                fontFamily: 'DM Sans, sans-serif',
              },
            }}
          />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
