"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import AddCategory from "@/components/AddCategory";
import { Category, SubCategory } from "@/types/categories";
import Image from "next/image";
import { TablePage } from "@/components/TablePage";
import { format } from "date-fns";
import Loader from "@/components/Loader";
import { toast } from "@/lib/toast";
import PageHeader from "@/components/PageHeader";


export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<Category | null>(null);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [image, setImage] = useState("");
  const [name, setName] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [description, setDescription] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);


  const resetForm = () => {
    setName("");
    setDescription("");
    setImage("");
    setSubCategories([]);
    setImageFile(null);
    setEditing(null);
    setFormOpen(false);
  };

  const openAdd = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setImage("");
    setSubCategories([]);
    setImageFile(null);
    setFormOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setName(category.name);
    setDescription(category.description);
    setImage(category.image);
    setSubCategories(category.subCategories);
    setImageFile(null);
    setFormOpen(true);
  };

  const addSubCategory = () => {
    const value = subCategory.trim();

    if (!value) return;

    // Prevent duplicate names
    if (
      subCategories.some(
        (item) => item.name.toLowerCase() === value.toLowerCase()
      )
    ) {
      return;
    }

    setSubCategories((prev) => [
      ...prev,
      {
        name: value,
      },
    ]);

    setSubCategory("");
  };

  const fetchCategories = useCallback(async () => {

    // if (initialLoading) {
    //   setLoading(true);
    // }

    const start = Date.now();

    try {
      const res = await fetch(
        `/api/admin/categories?page=${page}&limit=${limit}&search=${search}`
      );

      const result = await res.json();

      if (result.success) {
        setCategories(result.data);
        setTotalPages(result.pagination.totalPages);
        setTotalItems(result.pagination.total);
      }
    } catch (error) {
      console.error(error);
    } finally {
      const elapsed = Date.now() - start;
      const delay = Math.max(1000 - elapsed, 0);

      setTimeout(() => {
        // setLoading(false);
        setInitialLoading(false);
      }, delay);
    }
  }, [page, limit, search]);
  // category list
  useEffect(() => {
    startTransition(() => {
      fetchCategories();
    });
  }, [fetchCategories]);

  // category form submit handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (editing) {
        // Update category
        const res = await fetch(`/api/admin/categories`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: editing.id,
            name,
            description,
            subCategories: subCategories
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message);
        }
        toast({
          message: "Category updated successfully",
          position: "top-right",
          type: "success",
        });
        // Update local state
        setCategories((prev) =>
          prev.map((item) =>
            item.id === editing.id
              ? {
                ...item,
                name,
                description,
                subCategories: subCategories
              }
              : item
          )
        );
      } else {
        // Create category
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            description,
            subCategories: subCategories
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message);
        }

        toast({
          message: "Category created successfully",
          position: "top-right",
          type: "success",
        });

        // Add to local state
        fetchCategories();
      }

      resetForm();
    } catch (error) {
      toast({
        message: "Failed to create category",
        position: "top-right",
        type: "error",
      });
    }
  };
  // category delete handler
const handleDelete = async () => {
  if (!deleteTarget) return;

  try {
    const res = await fetch(
      `/api/admin/categories?id=${deleteTarget.id}`,
      {
        method: "DELETE",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      toast({
        message: data.message,
        position: "top-right",
        type: "error",
      });

      return;
    }

    await fetchCategories();

    setDeleteTarget(null);

    toast({
      message: data.message || "Category deleted successfully.",
      position: "top-right",
      type: "success",
    });
  } catch (error) {
    console.error(error);

    toast({
      message: "Failed to delete category.",
      position: "top-right",
      type: "error",
    });
  }
};


  // loading state
  // if (loading) {
  //   return (
  //     <Loader />
  //   );
  // }

  return (
    <div>
      <PageHeader
        title="Product categories"
        description="Categories organizing your products"
        action={
          <button
            onClick={() => {
              openAdd();
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-blush-deep px-4 py-2.5 text-[14px] font-semibold text-surface hover:bg-blush-deep/90"
          >
            <Plus size={17} />
            Add Category
          </button>
        }
      />
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/60" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name or SKU…"
            className="w-full rounded-xl border border-border bg-cream py-2.5 pl-9 pr-4 text-[13.5px] text-ink placeholder:text-ink-soft/50"
          />
        </div>

      </div>
      <div className="space-y-8">
        <TablePage title="Product categories" subtitle="Categories organizing your products" addLabel="Add category"
          headers={["ID", "Name", "Sub category", "Description", "Actions"]}
          page={page}
          onAddClick={() => {
            openAdd();
          }}
          setSearch={setSearch}
          search={search}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setPage}
          rows={categories.map(p => (
            <tr key={p.id} className="border-t border-border">
              <td className="font-medium text-ink w-px whitespace-nowrap">{p.id}</td>
              <td className="font-medium text-ink">{p.name}</td>
              <td className="font-bold"> {p.subCategories?.map((sub) => sub.name).join(", ")}</td>
              <td className="font-medium">{p.description}</td>
              {/* <td><Badge status={p.status} /></td> */}
              <td className="w-px whitespace-nowrap">
                <div className="flex items-center gap-2 px-3">
                  <button onClick={() => openEdit(p)} className="cursor-pointer rounded-lg p-2 text-ink-soft hover:bg-sky-deep hover:text-white">
                    <Pencil size={16} />
                  </button>

                  <button onClick={() => setDeleteTarget(p)} className="cursor-pointer rounded-lg p-2 text-ink-soft hover:bg-rose-danger hover:text-white">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        />
      </div>

      {/* Category component */}
      {formOpen && (
        <AddCategory
          open={formOpen}
          loading={loading}
          editing={!!editing}
          name={name}
          subCategory={subCategory}
          subCategories={subCategories}
          setSubCategories={setSubCategories}
          addSubCategory={addSubCategory}
          description={description}
          onNameChange={setName}
          onSubChange={setSubCategory}
          onDescriptionChange={setDescription}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this category?"
        description={`"${deleteTarget?.name}" will be removed permanently..`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
