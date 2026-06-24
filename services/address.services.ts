"use server";

import { getCurrentUser } from "@/lib/auth";
import { createAddressSchema } from "@/validators/address.schema";
import {
    getAllAddresses,
    deleteAddressById,
    createAddress as createAddressRepo,
    setAddressPrimary as setAddressPrimaryRepo,
} from "@/repositories/address.repository";

import { redirect } from "next/navigation";

export async function getAddresses() {
    const user = await getCurrentUser();
    if (!user) {
        redirect("/sign-in");
    }

    const addresses = await getAllAddresses(user.id);

    return addresses;
}

export async function deleteAddress(addressId: string) {
    const user = await getCurrentUser();
    if (!user) {
        redirect("/sign-in");
    }

    if (!addressId) {
        throw new Error("Address ID is required");
    }

    try {
        await deleteAddressById(addressId, user.id);
    } catch {
        throw new Error("Failed to delete address");
    }

    redirect("/address");
}

export async function createAddress(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) {
        redirect("/sign-in");
    }

    const parsedData = createAddressSchema.safeParse({
        address: formData.get("address"),
    });

    if (!parsedData.success) {
        throw new Error("Validation failed");
    }

    try {
        await createAddressRepo({
            ...parsedData.data,
            userId: user.id,
        });
    } catch {
        throw new Error("Failed to create address");
    }

    redirect("/address");
}

export async function setAddressPrimary(addressId: string) {
    const user = await getCurrentUser();
    if (!user) {
        redirect("/sign-in");
    }

    if (!addressId) {
        throw new Error("Address ID is required");
    }

    try {
        await setAddressPrimaryRepo(addressId, user.id);
    } catch {
        throw new Error("Failed to set address as primary");
    }

    redirect("/address");
}
