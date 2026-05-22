import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

interface DummyProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  thumbnail: string;
  images: string[];
}

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }
  try {
    console.log("👟 Fetching shoes from DummyJSON...");

    // Ambil semua produk
    const response = await fetch("https://dummyjson.com/products?limit=100");
    const data = await response.json();
    const allProducts: DummyProduct[] = data.products;

    // Filter hanya sepatu pria dan wanita
    const shoes = allProducts.filter(
      (product) =>
        product.category === "mens-shoes" ||
        product.category === "womens-shoes",
    );

    console.log(`👟 Found ${shoes.length} shoe products`);

    if (shoes.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No shoes found in API",
      });
    }

    // Transform ke format database
    const formattedShoes = shoes.map((product) => {
      // Harga dalam Rupiah (USD × 15000)
      const priceInIDR = Math.round(product.price * 15000);

      // Gunakan gambar pertama dari array images, atau thumbnail
      const imageUrl = product.images?.[0] || product.thumbnail;

      return {
        name: product.title,
        description: product.description.substring(0, 500),
        price: priceInIDR,
        stock: product.stock,
        category: "Shoes", // Kategori seragam: Shoes
        image_url: imageUrl,
        is_deleted: false,
        created_at: new Date().toISOString(),
      };
    });

    console.log(`🔄 Transforming ${formattedShoes.length} shoes...`);

    // Hapus data sepatu lama (opsional)
    const { error: deleteError } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("category", "Shoes");

    if (deleteError) {
      console.log("No existing shoes to delete or error:", deleteError.message);
    } else {
      console.log("🗑️ Cleared existing shoes");
    }

    // Insert semua sepatu sekaligus
    const { error: insertError, data: inserted } = await supabaseAdmin
      .from("products")
      .insert(formattedShoes)
      .select();

    if (insertError) {
      console.error("❌ Insert error:", insertError);
      return NextResponse.json(
        {
          success: false,
          error: insertError.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `✅ Seeded ${inserted?.length} shoes to database`,
      shoes: formattedShoes.map((s) => ({ name: s.name, price: s.price })),
    });
  } catch (error) {
    console.error("❌ Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed shoes" },
      { status: 500 },
    );
  }
}
