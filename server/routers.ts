import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { authRouter } from "./routers/auth";
import { uploadsRouter } from "./routers/uploads";
import { sendOrderConfirmationEmail, sendShipmentNotificationEmail, sendDeliveryUpdateEmail } from "./email";
import { reviewsRouter } from "./routers/reviews";
import { couponsRouter } from "./routers/coupons";
import { cashbackRouter } from "./routers/cashback";
import { adminRouter } from "./routers/admin";
import { wishlistRouter } from "./routers/wishlist";
import { searchRouter } from "./routers/search";
import { notificationsRouter } from "./routers/notifications";
import { analyticsRouter } from "./routers/analytics";
import { savedFiltersRouter } from "./routers/saved-filters";
import { pixRouter } from "./routers/pix";
import { productsRouter } from "./routers/products";
import { stripeRouter } from "./routers/stripe";
import { inventoryRouter } from "./routers/inventory";
import { promotionsRouter } from "./routers/promotions";
import { monitoringRouter } from "./routers/monitoring";
import { emailMarketingRouter } from "./routers/email-marketing";
import { collectionsRouter } from "./routers/collections";
import { ordersRouter } from "./routers/orders";
import { emailVerificationRouter } from "./routers/email-verification";
import { wishlistSharingRouter } from "./routers/wishlist-sharing";
import { recommendationsRouter } from "./routers/recommendations";
import { newsletterRouter } from "./routers/newsletter";
import { gdprRouter } from "./routers/gdpr";
import { productsFilterRouter } from "./routers/products-filter";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: authRouter,
  uploads: uploadsRouter,

  reviews: reviewsRouter,
  coupons: couponsRouter,
  cashback: cashbackRouter,
  admin: adminRouter,
  wishlist: wishlistRouter,
  search: searchRouter,
  notifications: notificationsRouter,
  analytics: analyticsRouter,
  savedFilters: savedFiltersRouter,
  pix: pixRouter,
  products: productsRouter,
  stripe: stripeRouter,
  inventory: inventoryRouter,
  promotions: promotionsRouter,
  monitoring: monitoringRouter,
  emailMarketing: emailMarketingRouter,
  collections: collectionsRouter,
  orders: ordersRouter,
  emailVerification: emailVerificationRouter,
  wishlistSharing: wishlistSharingRouter,
  recommendations: recommendationsRouter,
  newsletter: newsletterRouter,
  gdpr: gdprRouter,
  productsFilter: productsFilterRouter,

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
