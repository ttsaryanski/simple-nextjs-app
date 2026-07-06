import {
    getAllProductsCount,
    getLowStockProductsCount,
    getTotalProducts,
    getRecentProducts,
} from "../../repositories/product.repository";

export async function getDashboardStats(userId: string) {
    const [productsCount, lowStock, totalProductsPrisma, recentProductsPrisma] =
        await Promise.all([
            getAllProductsCount(userId),
            getLowStockProductsCount(userId),
            getTotalProducts(userId),
            getRecentProducts(userId),
        ]);

    const totalProducts = totalProductsPrisma.map((product) => ({
        price: Number(product.price),
        quantity: product.quantity,
        createdAt: product.createdAt,
    }));

    const recentProducts = recentProductsPrisma.map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        price: Number(product.price),
        quantity: product.quantity,
        lowStockAt: product.lowStockAt,
        userId: product.userId,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
    }));

    const totalValue = totalProducts.reduce(
        (sum, product) =>
            sum + Number(product.price) * Number(product.quantity),
        0,
    );

    const inStockCount = totalProducts.filter(
        (p) => Number(p.quantity) > 5,
    ).length;
    const inStockPercentage =
        productsCount > 0
            ? Math.round((inStockCount / productsCount) * 100)
            : 0;

    const lowStockCount = totalProducts.filter(
        (p) => Number(p.quantity) <= 5 && Number(p.quantity) >= 1,
    ).length;
    const lowStockPercentage =
        productsCount > 0
            ? Math.round((lowStockCount / productsCount) * 100)
            : 0;

    const outOfStockCount = totalProducts.filter(
        (p) => Number(p.quantity) === 0,
    ).length;
    const outOfStockPercentage =
        productsCount > 0
            ? Math.round((outOfStockCount / productsCount) * 100)
            : 0;

    return {
        productsCount,
        lowStock,
        totalProducts,
        recentProducts,
        totalValue,
        inStockCount,
        inStockPercentage,
        lowStockCount,
        lowStockPercentage,
        outOfStockCount,
        outOfStockPercentage,
    };
}
