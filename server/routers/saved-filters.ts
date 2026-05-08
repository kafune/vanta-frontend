/**
 * Saved Filters Router
 * Manage saved filter presets for quick access
 */

import { adminProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { savedFilters } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const savedFiltersRouter = router({
  // Create a new saved filter
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        filterData: z.record(z.string(), z.any()),
        isDefault: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const filterId = `filter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      await db.insert(savedFilters).values({
        id: filterId,
        userId: ctx.user.id,
        name: input.name,
        description: input.description || null,
        filterData: JSON.stringify(input.filterData),
        isDefault: input.isDefault ? 1 : 0,
        usageCount: 0,
      } as any);

      return { success: true, filterId };
    }),

  // Get all saved filters for current user
  list: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const filters = await db
      .select()
      .from(savedFilters)
      .where(eq(savedFilters.userId, ctx.user.id));

    return filters.map((f: any) => ({
      ...f,
      filterData: JSON.parse(f.filterData),
      isDefault: f.isDefault === 1,
    }));
  }),

  // Get a specific saved filter
  get: adminProcedure
    .input(z.object({ filterId: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const filter = await db
        .select()
        .from(savedFilters)
        .where(
          and(
            eq(savedFilters.id, input.filterId),
            eq(savedFilters.userId, ctx.user.id)
          )
        );

      if (filter.length === 0) throw new Error("Filter not found");

      const result = filter[0] as any;
      return {
        ...result,
        filterData: JSON.parse(result.filterData),
        isDefault: result.isDefault === 1,
      };
    }),

  // Load a saved filter (increment usage count)
  load: adminProcedure
    .input(z.object({ filterId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const filter = await db
        .select()
        .from(savedFilters)
        .where(
          and(
            eq(savedFilters.id, input.filterId),
            eq(savedFilters.userId, ctx.user.id)
          )
        );

      if (filter.length === 0) throw new Error("Filter not found");

      // Increment usage count
      const currentFilter = filter[0] as any;
      await db
        .update(savedFilters)
        .set({ usageCount: (currentFilter.usageCount || 0) + 1 })
        .where(eq(savedFilters.id, input.filterId));

      return {
        ...currentFilter,
        filterData: JSON.parse(currentFilter.filterData),
        isDefault: currentFilter.isDefault === 1,
      };
    }),

  // Update a saved filter
  update: adminProcedure
    .input(
      z.object({
        filterId: z.string(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        filterData: z.record(z.string(), z.any()).optional(),
        isDefault: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const filter = await db
        .select()
        .from(savedFilters)
        .where(
          and(
            eq(savedFilters.id, input.filterId),
            eq(savedFilters.userId, ctx.user.id)
          )
        );

      if (filter.length === 0) throw new Error("Filter not found");

      const updateData: any = {};
      if (input.name) updateData.name = input.name;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.filterData) updateData.filterData = JSON.stringify(input.filterData);
      if (input.isDefault !== undefined) updateData.isDefault = input.isDefault ? 1 : 0;

      await db
        .update(savedFilters)
        .set(updateData)
        .where(eq(savedFilters.id, input.filterId));

      return { success: true };
    }),

  // Delete a saved filter
  delete: adminProcedure
    .input(z.object({ filterId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const filter = await db
        .select()
        .from(savedFilters)
        .where(
          and(
            eq(savedFilters.id, input.filterId),
            eq(savedFilters.userId, ctx.user.id)
          )
        );

      if (filter.length === 0) throw new Error("Filter not found");

      await db.delete(savedFilters).where(eq(savedFilters.id, input.filterId));

      return { success: true };
    }),

  // Get most used filters
  getMostUsed: adminProcedure
    .input(z.object({ limit: z.number().default(5) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const filters = await db
        .select()
        .from(savedFilters)
        .where(eq(savedFilters.userId, ctx.user.id));

      return (filters as any[])
        .map((f) => ({
          ...f,
          filterData: JSON.parse(f.filterData),
          isDefault: f.isDefault === 1,
        }))
        .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
        .slice(0, input.limit);
    }),

  // Get default filter
  getDefault: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const filters = await db
      .select()
      .from(savedFilters)
      .where(
        and(
          eq(savedFilters.userId, ctx.user.id),
          eq(savedFilters.isDefault, 1)
        )
      );

    if (filters.length === 0) return null;

    const result = filters[0] as any;
    return {
      ...result,
      filterData: JSON.parse(result.filterData),
      isDefault: true,
    };
  }),

  // Set default filter
  setDefault: adminProcedure
    .input(z.object({ filterId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const filter = await db
        .select()
        .from(savedFilters)
        .where(
          and(
            eq(savedFilters.id, input.filterId),
            eq(savedFilters.userId, ctx.user.id)
          )
        );

      if (filter.length === 0) throw new Error("Filter not found");

      // Clear previous default
      await db
        .update(savedFilters)
        .set({ isDefault: 0 })
        .where(
          and(
            eq(savedFilters.userId, ctx.user.id),
            eq(savedFilters.isDefault, 1)
          )
        );

      // Set new default
      await db
        .update(savedFilters)
        .set({ isDefault: 1 })
        .where(eq(savedFilters.id, input.filterId));

      return { success: true };
    }),
});
