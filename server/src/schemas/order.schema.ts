import { z } from "zod";

const colombianPhoneRegex = /^\d{10}$/;

export const createOrderSchema = z
  .object({
    productId: z.coerce.number().int().positive("Producto inválido"),
    quantity: z.coerce.number().int().min(1, "Cantidad inválida").default(1),
    buyerName: z.string().trim().min(3, "Nombre completo requerido"),
    buyerEmail: z.string().trim().email("Correo electrónico inválido"),
    buyerPhone: z.string().trim().regex(colombianPhoneRegex, "Teléfono debe tener 10 dígitos"),
    buyerAddress: z.string().trim().min(3, "Dirección requerida"),
    buyerCity: z.string().trim().min(2, "Ciudad requerida"),
    paymentMethod: z.enum(["card", "nequi", "pse"], {
      errorMap: () => ({ message: "Selecciona un método de pago" }),
    }),
    nequiPhone: z.string().optional(),
    pseBank: z.string().optional(),
    psePersonType: z.enum(["natural", "juridica"]).optional(),
    pseId: z.string().optional(),
    cardHolder: z.string().optional(),
    cardNumber: z.string().optional(),
    cardExpiry: z.string().optional(),
    cardCvv: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === "card") {
      const holder = data.cardHolder?.trim() ?? "";
      const number = (data.cardNumber ?? "").replace(/\s+/g, "");
      const expiry = (data.cardExpiry ?? "").trim();
      const cvv = (data.cardCvv ?? "").trim();

      if (holder.length < 3) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nombre del titular requerido", path: ["cardHolder"] });
      }
      if (!/^\d{13,19}$/.test(number)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Número de tarjeta inválido", path: ["cardNumber"] });
      }
      if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(expiry)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Vencimiento inválido (MM/AA)", path: ["cardExpiry"] });
      }
      if (!/^\d{3,4}$/.test(cvv)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "CVV inválido", path: ["cardCvv"] });
      }
      return;
    }

    if (data.paymentMethod === "nequi") {
      if (!data.nequiPhone || !colombianPhoneRegex.test(data.nequiPhone.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Teléfono Nequi debe tener 10 dígitos",
          path: ["nequiPhone"],
        });
      }
      return;
    }

    if (data.paymentMethod === "pse") {
      if (!data.pseBank || data.pseBank.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Selecciona o indica tu banco",
          path: ["pseBank"],
        });
      }
      if (!data.psePersonType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Selecciona tipo de persona",
          path: ["psePersonType"],
        });
      }
      if (!data.pseId || data.pseId.trim().length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Número de identificación requerido",
          path: ["pseId"],
        });
      }
    }
  });

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const createCartOrderSchema = z
  .object({
    items: z
      .array(
        z.object({
          productId: z.coerce.number().int().positive(),
          quantity: z.coerce.number().int().min(1),
        })
      )
      .min(1, "El carrito está vacío"),
    buyerName: z.string().trim().min(3, "Nombre completo requerido"),
    buyerEmail: z.string().trim().email("Correo electrónico inválido"),
    buyerPhone: z.string().trim().regex(colombianPhoneRegex, "Teléfono debe tener 10 dígitos"),
    buyerAddress: z.string().trim().min(3, "Dirección requerida"),
    buyerCity: z.string().trim().min(2, "Ciudad requerida"),
    paymentMethod: z.enum(["card", "nequi", "pse"], {
      errorMap: () => ({ message: "Selecciona un método de pago" }),
    }),
    nequiPhone: z.string().optional(),
    pseBank: z.string().optional(),
    psePersonType: z.enum(["natural", "juridica"]).optional(),
    pseId: z.string().optional(),
    cardHolder: z.string().optional(),
    cardNumber: z.string().optional(),
    cardExpiry: z.string().optional(),
    cardCvv: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === "card") {
      const holder = data.cardHolder?.trim() ?? "";
      const number = (data.cardNumber ?? "").replace(/\s+/g, "");
      const expiry = (data.cardExpiry ?? "").trim();
      const cvv = (data.cardCvv ?? "").trim();

      if (holder.length < 3) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nombre del titular requerido", path: ["cardHolder"] });
      }
      if (!/^\d{13,19}$/.test(number)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Número de tarjeta inválido", path: ["cardNumber"] });
      }
      if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(expiry)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Vencimiento inválido (MM/AA)", path: ["cardExpiry"] });
      }
      if (!/^\d{3,4}$/.test(cvv)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "CVV inválido", path: ["cardCvv"] });
      }
      return;
    }
    if (data.paymentMethod === "nequi") {
      if (!data.nequiPhone || !colombianPhoneRegex.test(data.nequiPhone.trim())) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Teléfono Nequi debe tener 10 dígitos", path: ["nequiPhone"] });
      }
      return;
    }
    if (data.paymentMethod === "pse") {
      if (!data.pseBank || data.pseBank.trim().length < 2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Selecciona o indica tu banco", path: ["pseBank"] });
      }
      if (!data.psePersonType) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Selecciona tipo de persona", path: ["psePersonType"] });
      }
      if (!data.pseId || data.pseId.trim().length < 5) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Número de identificación requerido", path: ["pseId"] });
      }
    }
  });

export type CreateCartOrderInput = z.infer<typeof createCartOrderSchema>;
