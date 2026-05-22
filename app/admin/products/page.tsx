"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseClient } from "@/lib/supabaseClient";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminMobileSidebar } from "../components/AdminMobileSidebar";
import { Icon } from "@/components/ui/Icon";

// shadcn components
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Product = {
  id: string;
  name: string;
  price: number;
  category: string | null;
  image_url: string | null;
  totalStock: number;
  variantCount: number;
  is_deleted?: boolean;
};

// Loading Skeleton dengan shadcn
function ProductsSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {[
              "Gambar",
              "Nama",
              "Kategori",
              "Harga",
              "Stok",
              "Varian",
              "Status",
              "Aksi",
            ].map((h) => (
              <TableHead key={h}>{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: 8 }).map((_, j) => (
                <TableCell key={j}>
                  <div className="h-4 bg-slate-200 rounded animate-pulse" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    checkAuthAndFetch();
  }, [showInactive]);

  const checkAuthAndFetch = async () => {
    setLoading(true);
    setAuthError(null);

    const {
      data: { session },
    } = await supabaseClient.auth.getSession();

    if (!session) {
      setAuthError("Anda belum login.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profile?.role !== "admin") {
      window.location.href = "/dashboard";
      return;
    }

    await fetchProducts();
  };

  const fetchProducts = async () => {
    let query = supabaseClient
      .from("products")
      .select(
        `
        id,
        name,
        price,
        category,
        image_url,
        is_deleted,
        product_variants (stock)
      `,
      )
      .order("created_at", { ascending: false });

    if (!showInactive) {
      query = query.eq("is_deleted", false);
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
      setProducts([]);
    } else {
      const formattedProducts = (data || []).map((product: any) => {
        const variants = product.product_variants || [];
        const totalStock = variants.reduce(
          (sum: number, v: any) => sum + (v.stock || 0),
          0,
        );
        return {
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category,
          image_url: product.image_url,
          totalStock,
          variantCount: variants.length,
          is_deleted: product.is_deleted,
        };
      });
      setProducts(formattedProducts);
    }

    setLoading(false);
  };

  const handleSoftDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabaseClient
      .from("products")
      .update({ is_deleted: true })
      .eq("id", deleteId);

    if (error) {
      alert("Gagal menonaktifkan produk");
    } else {
      fetchProducts();
    }
    setDeleteId(null);
  };

  const handleRestore = async (id: string) => {
    const { error } = await supabaseClient
      .from("products")
      .update({ is_deleted: false })
      .eq("id", id);

    if (error) {
      alert("Gagal mengaktifkan produk");
    } else {
      fetchProducts();
    }
  };

  if (authError) {
    return (
      <div className="bg-[#f5fbf5] min-h-screen">
        <AdminSidebar />
        <main className="lg:pl-64">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-600">{authError}</p>
              <Button
                onClick={() => (window.location.href = "/auth")}
                className="mt-4"
              >
                Login
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-[#f5fbf5] min-h-screen">
      <AdminSidebar />

      {/* Mobile Sidebar */}
      <AdminMobileSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <header className="lg:hidden fixed top-0 w-full z-50 h-16 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm flex justify-between items-center px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="text-emerald-600"
          >
            <Icon name="menu" className="w-6 h-6" />
          </button>
          <span className="text-xl font-black italic text-slate-900">
            ZeepStep
          </span>
        </div>
      </header>

      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">
                Products
              </h1>
              <p className="text-slate-500 mt-1">
                Kelola semua produk toko kamu
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant={showInactive ? "default" : "outline"}
                onClick={() => setShowInactive(!showInactive)}
              >
                {showInactive ? "📋 Tampilkan Aktif" : "🗑️ Tampilkan Nonaktif"}
              </Button>
              <Link href="/admin/products/new">
                <Button className="bg-emerald-700 hover:bg-emerald-800">
                  + Tambah Produk
                </Button>
              </Link>
            </div>
          </div>

          {loading ? (
            <ProductsSkeleton />
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border">
              <p className="text-slate-500">Belum ada produk.</p>
            </div>
          ) : (
            <div className="rounded-md border bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gambar</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead>Varian</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow
                      key={product.id}
                      className={product.is_deleted ? "opacity-60" : ""}
                    >
                      <TableCell>
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-slate-100 rounded" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>{product.category ?? "-"}</TableCell>
                      <TableCell>
                        Rp {product.price.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            product.totalStock <= 5
                              ? "text-red-600 font-bold"
                              : ""
                          }
                        >
                          {product.totalStock} unit
                        </span>
                      </TableCell>
                      <TableCell>{product.variantCount} ukuran</TableCell>
                      <TableCell>
                        {product.is_deleted ? (
                          <Badge variant="destructive">Nonaktif</Badge>
                        ) : (
                          <Badge
                            variant="default"
                            className="bg-emerald-100 text-emerald-700"
                          >
                            Aktif
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </Link>
                          {product.is_deleted ? (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleRestore(product.id)}
                            >
                              Aktifkan
                            </Button>
                          ) : (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleteId(product.id)}
                            >
                              Nonaktifkan
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>

      {/* Alert Dialog untuk konfirmasi hapus */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Produk akan dinonaktifkan dan tidak akan tampil di toko. Tindakan
              ini dapat dibatalkan nanti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSoftDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Nonaktifkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
