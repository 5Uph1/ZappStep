"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";

type Variant = {
  id?: string;
  size: string;
  stock: number;
};

type ProductFormProps = {
  mode: "create" | "edit";
  productId?: string;
  initialData?: {
    name: string;
    description: string;
    price: string;
    category: string;
    image_url: string | null;
  };
  initialVariants?: Variant[];
  onSuccess?: () => void;
};

export function ProductForm({
  mode,
  productId,
  initialData,
  initialVariants,
  onSuccess,
}: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image_url || null,
  );
  const [form, setForm] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || "",
    category: initialData?.category || "",
  });
  const [variants, setVariants] = useState<Variant[]>(
    initialVariants || [{ size: "", stock: 0 }],
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleVariantChange = (
    index: number,
    field: keyof Variant,
    value: string | number,
  ) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([...variants, { size: "", stock: 0 }]);
  };

  const removeVariant = (index: number) => {
    const variant = variants[index];
    // Jika variant sudah memiliki ID (sudah ada di database), tidak bisa dihapus
    if (variant.id) {
      alert(
        "Variant yang sudah ada tidak bisa dihapus. Hanya bisa diupdate stock-nya.",
      );
      return;
    }
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let image_url = imagePreview;

      // Upload gambar baru jika ada
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabaseClient.storage
          .from("products")
          .upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabaseClient.storage
          .from("products")
          .getPublicUrl(fileName);
        image_url = urlData.publicUrl;
      }

      if (mode === "create") {
        // ==================== CREATE MODE ====================
        const { data: product, error: productError } = await supabaseClient
          .from("products")
          .insert({
            name: form.name,
            description: form.description,
            price: parseInt(form.price),
            category: form.category || null,
            image_url,
          })
          .select()
          .single();

        if (productError) throw productError;

        const validVariants = variants.filter((v) => v.size.trim() !== "");
        if (validVariants.length > 0) {
          const variantsData = validVariants.map((v) => ({
            product_id: product.id,
            size: v.size,
            stock: v.stock,
          }));
          const { error: variantsError } = await supabaseClient
            .from("product_variants")
            .insert(variantsData);
          if (variantsError) throw variantsError;
        }
      } else {
        // ==================== EDIT MODE ====================

        // 1. Update product
        const { error: productError } = await supabaseClient
          .from("products")
          .update({
            name: form.name,
            description: form.description,
            price: parseInt(form.price),
            category: form.category || null,
            image_url,
          })
          .eq("id", productId);

        if (productError) throw productError;

        // 2. Proses variants (update stock untuk yang sudah ada, insert untuk yang baru)
        const validVariants = variants.filter((v) => v.size.trim() !== "");

        for (const variant of validVariants) {
          // Cek apakah variant sudah ada di database
          const { data: existingVariant } = await supabaseClient
            .from("product_variants")
            .select("id, size, stock")
            .eq("product_id", productId)
            .eq("size", variant.size)
            .maybeSingle();

          if (existingVariant) {
            // Update stock variant yang sudah ada
            const { error: updateError } = await supabaseClient
              .from("product_variants")
              .update({ stock: variant.stock })
              .eq("id", existingVariant.id);

            if (updateError) {
              console.error(
                `Error updating variant ${variant.size}:`,
                updateError,
              );
            } else {
              console.log(
                `✅ Updated variant ${variant.size} stock to ${variant.stock}`,
              );
            }
          } else {
            // Insert variant baru
            const { error: insertError } = await supabaseClient
              .from("product_variants")
              .insert({
                product_id: productId,
                size: variant.size,
                stock: variant.stock,
              });

            if (insertError) {
              console.error(
                `Error inserting variant ${variant.size}:`,
                insertError,
              );
            } else {
              console.log(
                `✅ Inserted new variant ${variant.size} with stock ${variant.stock}`,
              );
            }
          }
        }

        console.log("✅ Variants updated successfully");
      }

      onSuccess?.();
      router.push("/admin/products");
    } catch (err) {
      console.error("Error:", err);
      alert(`Gagal ${mode === "create" ? "menyimpan" : "mengupdate"} produk.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-5"
    >
      {/* Gambar */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
          Gambar Produk
        </label>
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg mb-3"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="text-sm text-slate-600"
        />
      </div>

      {/* Nama */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
          Nama Produk
        </label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="contoh: Air Max Crimson"
        />
      </div>

      {/* Deskripsi */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
          Deskripsi
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Deskripsi produk..."
        />
      </div>

      {/* Harga & Kategori */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
            Harga (Rp)
          </label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
            min={0}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="150000"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
            Kategori
          </label>
          <input
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="contoh: Sneakers"
          />
        </div>
      </div>

      {/* Variants (Size & Stock) */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">
            Ukuran & Stok
          </label>
          <button
            type="button"
            onClick={addVariant}
            className="text-xs text-emerald-600 font-bold hover:underline"
          >
            + Tambah Ukuran
          </button>
        </div>

        <div className="space-y-3">
          {variants.map((variant, index) => {
            const isExisting = !!variant.id;
            return (
              <div key={index} className="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder="Ukuran (e.g., 39, 40, 41)"
                  value={variant.size}
                  onChange={(e) =>
                    handleVariantChange(index, "size", e.target.value)
                  }
                  disabled={isExisting}
                  className={`flex-1 px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isExisting ? "bg-slate-100 text-slate-500" : ""
                  }`}
                />
                <input
                  type="number"
                  placeholder="Stok"
                  value={variant.stock}
                  onChange={(e) =>
                    handleVariantChange(
                      index,
                      "stock",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-28 px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  disabled={isExisting}
                  className={`p-2 ${
                    isExisting
                      ? "text-slate-300 cursor-not-allowed"
                      : "text-red-500 hover:text-red-700"
                  }`}
                  title={
                    isExisting
                      ? "Variant yang sudah ada tidak bisa dihapus"
                      : "Hapus variant"
                  }
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-400 mt-2">
          * Ukuran yang sudah pernah dipesan tidak bisa dihapus. Hanya bisa
          diupdate stock-nya.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-3 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 rounded-lg bg-emerald-700 text-white text-sm font-bold hover:bg-emerald-800 transition-colors disabled:opacity-60"
        >
          {loading
            ? "Menyimpan..."
            : mode === "create"
              ? "Simpan Produk"
              : "Update Produk"}
        </button>
      </div>
    </form>
  );
}
