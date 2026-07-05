import { getPrimaryAddress } from "@/services/address.services";

import CreateBillForm from "@/components/bill/create.bill.form";
import { AddressesProps } from "@/components/address/addresses";

const AddBillPage = async () => {
    let primaryAddress: AddressesProps | null = null;
    let message = "";
    try {
        primaryAddress = await getPrimaryAddress();
    } catch (error) {
        message =
            error instanceof Error
                ? error.message
                : "Failed to fetch addresses";
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <main className="p-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Add Bill
                            </h1>
                            <p className="text-sm text-gray-500">
                                Add a new bill to your records
                            </p>
                        </div>
                    </div>
                </div>

                <div className="max-w-2xl">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <CreateBillForm
                            primaryAddress={primaryAddress}
                            error={message}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AddBillPage;
