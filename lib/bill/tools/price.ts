import { BillWithAddressAndConsumption } from "@/interfaces/Bill";
import { Price } from "@/interfaces/Price";

export function priceForBills(
    bills: BillWithAddressAndConsumption[],
    prices: Price[],
) {
    let isPriceUp: boolean = false;
    let lastDayPrice: number | null = null;
    let lastNightPrice: number | null = null;
    let lastBillDayPrice: number | null = null;
    let lastBillNightPrice: number | null = null;
    let isLastPriceLastBillPrice: boolean = false;
    let lastPriceStart: Date | null = null;

    if (prices.length === 0) {
        return {
            isPriceUp,
            lastDayPrice,
            lastNightPrice,
            lastBillDayPrice,
            lastBillNightPrice,
            isLastPriceLastBillPrice,
            lastPriceStart,
        };
    }

    if (prices.length >= 2) {
        isPriceUp =
            Number(prices[prices.length - 1]?.day_price) >
            Number(prices[prices.length - 2]?.day_price);
    }

    if (prices.length > 0) {
        lastDayPrice = Number(prices[prices.length - 1]?.day_price);
        lastNightPrice = Number(prices[prices.length - 1]?.night_price);
    }

    if (bills.length > 0) {
        const lastBill = bills[bills.length - 1];
        const lastBillPeriod = new Date(lastBill.period);

        let matchedPriceIndex = -1;
        for (let i = prices.length - 1; i >= 0; i--) {
            const periodStart = new Date(prices[i].period_start);
            const periodEnd = new Date(prices[i].period_end);

            if (lastBillPeriod >= periodStart && lastBillPeriod <= periodEnd) {
                matchedPriceIndex = i;
                break;
            }
        }

        if (matchedPriceIndex !== -1) {
            lastBillDayPrice = Number(prices[matchedPriceIndex]?.day_price);
            lastBillNightPrice = Number(prices[matchedPriceIndex]?.night_price);
            isLastPriceLastBillPrice = matchedPriceIndex === prices.length - 1;
        }
    }

    return {
        isPriceUp,
        lastDayPrice,
        lastNightPrice,
        lastBillDayPrice,
        lastBillNightPrice,
        isLastPriceLastBillPrice,
        lastPriceStart: prices[prices.length - 1]?.period_start || null,
    };
}
