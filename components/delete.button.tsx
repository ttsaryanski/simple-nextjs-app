"use client";

import { useTransition } from "react";
import { deleteProduct } from "@/services/product.services";

const DeleteButton = ({ id }: { id: string }) => {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        const confirmed = confirm("Delete this product?");

        if (!confirmed) return;

        startTransition(async () => {
            await deleteProduct(id);
        });
    };

    return (
        <button
            className="text-red-600 hover:text-red-900 hover:cursor-pointer"
            onClick={handleDelete}
            disabled={isPending}
        >
            {isPending ? "Deleting..." : "Delete"}
        </button>
    );
};

export default DeleteButton;
