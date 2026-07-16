import { statsProps } from "@/components/bill/bills.metrics";

const BillsLevel = ({ stats }: { stats: statsProps }) => {
    return (
        <>
            {stats.slicedBills.map((bill, key) => {
                const idx = stats.slicedBills.indexOf(bill);
                const billLevel =
                    idx < 3 && stats.slicedBills.length > 3 ? 0 : 1;
                const periodLabel = bill.period.toLocaleDateString("en-GB", {
                    month: "long",
                    year: "numeric",
                });

                const bgColors = ["bg-red-600", "bg-green-600"];
                const textColors = ["text-red-600", "text-green-600"];
                return (
                    <div
                        key={key}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                    >
                        <div className="flex items-center space-x-3">
                            <div
                                className={`w-3 h-3 rounded-full ${bgColors[billLevel]}`}
                            />
                            <span className="text-sm font-medium text-gray-900">
                                {periodLabel}
                            </span>
                        </div>
                        <div
                            className={`text-sm font-medium ${textColors[billLevel]}`}
                        >
                            {bill.total_consumption_kwh} kwh
                        </div>
                    </div>
                );
            })}
        </>
    );
};

export default BillsLevel;
