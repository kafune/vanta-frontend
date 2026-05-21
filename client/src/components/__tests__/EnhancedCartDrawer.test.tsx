/**
 * Enhanced Cart Drawer Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
// Note: jest-dom matchers are configured in vitest.setup.ts
import EnhancedCartDrawer from "../EnhancedCartDrawer";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

// Mock dependencies
vi.mock("@/hooks/useCart");
vi.mock("@/_core/hooks/useAuth");
vi.mock("@/lib/trpc");
vi.mock("wouter", () => ({
  useLocation: () => ["/", vi.fn()],
}));

describe("EnhancedCartDrawer", () => {
  const mockCartItems = [
    {
      id: "prod-1",
      name: "Essential Tee",
      price: 50,
      quantity: 2,
      size: "M",
    },
    {
      id: "prod-2",
      name: "Urban Oversized",
      price: 75,
      quantity: 1,
      size: "L",
    },
  ];

  const mockUser = {
    id: 1,
    name: "Test User",
    email: "test@example.com",
    role: "user" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useCart
    (useCart as any).mockReturnValue({
      items: mockCartItems,
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
      subtotal: 175,
      tax: 17.5,
      shipping: 10,
      total: 202.5,
      itemCount: 3,
    });

    // Mock useAuth
    (useAuth as any).mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      isAuthenticated: true,
      logout: vi.fn(),
    });

    // Mock tRPC
    (trpc as any).inventory = {
      checkAvailability: {
        useMutation: () => ({
          mutateAsync: vi.fn().mockResolvedValue({
            available: 10,
            reserved: 0,
          }),
        }),
      },
    };

    (trpc as any).promotions = {
      applyPromotionCode: {
        useMutation: () => ({
          mutateAsync: vi.fn().mockResolvedValue({
            success: true,
            discount: 20.25,
            discountPercentage: 10,
            finalTotal: 182.25,
          }),
        }),
      },
    };

    (trpc as any).email = {
      sendOrderConfirmation: {
        useMutation: () => ({
          mutateAsync: vi.fn().mockResolvedValue({ success: true }),
        }),
      },
    };
  });

  it("should render cart drawer with items", () => {
    render(
      <EnhancedCartDrawer open={true} onOpenChange={vi.fn()} />
    );

    expect(screen.getByText(/Carrinho/i)).toBeDefined();
    expect(screen.getByText("Essential Tee")).toBeDefined();
    expect(screen.getByText("Urban Oversized")).toBeDefined();
  });

  it("should display empty cart message when no items", async () => {
    (useCart as any).mockReturnValue({
      items: [],
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
      subtotal: 0,
      tax: 0,
      shipping: 0,
      total: 0,
      itemCount: 0,
    });

    render(
      <EnhancedCartDrawer open={true} onOpenChange={vi.fn()} />
    );

    expect(screen.getByText(/Carrinho vazio/i)).toBeDefined();
  });

  it("should display price summary", () => {
    render(
      <EnhancedCartDrawer open={true} onOpenChange={vi.fn()} />
    );

    expect(screen.getByText(/Subtotal:/i)).toBeInTheDocument();
    expect(screen.getByText(/Frete:/i)).toBeInTheDocument();
    expect(screen.getByText(/Impostos:/i)).toBeInTheDocument();
    expect(screen.getByText(/Total:/i)).toBeInTheDocument();
  });

  it("should allow applying promotion code", async () => {
    render(
      <EnhancedCartDrawer open={true} onOpenChange={vi.fn()} />
    );

    const input = screen.getByPlaceholderText(/Código de promoção/i);
    const applyButton = screen.getByText(/Aplicar/i);

    fireEvent.change(input, { target: { value: "SUMMER20" } });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(screen.getByText(/Promoção aplicada/i)).toBeInTheDocument();
    });
  });

  it("should display inventory status for items", async () => {
    render(
      <EnhancedCartDrawer open={true} onOpenChange={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText(/Em estoque/i)).toBeInTheDocument();
    });
  });

  it("should disable checkout when inventory errors exist", async () => {
    // Mock inventory check to return out of stock
    (trpc as any).inventory.checkAvailability.useMutation = () => ({
      mutateAsync: vi.fn().mockResolvedValue({
        available: 0,
        reserved: 2,
      }),
    });

    render(
      <EnhancedCartDrawer open={true} onOpenChange={vi.fn()} />
    );

    await waitFor(() => {
      const checkoutButton = screen.getByText(/Ir para Checkout/i);
      expect(checkoutButton).toBeDisabled();
    });
  });

  it("should display discount amount when promotion applied", async () => {
    render(
      <EnhancedCartDrawer open={true} onOpenChange={vi.fn()} />
    );

    const input = screen.getByPlaceholderText(/Código de promoção/i);
    const applyButton = screen.getByText(/Aplicar/i);

    fireEvent.change(input, { target: { value: "SUMMER20" } });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(screen.getByText(/Desconto:/i)).toBeInTheDocument();
    });
  });

  it("should allow removing promotion", async () => {
    render(
      <EnhancedCartDrawer open={true} onOpenChange={vi.fn()} />
    );

    const input = screen.getByPlaceholderText(/Código de promoção/i);
    const applyButton = screen.getByText(/Aplicar/i);

    fireEvent.change(input, { target: { value: "SUMMER20" } });
    fireEvent.click(applyButton);

    await waitFor(() => {
      const removeButton = screen.getByText(/Remover/i);
      fireEvent.click(removeButton);
    });

    await waitFor(() => {
      expect(screen.queryByText(/Promoção aplicada/i)).not.toBeInTheDocument();
    });
  });

  it("should handle checkout", async () => {
    const mockOnOpenChange = vi.fn();

    render(
      <EnhancedCartDrawer open={true} onOpenChange={mockOnOpenChange} />
    );

    const checkoutButton = screen.getByText(/Ir para Checkout/i);
    fireEvent.click(checkoutButton);

    await waitFor(() => {
      expect(screen.getByText(/Processando/i)).toBeInTheDocument();
    });
  });
});
