"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Product } from "@/types";

export default function HomePage() {

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [reserving, setReserving] =
    useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {

    try {

      const response =
        await fetch("/api/products");

      const data =
        await response.json();

      setProducts(data);

    } catch {

      setError(
        "Failed to load products"
      );

    } finally {

      setLoading(false);
    }
  }

  async function handleReserve(
    productId: string,
    warehouseId: string
  ) {

    try {

      setReserving(productId);

      const response =
        await fetch("/api/reservations", {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            productId,
            warehouseId,
            quantity: 1,
          }),
        });

      const data =
        await response.json();

      if (!response.ok) {

        setError(
          data.error ||
          "Reservation failed"
        );

        return;
      }

      router.push(
        `/reservation/${data.id}`
      );

    } catch {

      setError(
        "Reservation failed"
      );

    } finally {

      setReserving(null);
    }
  }

  if (loading) {

    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen p-10">

      <h1 className="text-4xl font-bold mb-8">
        Inventory Reservation System
      </h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid gap-6">

        {products.map((product) => (

          <div
            key={product.id}
            className="border rounded-xl p-6 shadow-sm"
          >

            <h2 className="text-2xl font-semibold">
              {product.name}
            </h2>

            <p className="text-gray-500 mb-4">
              SKU: {product.sku}
            </p>

            <div className="space-y-4">

              {product.stock.map((stock) => (

                <div
                  key={stock.warehouseId}
                  className="border rounded-lg p-4"
                >

                  <div className="flex justify-between items-center">

                    <div>

                      <p className="font-medium">
                        {stock.warehouseName}
                      </p>

                      <p>
                        Available:
                        {" "}
                        {stock.availableUnits}
                      </p>

                      <p>
                        Reserved:
                        {" "}
                        {stock.reservedUnits}
                      </p>

                    </div>

                    <button
                      onClick={() =>
                        handleReserve(
                          product.id,
                          stock.warehouseId
                        )
                      }

                      disabled={
                        stock.availableUnits <= 0 ||
                        reserving === product.id
                      }

                      className="bg-black text-white px-4 py-2 rounded disabled:bg-gray-400"
                    >

                      {reserving === product.id
                        ? "Reserving..."
                        : "Reserve"}

                    </button>

                  </div>

                </div>
              ))}
            </div>

          </div>
        ))}
      </div>

    </main>
  );
}