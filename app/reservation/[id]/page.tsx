"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function ReservationPage() {

  const params = useParams();

  const router = useRouter();

  const id = params.id as string;

  const [reservation, setReservation] =
    useState<any>(null);

  const [timeLeft, setTimeLeft] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  async function fetchReservation() {

    try {

      const response =
        await fetch(
          `/api/reservations/${id}`
        );

      const data =
        await response.json();

      if (!response.ok) {

        setError(
          data.error ||
          "Failed to load reservation"
        );

        return;
      }

      setReservation(data);

    } catch {

      setError(
        "Failed to load reservation"
      );

    } finally {

      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReservation();
  }, []);

  useEffect(() => {

    if (!reservation) return;

    const interval =
      setInterval(() => {

        const expires =
          new Date(
            reservation.expiresAt
          ).getTime();

        const now =
          Date.now();

        const difference =
          expires - now;

        if (difference <= 0) {

          setTimeLeft("Expired");

          clearInterval(interval);

          return;
        }

        const minutes =
          Math.floor(
            difference / 1000 / 60
          );

        const seconds =
          Math.floor(
            (difference / 1000) % 60
          );

        setTimeLeft(
          `${minutes}m ${seconds}s`
        );

      }, 1000);

    return () =>
      clearInterval(interval);

  }, [reservation]);

  async function confirmPurchase() {

    try {

      const response =
        await fetch(
          `/api/reservations/${id}/confirm`,
          {
            method: "POST",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        setError(
          data.error ||
          "Confirmation failed"
        );

        return;
      }

      setReservation(data);

    } catch {

      setError(
        "Confirmation failed"
      );
    }
  }

  async function cancelReservation() {

    try {

      const response =
        await fetch(
          `/api/reservations/${id}/release`,
          {
            method: "POST",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        setError(
          data.error ||
          "Cancellation failed"
        );

        return;
      }

      router.push("/");

    } catch {

      setError(
        "Cancellation failed"
      );
    }
  }

  if (loading) {
    return <div className="p-10">
      Loading...
    </div>;
  }

  if (!reservation) {
    return <div className="p-10">
      Reservation not found
    </div>;
  }

  return (
    <main className="min-h-screen p-10">

      <h1 className="text-3xl font-bold mb-6">
        Reservation Checkout
      </h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}

      <div className="border rounded-xl p-6 max-w-xl">

        <p>
          Reservation ID:
          {" "}
          {reservation.id}
        </p>

        <p>
          Quantity:
          {" "}
          {reservation.quantity}
        </p>

        <p>
          Status:
          {" "}
          {reservation.status}
        </p>

        <p className="text-lg font-semibold mt-4">
          Time Remaining:
          {" "}
          {timeLeft}
        </p>

        <div className="flex gap-4 mt-6">

          <button
            onClick={confirmPurchase}

            disabled={
              reservation.status !==
              "PENDING"
            }

            className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            Confirm Purchase
          </button>

          <button
            onClick={cancelReservation}

            disabled={
              reservation.status !==
              "PENDING"
            }

            className="bg-red-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            Cancel
          </button>

        </div>

      </div>

    </main>
  );
}