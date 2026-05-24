import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const {
      productId,
      warehouseId,
      quantity,
    } = body;

    const reservation =
      await prisma.$transaction(
        async (tx) => {

          const inventory =
            await tx.inventory.findFirst({
              where: {
                productId,
                warehouseId,
              },
            });

          if (!inventory) {

            throw new Error(
              "Inventory not found"
            );
          }

          const availableStock =
            inventory.totalStock -
            inventory.reservedStock;

          if (
            quantity > availableStock
          ) {

            throw new Error(
              "Not enough stock available"
            );
          }

          await tx.inventory.update({
            where: {
              id: inventory.id,
            },
            data: {
              reservedStock: {
                increment: quantity,
              },
            },
          });

          return await tx.reservation.create({
            data: {
              productId,
              warehouseId,
              quantity,
              status: "PENDING",
              expiresAt: new Date(
                Date.now() +
                15 * 60 * 1000
              ),
            },
          });
        }
      );

    return NextResponse.json(
      reservation,
      { status: 201 }
    );

  } catch (error: any) {

    console.error(error);

    if (
      error.message ===
      "Not enough stock available"
    ) {

      return NextResponse.json(
        {
          error:
            "Not enough stock available",
        },
        { status: 409 }
      );
    }

    if (
      error.message ===
      "Inventory not found"
    ) {

      return NextResponse.json(
        {
          error:
            "Inventory not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Reservation failed",
      },
      { status: 500 }
    );
  }
}