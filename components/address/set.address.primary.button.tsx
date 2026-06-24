"use client";

import { useTransition } from "react";
import { setAddressPrimary } from "@/services/address.services";

type SetAddressPrimaryButtonProps = {
    id: string;
    isPrimary: boolean;
};

const SetAddressPrimaryButton = ({
    id,
    isPrimary,
}: SetAddressPrimaryButtonProps) => {
    const [isPending, startTransition] = useTransition();

    const handleSetPrimary = () => {
        const confirmed = confirm("Set this address as primary?");

        if (!confirmed) return;

        startTransition(async () => {
            await setAddressPrimary(id);
        });
    };

    return (
        <button
            className={`${isPrimary ? "text-gray-500 cursor-not-allowed" : "text-green-600 hover:text-green-900 hover:cursor-pointer"} mr-2`}
            onClick={handleSetPrimary}
            disabled={isPending || isPrimary}
        >
            {isPending ? "Setting..." : "Set Primary"}
        </button>
    );
};

export default SetAddressPrimaryButton;
