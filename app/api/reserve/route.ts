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

    const inventory = await prisma.inventory.findFirst({
      where: {
        productId,
        warehouseId,
      },
    });

    if (!inventory) {
      return NextResponse.json(
        { error: "Inventory not found" },
        { status: 404 }
      );
    }

    const availableStock =
      inventory.totalStock - inventory.reservedStock;

    if (availableStock < quantity) {

      return NextResponse.json(
        { error: "Not enough stock available" },
        { status: 400 }
      );
    }

    await prisma.inventory.update({
      where: {
        id: inventory.id,
      },
      data: {
        reservedStock: {
          increment: quantity,
        },
      },
    });

    const reservation = await prisma.reservation.create({
      data: {
        productId,
        warehouseId,
        quantity,
        status: "PENDING",
        expiresAt: new Date(
          Date.now() + 15 * 60 * 1000
        ),
      },
    });

    return NextResponse.json({
      message: "Reservation created",
      reservation,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Reservation failed" },
      { status: 500 }
    );
  }
}