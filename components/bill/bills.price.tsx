import { statsProps } from "@/components/bill/bills.metrics";
import PriceChart from "@/components/price/price.chart";

import { AnalyticsPeriod } from "@/lib/price/price.analytics";

type priceStatsProps =
    | {
          status: "no-data";
          data: AnalyticsPeriod[];
      }
    | {
          status: "ok";
          data: AnalyticsPeriod[];
      };

const BillsPrice = ({
    stats,
    priceStats,
}: {
    stats: statsProps;
    priceStats: priceStatsProps;
}) => {
    return (
        <>
            {!stats.isLastPriceLastBillPrice ? (
                <>
                    <div className="flex items-center justify-start gap-2">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-[#fc8600]" />
                                <span>Day ({stats.lastBillDayPrice} €)</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-[#48494d]" />
                                <span>
                                    Night ({stats.lastBillNightPrice} €)
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-baseline justify-start gap-2 mt-1 mb-1 text-sm text-gray-600">
                        <p className="text-red-500">
                            New price from:{" "}
                            {stats.lastPriceStart?.toLocaleDateString() || ""}
                        </p>
                    </div>

                    <div className="flex items-baseline justify-start gap-2">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-[#fc8600]" />
                                <span>Day ({stats.lastDayPrice} €)</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-[#48494d]" />
                                <span>Night ({stats.lastNightPrice} €)</span>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex items-baseline justify-start gap-2">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-[#fc8600]" />
                            <span>Day ({stats.lastDayPrice} €)</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-[#48494d]" />
                            <span>Night ({stats.lastNightPrice} €)</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col items-start justify-center mt-3">
                <div className="flex items-baseline justify-start gap-2 mt-1 mb-1 text-sm text-gray-600">
                    <p>
                        Changes compared to previous period in %{" "}
                        {priceStats.status === "no-data" ? (
                            <span className="text-red-500">
                                - No data available
                            </span>
                        ) : (
                            ""
                        )}
                    </p>
                </div>
                <PriceChart data={priceStats.data.reverse()} />
            </div>
        </>
    );
};

export default BillsPrice;
