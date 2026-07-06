import { TrendingUp } from "lucide-react";

export type statsProductsProps = {
    productsCount: number;
    lowStock: number;
    totalProducts: {
        price: number;
        quantity: number;
        createdAt: Date;
    }[];
    recentProducts: {
        id: string;
        name: string;
        sku: string | null;
        price: number;
        quantity: number;
        lowStockAt: number | null;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }[];
    totalValue: number;
    inStockCount: number;
    inStockPercentage: number;
    lowStockCount: number;
    lowStockPercentage: number;
    outOfStockCount: number;
    outOfStockPercentage: number;
};
const ProductsMetrics = ({ stats }: { stats: statsProductsProps }) => {
    return (
        <>
            <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                    {stats.productsCount}
                </div>
                <div className="text-sm text-gray-600">Total Products</div>
                <div className="flex items-center justify-center mt-1">
                    <span className="text-xs text-green-600">
                        +{stats.productsCount}
                    </span>
                    <TrendingUp className="w-3 h-3 text-green-600 ml-1" />
                </div>
            </div>

            <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                    ${Number(stats.totalValue).toFixed(0)}
                </div>
                <div className="text-sm text-gray-600">Total Value</div>
                <div className="flex items-center justify-center mt-1">
                    <span className="text-xs text-green-600">
                        +${Number(stats.totalValue).toFixed(0)}
                    </span>
                    <TrendingUp className="w-3 h-3 text-green-600 ml-1" />
                </div>
            </div>

            <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                    {stats.lowStock}
                </div>
                <div className="text-sm text-gray-600">Low Stock</div>
                <div className="flex items-center justify-center mt-1">
                    <span className="text-xs text-green-600">
                        +{stats.lowStock}
                    </span>
                    <TrendingUp className="w-3 h-3 text-green-600 ml-1" />
                </div>
            </div>
        </>
    );
};

export default ProductsMetrics;
