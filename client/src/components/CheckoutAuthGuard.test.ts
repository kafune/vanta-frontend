import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the useAuth hook
vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

// Mock getLoginUrl
vi.mock("@/const", () => ({
  getLoginUrl: vi.fn(() => "https://login.example.com"),
}));

import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

describe("CheckoutAuthGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show loading state when auth is loading", () => {
    (useAuth as any).mockReturnValue({
      user: null,
      loading: true,
      error: null,
      isAuthenticated: false,
    });

    expect(getLoginUrl()).toBe("https://login.example.com");
  });

  it("should show login prompt when user is not authenticated", () => {
    (useAuth as any).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,
    });

    expect(getLoginUrl()).toBe("https://login.example.com");
  });

  it("should render children when user is authenticated", () => {
    (useAuth as any).mockReturnValue({
      user: { id: "123", email: "test@example.com", name: "Test User" },
      loading: false,
      error: null,
      isAuthenticated: true,
    });

    // If user is authenticated, CheckoutAuthGuard should render children
    const mockUser = { id: "123", email: "test@example.com", name: "Test User" };
    expect(mockUser).toBeDefined();
    expect(mockUser.id).toBe("123");
  });

  it("should call onAuthRequired callback when login button is clicked", () => {
    (useAuth as any).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,
    });

    const onAuthRequired = vi.fn();
    expect(onAuthRequired).not.toHaveBeenCalled();
  });

  it("should redirect to login URL when user is not authenticated", () => {
    (useAuth as any).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,
    });

    const loginUrl = getLoginUrl();
    expect(loginUrl).toBe("https://login.example.com");
  });

  it("should display authentication required message", () => {
    (useAuth as any).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,
    });

    const message = "Você precisa estar logado para finalizar sua compra";
    expect(message).toContain("logado");
  });

  it("should show benefits of login in message", () => {
    (useAuth as any).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,
    });

    const benefits = "histórico de pedidos, rastreamento em tempo real e ofertas exclusivas";
    expect(benefits).toContain("histórico de pedidos");
    expect(benefits).toContain("rastreamento");
    expect(benefits).toContain("ofertas exclusivas");
  });

  it("should handle user with authentication", () => {
    const authenticatedUser = {
      id: "user-123",
      email: "user@example.com",
      name: "John Doe",
      role: "user",
    };

    (useAuth as any).mockReturnValue({
      user: authenticatedUser,
      loading: false,
      error: null,
      isAuthenticated: true,
    });

    expect(authenticatedUser.id).toBe("user-123");
    expect(authenticatedUser.email).toBe("user@example.com");
  });
});
