import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  context: {
    params: Promise<{
      reservationId: string;
    }>;
  },
) {
  try {
    const { reservationId } = await context.params;

    console.log("Reservation ID:", reservationId);

    const reservation = await prisma.reservation.findUnique({
      where: {
        id: reservationId,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        {
          error: "Reservation not found",
        },
        { status: 404 },
      );
    }

    if (
      reservation.expiresAt < new Date() &&
      reservation.status === "PENDING"
    ) {
      return NextResponse.json(
        {
          error: "Reservation expired",
        },
        { status: 410 },
      );
    }

    if (reservation.status === "CONFIRMED") {
      return NextResponse.json(
        {
          error: "Reservation already confirmed",
        },
        { status: 400 },
      );
    }

    const updatedReservation = await prisma.reservation.update({
      where: {
        id: reservationId,
      },
      data: {
        status: "CONFIRMED",
      },
    });

    return NextResponse.json(updatedReservation);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to confirm reservation",
      },
      { status: 500 },
    );
  }
}
