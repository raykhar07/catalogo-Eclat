import { Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { ApiError } from "../middlewares/errorHandler";
import { AuthRequest } from "../middlewares/auth";

function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

function getCardBrand(cardNumber: string) {
  const clean = cardNumber.replace(/\s+/g, "");
  if (/^4/.test(clean)) return "visa";
  if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return "mastercard";
  return "card";
}

function toDecimal(value: number | string) {
  return new Prisma.Decimal(value);
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export async function createOrder(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, "Debes iniciar sesión para realizar la compra");
  }

  const {
    productId,
    quantity,
    buyerName,
    buyerEmail,
    buyerPhone,
    buyerAddress,
    buyerCity,
    paymentMethod,
  } = req.body;

  if (paymentMethod === "card") {
    throw new ApiError(400, "Pago con tarjeta no disponible en modo demo");
  }

  const product = await prisma.product.findUnique({
    where: { id: Number(productId) },
  });

  if (!product) {
    throw new ApiError(404, "Producto no encontrado");
  }

  const qty = Number(quantity) || 1;
  if (qty < 1) {
    throw new ApiError(400, "Cantidad inválida");
  }
  if (product.stock < qty) {
    throw new ApiError(400, "No hay suficiente stock para esta cantidad");
  }

  const unitPriceNumber = Number(product.price);
  const totalNumber = roundMoney(unitPriceNumber * qty);

  const paymentDetails: Record<string, unknown> = {
    paymentMethod,
  };

  if (paymentMethod === "nequi") {
    paymentDetails.nequiPhone = req.body.nequiPhone;
  }
  if (paymentMethod === "pse") {
    paymentDetails.pseBank = req.body.pseBank;
    paymentDetails.psePersonType = req.body.psePersonType;
    paymentDetails.pseId = req.body.pseId;
  }

  const orderNumber = generateOrderNumber();

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
        productId: product.id,
        userId,
        quantity: qty,
        unitPrice: toDecimal(unitPriceNumber),
        total: toDecimal(totalNumber),
        buyerName,
        buyerEmail,
        buyerPhone,
        buyerAddress,
        buyerCity,
        paymentMethod,
        cardBrand: null,
        cardLast4: null,
        paymentDetails: JSON.stringify(paymentDetails),
        status: "CONFIRMED",
      },
    });

    await tx.product.update({
      where: { id: product.id },
      data: {
        stock: {
          decrement: qty,
        },
      },
    });

    return created;
  });

  res.status(201).json({
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: Number(order.total),
      quantity: order.quantity,
      productId: order.productId,
    },
    message: "Pedido realizado con éxito",
  });
}

export async function createCartOrder(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, "Debes iniciar sesión para realizar la compra");
  }

  const { items, buyerName, buyerEmail, buyerPhone, buyerAddress, buyerCity, paymentMethod } = req.body as any;

  if (paymentMethod === "card") {
    throw new ApiError(400, "Pago con tarjeta no disponible en modo demo");
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "El carrito está vacío");
  }

  const productIds = items.map((i: any) => Number(i.productId));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  let totalNumber = 0;
  for (const item of items) {
    const pid = Number(item.productId);
    const qty = Number(item.quantity) || 0;
    const product = productMap.get(pid);
    if (!product) throw new ApiError(404, `Producto no encontrado (ID ${pid})`);
    if (qty < 1) throw new ApiError(400, "Cantidad inválida");
    if (product.stock < qty) throw new ApiError(400, `No hay suficiente stock para "${product.name}"`);
    totalNumber += roundMoney(Number(product.price) * qty);
  }

  const paymentDetails: Record<string, unknown> = { paymentMethod };
  if (paymentMethod === "nequi") paymentDetails.nequiPhone = req.body.nequiPhone;
  if (paymentMethod === "pse") {
    paymentDetails.pseBank = req.body.pseBank;
    paymentDetails.psePersonType = req.body.psePersonType;
    paymentDetails.pseId = req.body.pseId;
  }

  const orderNumber = generateOrderNumber();

  const order = await prisma.$transaction(async (tx) => {
    for (const item of items) {
      const pid = Number(item.productId);
      const qty = Number(item.quantity) || 0;
      await tx.product.update({
        where: { id: pid },
        data: { stock: { decrement: qty } },
      });
    }

    const firstProductId = Number(items[0].productId);
    const totalQty = items.reduce((sum: number, i: any) => sum + (Number(i.quantity) || 0), 0);
    const firstProduct = productMap.get(firstProductId)!;

    const created = await tx.order.create({
      data: {
        orderNumber,
        productId: firstProductId,
        userId,
        quantity: totalQty,
        unitPrice: toDecimal(Number(firstProduct.price)),
        total: toDecimal(roundMoney(totalNumber)),
        buyerName,
        buyerEmail,
        buyerPhone,
        buyerAddress,
        buyerCity,
        paymentMethod,
        cardBrand: null,
        cardLast4: null,
        paymentDetails: JSON.stringify(paymentDetails),
        status: "CONFIRMED",
      },
    });

    return created;
  });

  res.status(201).json({
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: Number(order.total),
      quantity: order.quantity,
      productId: order.productId,
    },
    message: "Pedido realizado con éxito",
  });
}

export async function getMyOrders(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, "Debes iniciar sesión");
  }

  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          brand: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ orders });
}
