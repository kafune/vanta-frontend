import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { sendOrderConfirmationEmail, sendShipmentNotificationEmail, sendDeliveryUpdateEmail } from "./email";
import { reviewsRouter } from "./routers/reviews";
import { couponsRouter } from "./routers/coupons";
import { cashbackRouter } from "./routers/cashback";
import { adminRouter } from "./routers/admin";
import { wishlistRouter } from "./routers/wishlist";
import { searchRouter } from "./routers/search";
import { notificationsRouter } from "./routers/notifications";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  reviews: reviewsRouter,
  coupons: couponsRouter,
  cashback: cashbackRouter,
  admin: adminRouter,
  wishlist: wishlistRouter,
  search: searchRouter,
  notifications: notificationsRouter,

  email: router({
    sendOrderConfirmation: publicProcedure
      .input(
        z.object({
          orderId: z.string(),
          trackingNumber: z.string(),
          customerEmail: z.string().email(),
          customerName: z.string().optional(),
          items: z.array(
            z.object({
              name: z.string(),
              quantity: z.number(),
              price: z.number(),
              size: z.string().optional(),
            })
          ),
          subtotal: z.number(),
          tax: z.number(),
          shipping: z.number(),
          total: z.number(),
          estimatedDelivery: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const success = await sendOrderConfirmationEmail(input);
        return { success };
      }),

    sendShipmentNotification: publicProcedure
      .input(
        z.object({
          orderId: z.string(),
          trackingNumber: z.string(),
          customerEmail: z.string().email(),
          customerName: z.string().optional(),
          carrier: z.string(),
          estimatedDelivery: z.string(),
          trackingUrl: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const success = await sendShipmentNotificationEmail(input);
        return { success };
      }),

    sendDeliveryUpdate: publicProcedure
      .input(
        z.object({
          orderId: z.string(),
          trackingNumber: z.string(),
          customerEmail: z.string().email(),
          customerName: z.string().optional(),
          status: z.enum(["in_transit", "out_for_delivery", "delivered"]),
          location: z.string(),
          timestamp: z.date(),
          trackingUrl: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const success = await sendDeliveryUpdateEmail(input);
        return { success };
      }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
