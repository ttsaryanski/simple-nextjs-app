"use server";

import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/lib/auth";

import { createBillSchema, yearQuerySchema } from "@/validators/bill.schema";
import {
    createBill as createBillRepo,
    getAllBillsCountWithQuery,
    getAllBillsWithQuery,
} from "@/repositories/bill.repository";

type CreateBillState = {
    success: boolean;
    message: string;
    path?: string;
};
export async function createBill(
    _prevState: CreateBillState,
    formData: FormData,
    addressId: string,
) {
    const user = await requireCurrentUser();

    const month = Number(formData.get("month"));
    const year = Number(formData.get("year"));
    const period = new Date(Date.UTC(year, month - 1, 1));
    const parsedData = createBillSchema.safeParse({
        month,
        year,
        period,
        total: Number(formData.get("total")),
        addressId,
    });
    if (!parsedData.success) {
        return {
            success: false,
            message: parsedData.error.issues[0].message,
            path: parsedData.error.issues[0].path[0] as string,
        };
    }

    try {
        await createBillRepo({
            ...parsedData.data,
            userId: user.id,
        });
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to create bill",
            path: "",
        };
    }
    redirect("/bills");
}

export async function getBillsPaginated(
    query: string,
    page: number,
    pageSize: number,
) {
    const user = await requireCurrentUser();

    let where = {
        userId: user.id,
    };
    const queryNumber = Number(query);
    const isInteger = Number.isInteger(queryNumber);
    const parsedData = yearQuerySchema.safeParse({
        year: queryNumber,
    });
    if (!parsedData.success && query) {
        throw new Error(parsedData.error.issues[0].message);
    }
    if (isInteger) {
        where = {
            userId: user.id,
            ...(query ? { year: queryNumber } : {}),
        };
    } else {
        where = {
            userId: user.id,
        };
    }

    const totalCount = await getAllBillsCountWithQuery(where);
    const bills = await getAllBillsWithQuery(where, page, pageSize);

    return {
        totalCount,
        bills,
    };
}
