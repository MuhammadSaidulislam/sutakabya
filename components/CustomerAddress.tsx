import { Address } from '@/types/order';
import React, { useEffect, useState } from 'react'
import {
    divisions_en,
    districts_en,
    upazilas_en,
} from "bangladesh-location-data";

const CustomerAddress = () => {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedDivision, setSelectedDivision] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);

    const [selectedDistrict, setSelectedDistrict] = useState("");
    const availableDistricts = districts_en[selectedDivision] || [];
    const availableUpazilas = upazilas_en[selectedDistrict] || [];


    const [form, setForm] = useState({
        label: "",
        name: "",
        phone: "",
        address: "",
        division: "",
        district: "",
        zip: "",
        upazila: "",
        is_default: false,
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? (e.target as HTMLInputElement).checked
                    : value,
        }));
    };

    const addAddress = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);

            const res = await fetch("/api/user/customer-address", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to add address");
                return;
            }

            // Add newly created address to UI
            setAddresses((prev) => {
                const newAddress = data.data;

                // If new address is default,
                // remove default from previous addresses
                if (newAddress.is_default) {
                    return [
                        ...prev.map((address) => ({
                            ...address,
                            is_default: false,
                        })),
                        newAddress,
                    ];
                }

                return [...prev, newAddress];
            });

            // Reset form
            setForm({
                label: "",
                name: "",
                phone: "",
                address: "",
                division: "",
                district: "",
                upazila: "",
                zip: "",
                is_default: false,
            });

            setShowForm(false);
        } catch (error) {
            console.error("Add address error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDivisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const divisionId = e.target.value;

        setSelectedDivision(divisionId);
        const division = divisions_en.find(
            (item) => item.value === Number(divisionId)
        );

        // Reset district and upazila
        setSelectedDistrict("");

        setForm((prev) => ({
            ...prev,
            division: division?.title ?? "",
            district: "",
            upazila: "",
        }));
    };

    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const districtId = e.target.value;

        setSelectedDistrict(districtId);
        const district = districts_en[Number(selectedDivision)]?.find(
            (item) => item.value === Number(districtId)
        );


        setForm((prev) => ({
            ...prev,
            district: district?.title ?? "",
            upazila: "",
        }));
    };

    // Update address
    const updateAddress = async (address: Address) => {
        try {
            const res = await fetch(
                "/api/user/customer-address",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        id: address.id,
                        label: address.label,
                        name: address.name,
                        phone: address.phone,
                        address: address.address,
                        division: address.division,
                        district: address.district,
                        upazila: address.upazila,
                        zip: address.zip,
                        is_default: address.is_default,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                console.error(data.message);
                return;
            }
            // Update frontend state
            setAddresses((prev) =>
                prev.map((item) =>
                    item.id === data.data.id
                        ? data.data
                        : data.data.is_default
                            ? {
                                ...item,
                                is_default: false,
                            }
                            : item
                )
            );
                 setShowForm(false);
        } catch (error) {
            console.error("Update address error:", error);
        }
    };

    // Editable form
    const handleEdit = (item: Address) => {
        setEditingId(item.id);

        setForm({
            label: item.label,
            name: item.name,
            phone: item.phone,
            address: item.address,
            division: item.division,
            district: item.district,
            upazila: item.upazila,
            zip: item.zip || "",
            is_default: item.is_default,
        });

        // Set IDs for dependent dropdowns
        const division = divisions_en.find(
            (division) => division.title === item.division
        );

        const district = division ? districts_en[division.value]?.find(
            (district) => district.title === item.district
        )
            : undefined;

        setSelectedDivision(String(division?.value) || "");
        setSelectedDistrict(String(district?.value) || "");

        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (editingId !== null) {
        await updateAddress({
            id: editingId,
            label: form.label,
            name: form.name,
            phone: form.phone,
            address: form.address,
            division: form.division,
            district: form.district,
            upazila: form.upazila,
            zip: form.zip,
            is_default: form.is_default,
        });
    } else {
        await addAddress(e);
    }
};

    useEffect(() => {
        const getAddresses = async () => {
            try {
                setLoading(true);

                const res = await fetch(
                    "/api/user/customer-address"
                );

                const data = await res.json();

                if (!res.ok) {
                    console.error(data.message);
                    return;
                }

                setAddresses(data.data);
            } catch (error) {
                console.error("Get addresses error:", error);
            } finally {
                setLoading(false);
            }
        };

        getAddresses();
    }, []);


    // Delete address
    const deleteAddress = async (id: number) => {
    if (!confirm("Are you sure you want to delete this address?")) {
        return;
    }

    try {
        setLoading(true);

        const res = await fetch("/api/user/customer-address", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Failed to delete address");
            return;
        }

        setAddresses((prev) =>
            prev.filter((item) => item.id !== id)
        );
    } catch (error) {
        console.error("Delete address error:", error);
    } finally {
        setLoading(false);
    }
};


    return (
        <div className="border border-border shadow-cream-deep rounded-2xl p-5 sm:p-6 bg-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <h2 className="font-serif text-lg text-ink-900">
                    Address Book
                </h2>

                <button
                    type="button"
                    onClick={() => setShowForm((prev) => !prev)}
                    className="text-sm font-medium text-brand-pink hover:underline"
                >
                    {showForm ? "Cancel" : "+ Add Address"}
                </button>
            </div>

            {/* Add Address Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                    {/* Label */}
                    <div>
                        <label className="block text-sm font-medium text-ink-800 mb-1">
                            Label
                        </label>

                        <input
                            type="text"
                            name="label"
                            value={form.label}
                            onChange={handleChange}
                            placeholder="Home"
                            className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-ink-800 mb-1">
                                Full Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Jane Doe"
                                required
                                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none"
                            />
                        </div>
                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-ink-800 mb-1">
                                Phone
                            </label>

                            <input
                                type="text"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="Jane Doe"
                                required
                                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none"
                            />
                        </div>
                    </div>
                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-ink-800 mb-1">
                            Address
                        </label>

                        <textarea
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            placeholder="123 Maple Street"
                            required
                            rows={3}
                            className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none resize-none"
                        />
                    </div>

                    {/* DIVISION + City + ZIP */}
                    <div className="grid grid-cols-4 gap-3">

                        {/* Division */}
                        <div>
                            <label className="block text-sm font-medium text-ink-800 mb-1">
                                Division
                            </label>

                            <select
                                name="division"
                                value={selectedDivision}
                                onChange={handleDivisionChange}
                                required
                                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none bg-white"
                            >
                                <option value="">
                                    Select Division
                                </option>

                                {divisions_en.map((division) => (
                                    <option
                                        key={division.value}
                                        value={division.value}
                                    >
                                        {division.title}
                                    </option>
                                ))}
                            </select>
                        </div>


                        {/* District */}
                        <div>
                            <label className="block text-sm font-medium text-ink-800 mb-1">
                                District
                            </label>

                            <select
                                name="district"
                                value={selectedDistrict}
                                onChange={handleDistrictChange}
                                disabled={!selectedDivision}
                                required
                                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
                            >
                                <option value="">
                                    Select District
                                </option>

                                {availableDistricts.map((district) => (
                                    <option
                                        key={district.value}
                                        value={district.value}
                                    >
                                        {district.title}
                                    </option>
                                ))}
                            </select>
                        </div>


                        {/* Upazila */}
                        <div>
                            <label className="block text-sm font-medium text-ink-800 mb-1">
                                Upazila / Thana
                            </label>

                            <select
                                name="upazila"
                                value={form.upazila}
                                onChange={handleChange}
                                disabled={!selectedDistrict}
                                required
                                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
                            >
                                <option value="">
                                    Select Upazila / Thana
                                </option>

                                {availableUpazilas.map((upazila) => (
                                    <option
                                        key={upazila.value}
                                        value={upazila.title}
                                    >
                                        {upazila.title}
                                    </option>
                                ))}
                            </select>
                        </div>


                        {/* ZIP */}
                        <div>
                            <label className="block text-sm font-medium text-ink-800 mb-1">
                                ZIP Code
                            </label>

                            <input
                                type="text"
                                name="zip"
                                value={form.zip}
                                onChange={handleChange}
                                placeholder="5640"
                                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none"
                            />
                        </div>

                    </div>

                    {/* Default */}
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="is_default"
                            checked={form.is_default}
                            onChange={handleChange}
                            className="accent-brand-pink"
                        />

                        <span className="text-sm text-ink-700">
                            Set as default address
                        </span>
                    </label>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-brand-pink text-white py-2.5 text-sm font-medium hover:bg-ink-800 disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Save Address"}
                    </button>
                </form>
            )}

            {/* Address List */}
            {addresses.length === 0 ? (
                !showForm && (
                    <div className="py-6 text-center">
                        <p className="text-sm text-ink-500">
                            You don&apos;t have any saved addresses yet.
                        </p>

                        <button
                            type="button"
                            onClick={() => setShowForm(true)}
                            className="mt-3 text-sm font-medium text-brand-pink hover:underline"
                        >
                            Add your first address
                        </button>
                    </div>
                )
            ) : (
                <div className="space-y-3">
                    {addresses.map((item) => (
                        <div
                            key={item.id}
                            className="border border-border rounded-xl p-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="text-ink-600 text-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <p className="font-medium text-ink-900">
                                            {item.name}
                                        </p>

                                        <span className="rounded-full bg-cream px-2 py-0.5 text-[11px] text-ink-600">
                                            {item.label}
                                        </span>

                                        {Number(item.is_default) === 1 && (
                                            <span className="rounded-full bg-brand-pink/10 px-2 py-0.5 text-[11px] text-brand-pink">
                                                Default
                                            </span>
                                        )}
                                        <button type="button" onClick={() => handleEdit(item)}   className="shrink-0 text-sm font-medium text-brand-pink hover:underline" >
                                            Edit
                                        </button>
                                        <button type="button"  onClick={() => deleteAddress(item.id)}  className="shrink-0 text-sm font-medium text-brand-pink hover:underline" >
                                            Delete
                                        </button>
                                    </div>

                                    <p>{item.address}</p>
                                    <p>
                                        {item.district}
                                        {item.zip && `, ${item.zip}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default CustomerAddress