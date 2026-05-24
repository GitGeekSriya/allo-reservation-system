import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      reservationId: string;
    }>;
  }
) {

  try {

    const { reservationId } =
      await context.params;

    const reservation =
      await prisma.reservation.findUnique({
        where: {
          id: reservationId,
        },
      });

    if (!reservation) {

      return NextResponse.json(
        {
          error:
            "Reservation not found",
        },
        { status: 404 }
      );
    }

    if (
      reservation.status ===
      "RELEASED"
    ) {

      return NextResponse.json(
        {
          error:
            "Reservation already released",
        },
        { status: 400 }
      );
    }

    if (
      reservation.status ===
      "CONFIRMED"
    ) {

      return NextResponse.json(
        {
          error:
            "Cannot release a confirmed reservation",
        },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      async (tx) => {

        const inventory =
          await tx.inventory.findFirst({
            where: {
              productId:
                reservation.productId,
              warehouseId:
                reservation.warehouseId,
            },
          });

        if (!inventory) {

          throw new Error(
            "Inventory not found"
          );
        }

        await tx.inventory.update({
          where: {
            id: inventory.id,
          },
          data: {
            reservedStock: {
              decrement:
                reservation.quantity,
            },
          },
        });

        await tx.reservation.update({
          where: {
            id: reservation.id,
          },
          data: {
            status: "RELEASED",
          },
        });
      }
    );

    return NextResponse.json({
      success: true,
      message:
        "Reservation released",
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to release reservation",
      },
      { status: 500 }
    );
  }
}