import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  context: { params: Promise<{ reservationId: string }> }
) {

  try {

    const { reservationId } =
      await context.params;

    console.log(
      "Reservation ID:",
      reservationId
    );

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

    const updatedReservation =
      await prisma.reservation.update({
        where: {
          id: reservationId,
        },
        data: {
          status: "CONFIRMED",
        },
      });

    return NextResponse.json(
      updatedReservation
    );

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to confirm reservation",
      },
      { status: 500 }
    );
  }
}