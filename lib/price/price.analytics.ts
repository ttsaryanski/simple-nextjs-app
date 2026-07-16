import { getTotalBills } from "@/repositories/bill.repository";
import { getAllPrices } from "../../repositories/price.repository";

export type AnalyticsPeriod = {
    label: string;
    priceChangePct: number | null;
    consumptionChangePct: number | null;
    billChangePct: number | null;
};

export type AnalyticsResult =
    | {
          status: "ok";
          data: AnalyticsPeriod[];
      }
    | {
          status: "no-data";
          data: AnalyticsPeriod[]; // винаги поне 1 елемент
      };

const EMPTY_ANALYTICS_PERIOD: AnalyticsPeriod = {
    label: "",
    priceChangePct: null,
    consumptionChangePct: null,
    billChangePct: null,
};

function startOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function toPeriodLabel(start: Date, end: Date) {
    const fmt = (date: Date) =>
        `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;

    return `${fmt(start)} - ${fmt(end)}`;
}

function percentageChange(current: number, previous: number) {
    if (previous === 0) return null;
    return Number((((current - previous) / previous) * 100).toFixed(2));
}

function comparableMonthKey(date: Date) {
    return String(date.getMonth() + 1).padStart(2, "0");
}

export async function getPeriodicData(userId: string, addressId: string) {
    const totalBills = await getTotalBills(userId, addressId);
    const totalPrices = await getAllPrices();

    if (totalBills.length === 0 || totalPrices.length === 0) {
        return {
            status: "no-data",
            data: [EMPTY_ANALYTICS_PERIOD],
        } satisfies AnalyticsResult;
    }

    const bills = totalBills.map((bill) => ({
        ...bill,
        total: Number(bill.total),
        total_consumption_kwh: Number(bill.total_consumption_kwh),
        period: new Date(bill.period),
    }));

    const prices = totalPrices
        .map((price) => ({
            ...price,
            day_price: Number(price.day_price),
            night_price: Number(price.night_price),
            period_start: new Date(price.period_start),
            period_end: new Date(price.period_end),
        }))
        .sort((a, b) => a.period_start.getTime() - b.period_start.getTime());

    const latestBillDate = bills[bills.length - 1].period;

    let latestPriceIndex = prices.findIndex(
        (price) =>
            latestBillDate >= price.period_start &&
            latestBillDate <= price.period_end,
    );

    if (latestPriceIndex === -1) {
        latestPriceIndex = prices.findLastIndex(
            (price) => price.period_end <= latestBillDate,
        );
    }
    if (latestPriceIndex === -1) {
        latestPriceIndex = prices.findLastIndex(
            (price) => price.period_start <= latestBillDate,
        );
    }

    if (latestPriceIndex < 1) {
        return {
            status: "no-data",
            data: [EMPTY_ANALYTICS_PERIOD],
        } satisfies AnalyticsResult;
    }

    const selectedPeriods: { index: number; price: (typeof prices)[number] }[] =
        [];

    let currentIndex = latestPriceIndex;
    let referenceMonthKeys = new Set<string>();

    while (selectedPeriods.length < 3 && currentIndex >= 0) {
        const price = prices[currentIndex];
        const billsInPeriod = bills.filter(
            (b) =>
                b.period >= price.period_start && b.period <= price.period_end,
        );

        if (billsInPeriod.length === 0) {
            currentIndex--;
            continue;
        }

        const monthKeys = new Set(
            billsInPeriod.map((b) =>
                comparableMonthKey(startOfMonth(b.period)),
            ),
        );

        if (selectedPeriods.length === 0) {
            // Най-новият период
            selectedPeriods.push({ index: currentIndex, price });
            referenceMonthKeys = monthKeys;
        } else {
            const hasOverlap = Array.from(monthKeys).some((key) =>
                referenceMonthKeys.has(key),
            );

            if (hasOverlap || selectedPeriods.length < 2) {
                selectedPeriods.unshift({ index: currentIndex, price });
                if (hasOverlap) referenceMonthKeys = monthKeys;
            }
        }

        currentIndex--;
    }

    if (selectedPeriods.length < 2) {
        return {
            status: "no-data",
            data: [EMPTY_ANALYTICS_PERIOD],
        } satisfies AnalyticsResult;
    }

    const selectedPrices = selectedPeriods.map((p) => p.price);

    const periodMonthlyStats = selectedPrices.map((price) => {
        const periodStartMonth = startOfMonth(price.period_start);
        const periodEndMonth = startOfMonth(price.period_end);

        const monthly = new Map<
            string,
            {
                month: Date;
                key: string;
                totalConsumptionKwh: number;
                totalBill: number;
            }
        >();

        for (const bill of bills) {
            if (
                bill.period < price.period_start ||
                bill.period > price.period_end
            )
                continue;

            const billMonth = startOfMonth(bill.period);
            if (billMonth < periodStartMonth || billMonth > periodEndMonth)
                continue;

            const key = comparableMonthKey(billMonth);
            const existing = monthly.get(key);

            if (existing) {
                existing.totalConsumptionKwh += bill.total_consumption_kwh;
                existing.totalBill = Number(
                    (existing.totalBill + bill.total).toFixed(2),
                );
            } else {
                monthly.set(key, {
                    month: billMonth,
                    key,
                    totalConsumptionKwh: bill.total_consumption_kwh,
                    totalBill: Number(bill.total.toFixed(2)),
                });
            }
        }

        const sortedMonths = Array.from(monthly.values()).sort(
            (a, b) => b.month.getTime() - a.month.getTime(),
        );

        return {
            periodStartMonth,
            periodEndMonth,
            averagePrice: Number(
                ((price.day_price + price.night_price) / 2).toFixed(5),
            ),
            months: sortedMonths.slice(0, 12),
        };
    });

    const basePeriods = periodMonthlyStats.map((period) => {
        const sortedByDate = period.months
            .slice()
            .sort((a, b) => a.month.getTime() - b.month.getTime());

        const label =
            sortedByDate.length > 0
                ? toPeriodLabel(
                      sortedByDate[0].month,
                      sortedByDate[sortedByDate.length - 1].month,
                  )
                : toPeriodLabel(period.periodStartMonth, period.periodEndMonth);

        return {
            label,
            averagePrice: period.averagePrice,
            monthMap: new Map(period.months.map((m) => [m.key, m])),
        };
    });

    const result: AnalyticsPeriod[] = basePeriods.map((period, index) => {
        if (index === 0) {
            const prevPriceIndex = selectedPeriods[0].index - 1;
            const previousPrice =
                prevPriceIndex >= 0 ? prices[prevPriceIndex] : null;

            return {
                label: period.label,
                priceChangePct: previousPrice
                    ? percentageChange(
                          period.averagePrice,
                          Number(
                              (
                                  (previousPrice.day_price +
                                      previousPrice.night_price) /
                                  2
                              ).toFixed(5),
                          ),
                      )
                    : null,
                consumptionChangePct: null,
                billChangePct: null,
            };
        }

        const previous = basePeriods[index - 1];
        const sharedMonthKeys = Array.from(period.monthMap.keys()).filter(
            (key) => previous.monthMap.has(key),
        );

        let consumptionChangePct: number | null = null;
        let billChangePct: number | null = null;

        if (sharedMonthKeys.length > 0) {
            const currentConsumption = sharedMonthKeys.reduce(
                (sum, key) =>
                    sum + (period.monthMap.get(key)?.totalConsumptionKwh ?? 0),
                0,
            );

            const previousConsumption = sharedMonthKeys.reduce(
                (sum, key) =>
                    sum +
                    (previous.monthMap.get(key)?.totalConsumptionKwh ?? 0),
                0,
            );

            const currentBill = Number(
                sharedMonthKeys
                    .reduce(
                        (sum, key) =>
                            sum + (period.monthMap.get(key)?.totalBill ?? 0),
                        0,
                    )
                    .toFixed(2),
            );

            const previousBill = Number(
                sharedMonthKeys
                    .reduce(
                        (sum, key) =>
                            sum + (previous.monthMap.get(key)?.totalBill ?? 0),
                        0,
                    )
                    .toFixed(2),
            );

            consumptionChangePct = percentageChange(
                currentConsumption,
                previousConsumption,
            );
            billChangePct = percentageChange(currentBill, previousBill);
        }

        return {
            label: period.label,
            priceChangePct: percentageChange(
                period.averagePrice,
                previous.averagePrice,
            ),
            consumptionChangePct,
            billChangePct,
        };
    });

    return {
        status: "ok",
        data: result,
    } satisfies AnalyticsResult;
}
