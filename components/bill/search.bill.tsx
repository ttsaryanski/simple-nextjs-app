"use client";

import { useEffect } from "react";

import { toast } from "sonner";

const SearchBillForm = ({
    defaultValue,
    error,
}: {
    defaultValue?: number;
    error?: string;
}) => {
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    return (
        <form className="flex gap-2" action="/bills" method="GET">
            <input
                name="query"
                type="number"
                defaultValue={defaultValue}
                placeholder="Search bills by year"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent"
            />
            <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Search
            </button>
        </form>
    );
};

export default SearchBillForm;
