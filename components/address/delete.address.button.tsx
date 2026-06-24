"use client";

import { useTransition } from "react";
import { deleteAddress } from "@/services/address.services";

const DeleteAddressButton = ({
    id,
    isPrimary,
}: {
    id: string;
    isPrimary: boolean;
}) => {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        const confirmed = confirm("Delete this address?");

        if (!confirmed) return;

        startTransition(async () => {
            await deleteAddress(id);
        });
    };

    return (
        <button
            className={`${isPrimary ? "text-gray-500 cursor-not-allowed" : "text-red-600 hover:text-red-900 hover:cursor-pointer"}`}
            onClick={handleDelete}
            disabled={isPending || isPrimary}
        >
            {isPending ? "Deleting..." : "Delete"}
        </button>
    );
};

export default DeleteAddressButton;
