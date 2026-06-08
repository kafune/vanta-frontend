/**
 * Uploads Router — recebe imagens em base64 e grava via storage self-hosted.
 * - uploadImage: só admin (imagens de catálogo: produtos/coleções).
 * - uploadStamp: público (estampa do cliente no personalizador), com limite menor.
 */

import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { saveImageDataUrl } from "../_core/uploads";

export const uploadsRouter = router({
  uploadImage: adminProcedure
    .input(
      z.object({
        dataUrl: z.string().min(1),
        prefix: z.string().max(32).optional(),
      })
    )
    .mutation(({ input }) =>
      saveImageDataUrl(input.dataUrl, { prefix: input.prefix ?? "product", maxBytes: 10 * 1024 * 1024 })
    ),

  uploadStamp: publicProcedure
    .input(z.object({ dataUrl: z.string().min(1) }))
    .mutation(({ input }) =>
      saveImageDataUrl(input.dataUrl, { prefix: "stamp", maxBytes: 8 * 1024 * 1024 })
    ),
});
