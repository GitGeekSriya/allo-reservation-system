"use client";

import {
  useEffect,
  useState,
} from "react";

type Product = {
  id: string;
  name: string;
  inventory: {
    id: string;
    totalStock: number;
    reservedStock: number;
    warehouse: {
      id: string;
      name: string;
    };
  }[];
};

export default function Home() {

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  async function fetchProducts() {

    try {

      const response =
        await fetch(
          "/api/products"
        );

      const data =
        await response.json();

      setProducts(data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);
    }
  }

  async function reserveStock(
    productId: string,
    warehouseId: string
  ) {

    try {

      const response =
        await fetch(
          "/api/reserve",
          {
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
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        alert(data.error);
        return;
      }

      window.location.href =
        `/reservation/${data.id}`;

    } catch (error) {

      console.error(error);
    }
  }

  useEffect(() => {

    fetchProducts();

  }, []);

  if (loading) {

    return (
      <div className="p-10 text-xl">
        Loading...
      </div>
    );
  }

  return (

    <main className="p-10 min-h-screen bg-gray-100">

      <h1 className="text-4xl font-bold mb-8">
        Inventory Dashboard
      </h1>

      <div className="grid gap-6">

        {products.map((product) => (

          <div
            key={product.id}
            className="bg-white border rounded-2xl p-6 shadow"
          >

            <h2 className="text-2xl font-semibold mb-4">
              {product.name}
            </h2>

            <div className="grid gap-4">

              {product.inventory.map(
                (item) => {

                  const availableStock =
                    item.totalStock -
                    item.reservedStock;

                  return (

                    <div
                      key={item.id}
                      className="border rounded-xl p-4 flex items-center justify-between bg-gray-50"
                    >

                      <div>

                        <p className="font-semibold text-lg">
                          {
                            item.warehouse
                              .name
                          }
                        </p>

                        <p className="mt-1">
                          Total Stock:
                          {" "}
                          {
                            item.totalStock
                          }
                        </p>

                        <p>
                          Reserved:
                          {" "}
                          {
                            item.reservedStock
                          }
                        </p>

                        <p
                          className={
                            availableStock <= 2
                              ? "text-red-600 font-semibold"
                              : "text-green-600 font-semibold"
                          }
                        >
                          Available:
                          {" "}
                          {
                            availableStock
                          }
                        </p>

                        {availableStock <= 2 &&
                         availableStock > 0 && (

                          <p className="text-orange-600 font-medium mt-1">
                            Low Stock Alert
                          </p>
                        )}

                        {availableStock === 0 && (

                          <p className="text-red-700 font-bold mt-1">
                            Out Of Stock
                          </p>
                        )}

                      </div>

                      <button
                        onClick={() =>
                          reserveStock(
                            product.id,
                            item.warehouse.id
                          )
                        }
                        disabled={
                          availableStock <= 0
                        }
                        className={`px-4 py-2 rounded-lg text-white transition ${
                          availableStock <= 0
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-black hover:bg-gray-800"
                        }`}
                      >

                        {availableStock <= 0
                          ? "Out Of Stock"
                          : "Reserve"}

                      </button>

                    </div>
                  );
                }
              )}

            </div>

          </div>
        ))}

      </div>

    </main>
  );
}