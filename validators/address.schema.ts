import { z } from "zod";

export const createAddressSchema = z.object({
    address: z
        .string()
        .min(1, "Address is required")
        .max(50, "Address must be at most 50 characters"),
});
