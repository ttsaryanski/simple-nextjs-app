import { z } from "zod";

export const createProductSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    price: z.coerce.number().nonnegative("Price must be a non-negative number"),
    quantity: z.coerce
        .number()
        .int()
        .min(0, "Quantity must be a non-negative integer"),
    sku: z.string().optional(),
    lowStockAt: z.coerce
        .number()
        .int()
        .min(0, "Low Stock At must be a non-negative integer")
        .optional(),
});
