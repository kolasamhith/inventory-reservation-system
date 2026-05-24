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

  const [success, setSuccess] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [redirecting, setRedirecting] =
    useState(false);

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

      setError("");
      setSuccess("");

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

      setSuccess(
        "Purchase confirmed successfully!"
      );

      setRedirecting(true);

      setTimeout(() => {

        router.refresh();

        router.push("/");

      }, 1500);

    } catch {

      setError(
        "Confirmation failed"
      );
    }
  }

  async function cancelReservation() {

    try {

      setError("");
      setSuccess("");

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

      setSuccess(
        "Reservation cancelled successfully!"
      );

      setRedirecting(true);

      setTimeout(() => {

        router.refresh();

        router.push("/");

      }, 1500);

    } catch {

      setError(
        "Cancellation failed"
      );
    }
  }

  if (redirecting) {

    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">

        <div className="bg-white p-10 rounded-2xl shadow-xl text-center animate-pulse">

          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Redirecting...
          </h2>

          <p className="text-gray-500">
            Updating inventory state
          </p>

        </div>

      </main>
    );
  }

  if (loading) {

    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">

        <div className="bg-white p-10 rounded-2xl shadow-xl text-center animate-pulse">

          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Loading Reservation
          </h2>

          <p className="text-gray-500">
            Fetching latest reservation details
          </p>

        </div>

      </main>
    );
  }

  if (!reservation) {

    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">

        <div className="bg-white p-10 rounded-2xl shadow-xl text-center">

          <h2 className="text-3xl font-bold text-red-600 mb-3">
            Reservation Not Found
          </h2>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-10">

      <h1 className="text-5xl font-bold text-gray-900 mb-8">
        Reservation Checkout
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-xl mb-6 max-w-2xl">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded-xl mb-6 max-w-2xl">
          {success}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-md max-w-2xl">

        <div className="space-y-5">

          <div>

            <p className="text-sm text-gray-500">
              Reservation ID
            </p>

            <p className="text-gray-900 font-medium break-all">
              {reservation.id}
            </p>

          </div>

          <div className="grid grid-cols-2 gap-4">

            <div className="bg-gray-50 rounded-xl p-4">

              <p className="text-sm text-gray-500">
                Quantity
              </p>

              <p className="text-2xl font-bold text-gray-900">
                {reservation.quantity}
              </p>

            </div>

            <div className="bg-gray-50 rounded-xl p-4">

              <p className="text-sm text-gray-500">
                Status
              </p>

              <p className="text-2xl font-bold text-blue-600">
                {reservation.status}
              </p>

            </div>

          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">

            <p className="text-sm text-blue-700 mb-1">
              Reservation Expires In
            </p>

            <p className="text-4xl font-bold text-blue-600">
              {timeLeft}
            </p>

          </div>

        </div>

        <div className="flex gap-4 mt-8">

          <button
            onClick={confirmPurchase}

            disabled={
              reservation.status !==
              "PENDING"
            }

            className="flex-1 bg-green-600 hover:bg-green-700 transition text-white px-6 py-3 rounded-xl font-semibold disabled:bg-gray-400"
          >
            Confirm Purchase
          </button>

          <button
            onClick={cancelReservation}

            disabled={
              reservation.status !==
              "PENDING"
            }

            className="flex-1 bg-red-600 hover:bg-red-700 transition text-white px-6 py-3 rounded-xl font-semibold disabled:bg-gray-400"
          >
            Cancel Reservation
          </button>

        </div>

      </div>

    </main>
  );
}