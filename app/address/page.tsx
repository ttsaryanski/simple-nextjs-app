import { createAddress } from "@/services/address.services";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAddresses } from "@/services/address.services";
import DeleteAddressButton from "@/components/address/delete.address.button";
import SetAddressPrimaryButton from "@/components/address/set.address.primary.button";

const AddressPage = async () => {
    const user = await getCurrentUser();
    if (!user) {
        redirect("/sign-in");
    }

    const res = await getAddresses();
    const addresses = res.sort((a, b) => (a.isPrimary ? -1 : 1));

    return (
        <div className="address-page min-h-screen bg-gray-50 flex items-center justify-center ">
            <main className="p-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Available Addresses
                            </h1>
                            <p className="text-sm text-gray-500 max-w-sm">
                                You cannot delete an address while it is the
                                primary address. Please select another address
                                as the primary address and then you will be able
                                to delete it.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="max-w-2xl">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Address
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {addresses.map((address) => (
                                    <tr
                                        key={address.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {address.address}
                                            {address.isPrimary && (
                                                <span className="ml-1 text-green-600  font-semibold">
                                                    *
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            <SetAddressPrimaryButton
                                                id={address.id}
                                                isPrimary={address.isPrimary}
                                            />
                                            <DeleteAddressButton
                                                id={address.id}
                                                isPrimary={address.isPrimary}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mt-2 max-w-sm">
                                <span className="text-green-600 font-semibold mr-2">
                                    *
                                </span>
                                Primary address
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <main className="p-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Add Address
                            </h1>
                            <p className="text-sm text-gray-500">
                                Add a new address to your bills.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="max-w-2xl">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <form className="space-y-6" action={createAddress}>
                            <div>
                                <label
                                    htmlFor="address"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Address *
                                </label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent"
                                    placeholder="Enter Address"
                                />
                            </div>

                            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label
                                        htmlFor="quantity"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Quantity *
                                    </label>
                                    <input
                                        type="number"
                                        id="quantity"
                                        name="quantity"
                                        min="0"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="price"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Price *
                                    </label>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        step="0.01"
                                        min="0"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent"
                                        placeholder="0.0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="sku"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    SKU (optional)
                                </label>
                                <input
                                    type="text"
                                    id="sku"
                                    name="sku"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent"
                                    placeholder="Enter SKU"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="lowStockAt"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Low Stock At (optional)
                                </label>
                                <input
                                    type="number"
                                    id="lowStockAt"
                                    name="lowStockAt"
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent"
                                    placeholder="Enter low stock threshold"
                                />
                            </div> */}

                            <div className="flex gap-5">
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                >
                                    Add Address
                                </button>
                                <Link
                                    href="/inventory"
                                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AddressPage;
