"use client";

import { useEffect, useState } from "react";

type Reservation = {
  id: string;
  quantity: number;
  status: string;
  expiresAt: string;
};

export default function ReservationPage({
  params,
}: {
  params: Promise<{
    reservationId: string;
  }>;
}) {
  const [reservation, setReservation] = useState<Reservation | null>(null);

  const [timeLeft, setTimeLeft] = useState("");

  async function fetchReservation() {
    const resolvedParams = await params;

    const response = await fetch(
      `/api/reserve/${resolvedParams.reservationId}`,
    );

    const data = await response.json();

    setReservation(data);
  }

  async function confirmReservation() {
    if (!reservation) return;

    const response = await fetch(`/api/reserve/${reservation.id}/confirm`, {
      method: "POST",
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error);
      return;
    }

    alert("Reservation confirmed");

    fetchReservation();
  }

  async function releaseReservation() {
    if (!reservation) return;

    const response = await fetch(`/api/reserve/${reservation.id}/release`, {
      method: "POST",
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error);
      return;
    }

    alert("Reservation released");

    fetchReservation();
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: load reservation once on mount
  useEffect(() => {
    fetchReservation();
  }, []);

  useEffect(() => {
    if (!reservation) return;

    if (reservation.status !== "PENDING") {
      setTimeLeft("Completed");

      return;
    }

    const interval = setInterval(() => {
      const expiry = new Date(reservation.expiresAt).getTime();

      const now = Date.now();

      const distance = expiry - now;

      if (distance <= 0) {
        setTimeLeft("Expired");

        clearInterval(interval);

        return;
      }

      const minutes = Math.floor(distance / 1000 / 60);

      const seconds = Math.floor((distance / 1000) % 60);

      setTimeLeft(`${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [reservation]);

  if (!reservation) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <main className="p-10">
      <h1 className="text-4xl font-bold mb-6">Reservation Checkout</h1>

      <div className="bg-card border border-foreground/10 rounded-xl p-6 max-w-xl">
        <p className="mb-2">Reservation ID: {reservation.id}</p>

        <p className="mb-2">Quantity: {reservation.quantity}</p>

        <p className="mb-2">Status: {reservation.status}</p>

        <p className="mb-6 text-red-600 dark:text-red-400 font-semibold">
          {reservation.status === "PENDING"
            ? `Expires in: ${timeLeft}`
            : reservation.status === "CONFIRMED"
              ? "Reservation Confirmed"
              : "Reservation Released"}
        </p>

        {reservation.status === "PENDING" && (
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={confirmReservation}
              className="bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Confirm Purchase
            </button>

            <button
              type="button"
              onClick={releaseReservation}
              className="bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Cancel Reservation
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => (window.location.href = "/")}
          className="border border-foreground/20 px-4 py-2 rounded-lg hover:bg-muted"
        >
          Back to Dashboard
        </button>
      </div>
    </main>
  );
}
