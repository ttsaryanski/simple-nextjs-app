export interface Bill {
    id: string;
    month: number;
    year: number;
    total: number;
    createdAt: Date;
    updatedAt: Date;
    addressId: string;
    userId: string;
    period: Date;
}
