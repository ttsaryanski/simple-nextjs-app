"use client";

import { useState, useEffect } from "react";

import { getPrimaryAddress } from "@/services/address.services";

const PrimaryAddress = () => {
    const [address, setAddress] = useState<string | null>(null);

    useEffect(() => {
        const fetchPrimaryAddress = async () => {
            const primaryAddress = await getPrimaryAddress();
            setAddress(primaryAddress?.address || null);
        };

        fetchPrimaryAddress();
    }, []);

    return (
        <div className="primary basis-1/2">
            <h1 className="text-2xl text-right font-semibold text-gray-900">
                Selected address
            </h1>
            <h2 className="text-1xl text-right font-semibold text-gray-500">
                {address ? address : "Loading..."}
            </h2>
            <p className="text-sm text-right text-gray-500">
                From the Addresses page, you can change your primary address.
            </p>
        </div>
    );
};

export default PrimaryAddress;
