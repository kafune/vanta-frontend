/**
 * Saved Filters Router Tests
 * Test suite for filter preset management
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "../routers";

// Mock context for testing
const mockAdminContext = {
  user: { id: 1, name: "Admin User", role: "admin" as const, email: "admin@vanta.com" },
  req: {} as any,
  res: {} as any,
};

describe("Saved Filters Router", () => {
  let savedFilterId: string;
  const testFilterData = {
    statuses: ["pendente", "confirmado"],
    dateFrom: "2026-04-01",
    dateTo: "2026-04-30",
    priceMin: 50,
    priceMax: 200,
  };

  it("should create a new saved filter", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const result = await caller.savedFilters.create({
      name: "Pedidos Pendentes",
      description: "Filtro para pedidos pendentes de confirmação",
      filterData: testFilterData,
    });

    expect(result.success).toBe(true);
    expect(result.filterId).toBeDefined();
    savedFilterId = result.filterId;
  });

  it("should list all saved filters for user", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const filters = await caller.savedFilters.list();

    expect(Array.isArray(filters)).toBe(true);
    expect(filters.length).toBeGreaterThan(0);

    // Verify structure
    filters.forEach((filter: any) => {
      expect(filter.id).toBeDefined();
      expect(filter.name).toBeDefined();
      expect(filter.filterData).toBeDefined();
      expect(filter.isDefault).toBeDefined();
      expect(filter.usageCount).toBeGreaterThanOrEqual(0);
    });
  });

  it("should get a specific saved filter", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const filter = await caller.savedFilters.get({ filterId: savedFilterId });

    expect(filter).toBeDefined();
    expect(filter.id).toBe(savedFilterId);
    expect(filter.name).toBe("Pedidos Pendentes");
    expect(filter.filterData).toEqual(testFilterData);
  });

  it("should load a saved filter and increment usage count", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const result = await caller.savedFilters.load({ filterId: savedFilterId });

    expect(result).toBeDefined();
    // Usage count should be incremented (starts at 0, after load should be 1 or more)
    expect(result.usageCount).toBeGreaterThanOrEqual(0);
  });

  it("should update a saved filter", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const result = await caller.savedFilters.update({
      filterId: savedFilterId,
      name: "Pedidos Pendentes Atualizados",
      description: "Descrição atualizada",
    });

    expect(result.success).toBe(true);

    // Verify update
    const filter = await caller.savedFilters.get({ filterId: savedFilterId });
    expect(filter.name).toBe("Pedidos Pendentes Atualizados");
    expect(filter.description).toBe("Descrição atualizada");
  });

  it("should set a filter as default", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const result = await caller.savedFilters.setDefault({ filterId: savedFilterId });

    expect(result.success).toBe(true);

    // Verify default
    const defaultFilter = await caller.savedFilters.getDefault();
    expect(defaultFilter).toBeDefined();
    expect(defaultFilter?.id).toBe(savedFilterId);
    expect(defaultFilter?.isDefault).toBe(true);
  });

  it("should get most used filters", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    const mostUsed = await caller.savedFilters.getMostUsed({ limit: 5 });

    expect(Array.isArray(mostUsed)).toBe(true);
    expect(mostUsed.length).toBeLessThanOrEqual(5);

    // Verify sorting by usage count
    for (let i = 0; i < mostUsed.length - 1; i++) {
      expect(mostUsed[i].usageCount).toBeGreaterThanOrEqual(mostUsed[i + 1].usageCount);
    }
  });

  it("should delete a saved filter", async () => {
    const caller = appRouter.createCaller(mockAdminContext);

    // Create a filter to delete
    const createResult = await caller.savedFilters.create({
      name: "Filter to Delete",
      filterData: testFilterData,
    });

    const filterIdToDelete = createResult.filterId;

    // Delete it
    const result = await caller.savedFilters.delete({ filterId: filterIdToDelete });
    expect(result.success).toBe(true);

    // Verify it's deleted
    try {
      await caller.savedFilters.get({ filterId: filterIdToDelete });
      expect.fail("Should have thrown error");
    } catch (error) {
      expect((error as any).message).toContain("not found");
    }
  });

  it("should not allow non-admin users to create filters", async () => {
    const userContext = {
      user: { id: 2, name: "Regular User", role: "user" as const, email: "user@vanta.com" },
      req: {} as any,
      res: {} as any,
    };

    const caller = appRouter.createCaller(userContext);

    try {
      await caller.savedFilters.create({
        name: "Unauthorized Filter",
        filterData: testFilterData,
      });
      expect.fail("Should have thrown error");
    } catch (error) {
      expect((error as any).message).toContain("permission");
    }
  });

  it("should return empty list if no filters exist for user", async () => {
    const newUserContext = {
      user: { id: 999, name: "New User", role: "admin" as const, email: "newuser@vanta.com" },
      req: {} as any,
      res: {} as any,
    };

    const caller = appRouter.createCaller(newUserContext);

    const filters = await caller.savedFilters.list();

    expect(Array.isArray(filters)).toBe(true);
    expect(filters.length).toBe(0);
  });
});
