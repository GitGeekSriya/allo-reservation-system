import { NextResponse } from "next/server";
import { cleanupExpiredReservations } from "@/lib/cleanupExpiredReservations";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await cleanupExpiredReservations();

    const products = await prisma.product.findMany({
      include: {
        inventory: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    return NextResponse.json(products);
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
