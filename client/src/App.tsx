import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Product from "./pages/Product";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import OrderTracking from "./pages/OrderTracking";
import CategoryProducts from "./pages/CategoryProducts";
import ModelDetails from "./pages/ModelDetails";
import UserAccount from "./pages/UserAccount";
import AdminDashboard from "./pages/AdminDashboard";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/produto/:id"} component={Product} />
      <Route path={"/categoria/:category"} component={CategoryProducts} />
      <Route path={"/modelo/:id"} component={ModelDetails} />      <Route path={"/account"} component={UserAccount} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/checkout/success"} component={CheckoutSuccess} />
      <Route path={"/track/:orderId"} component={OrderTracking} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
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
