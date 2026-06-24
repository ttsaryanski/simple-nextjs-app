"use server";

import { getCurrentUser } from "@/lib/auth";
import { getDashboardStats } from "@/lib/product/product.stats";
import { getWeeklyProductsData } from "@/lib/product/product.analytics";
import {
    getAllProductsCountWithQuery,
    getAllProductsWithQuery,
    deleteProductById,
    createProduct as createProductRepo,
} from "@/repositories/product.repository";
import { createProductSchema } from "@/validators/products.schema";

import { redirect } from "next/navigation";

let user;
export async function getDashboardData() {
    user = await getCurrentUser();
    if (!user) {
        redirect("/sign-in");
    }

    const [stats, weeklyProductsData] = await Promise.all([
        getDashboardStats(user.id),
        getWeeklyProductsData(user.id),
    ]);

    return {
        stats,
        weeklyProductsData,
    };
}

export async function getProductsPaginated(
    query: string,
    page: number,
    pageSize: number,
) {
    user = await getCurrentUser();
    if (!user) {
        redirect("/sign-in");
    }

    const where = {
        userId: user.id,
        ...(query
            ? { name: { contains: query, mode: "insensitive" as const } }
            : {}),
    };
    const totalCount = await getAllProductsCountWithQuery(where);
    const products = await getAllProductsWithQuery(where, page, pageSize);

    return {
        totalCount,
        products,
    };
}

export async function deleteProduct(productId: string) {
    user = await getCurrentUser();
    if (!user) {
        redirect("/sign-in");
    }

    if (!productId) {
        throw new Error("Product ID is required");
    }

    await deleteProductById(productId, user.id);
}

export async function createProduct(formData: FormData) {
    user = await getCurrentUser();
    if (!user) {
        redirect("/sign-in");
    }

    const parsedData = createProductSchema.safeParse({
        name: formData.get("name"),
        price: formData.get("price"),
        quantity: formData.get("quantity"),
        sku: formData.get("sku") || undefined,
        lowStockAt: formData.get("lowStockAt") || undefined,
    });

    if (!parsedData.success) {
        throw new Error("Validation failed");
    }

    try {
        await createProductRepo({
            ...parsedData.data,
            userId: user.id,
        });
    } catch {
        throw new Error("Failed to create product");
    }

    redirect("/inventory");
}
