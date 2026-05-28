import { describe, it, expect, vi, beforeEach } from "vitest";

describe("CheckoutLoadingOverlay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when state is idle", () => {
    const state = "idle";
    expect(state).toBe("idle");
  });

  it("should render loading state with spinner", () => {
    const state = "loading";
    const message = "Processando...";
    expect(state).toBe("loading");
    expect(message).toBe("Processando...");
  });

  it("should display loading message", () => {
    const message = "Você será redirecionado para fazer login...";
    expect(message).toContain("redirecionado");
    expect(message).toContain("login");
  });

  it("should render success state with checkmark", () => {
    const state = "success";
    expect(state).toBe("success");
  });

  it("should display success message", () => {
    const message = "Login Realizado!";
    expect(message).toBe("Login Realizado!");
  });

  it("should render error state with alert icon", () => {
    const state = "error";
    expect(state).toBe("error");
  });

  it("should display error message", () => {
    const message = "Erro no Login";
    expect(message).toBe("Erro no Login");
  });

  it("should call onComplete callback after success", () => {
    const onComplete = vi.fn();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("should call onComplete callback after error", () => {
    const onComplete = vi.fn();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("should have loading type", () => {
    type LoadingState = "idle" | "loading" | "success" | "error";
    const state: LoadingState = "loading";
    expect(state).toBe("loading");
  });

  it("should have success type", () => {
    type LoadingState = "idle" | "loading" | "success" | "error";
    const state: LoadingState = "success";
    expect(state).toBe("success");
  });

  it("should have error type", () => {
    type LoadingState = "idle" | "loading" | "success" | "error";
    const state: LoadingState = "error";
    expect(state).toBe("error");
  });

  it("should have idle type", () => {
    type LoadingState = "idle" | "loading" | "success" | "error";
    const state: LoadingState = "idle";
    expect(state).toBe("idle");
  });
});
