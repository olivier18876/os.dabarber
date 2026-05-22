"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { supabase } from "../../lib/supabase";

export default function AdminPage() {
  const router = useRouter();

  const [bookings, setBookings] =
    useState<any[]>([]);

  const [blockedDate, setBlockedDate] =
    useState<Date | null>(null);

  const [hours, setHours] =
    useState<any[]>([]);

  const [newHour, setNewHour] =
    useState("");

  // LOGIN
  useEffect(() => {
    const auth =
      localStorage.getItem("admin-auth");

    if (auth !== "true") {
      router.push("/login");
    }

    fetchBookings();
    fetchHours();
  }, []);

  // REZERWACJE
  const fetchBookings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (data) {
      setBookings(data);
    }
  };

  // GODZINY
  const fetchHours = async () => {
    const { data } = await supabase
      .from("barber_hours")
      .select("*");

    if (data) {
      setHours(data);
    }
  };

  // DODAJ GODZINĘ
  const addHour = async () => {
    if (!newHour) return;

    const { error } = await supabase
      .from("barber_hours")
      .insert([
        {
          hour: newHour,
        },
      ]);

    if (!error) {
      setNewHour("");
      fetchHours();
    }
  };

  // USUŃ GODZINĘ
  const deleteHour = async (id: number) => {
    const { error } = await supabase
      .from("barber_hours")
      .delete()
      .eq("id", id);

    if (!error) {
      fetchHours();
    }
  };

  // WYLOGUJ
  const logout = () => {
    localStorage.removeItem("admin-auth");

    router.push("/login");
  };

  // USUŃ REZERWACJĘ
  const deleteBooking = async (
    id: number
  ) => {
    const confirmDelete = confirm(
      "Usunąć rezerwację?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", id);

    if (!error) {
      fetchBookings();
    }
  };

  // BLOKADA DNIA
  const blockDate = async () => {
    if (!blockedDate) return;

 const formattedDate =
  `${blockedDate.getFullYear()}-${
    String(
      blockedDate.getMonth() + 1
    ).padStart(2, "0")
  }-${
    String(
      blockedDate.getDate()
    ).padStart(2, "0")
  }`;

    const { error } = await supabase
      .from("blocked_dates")
      .insert([
        {
          blocked_date: formattedDate,
        },
      ]);

    if (!error) {
      alert("Dzień zablokowany 🔥");

      setBlockedDate(null);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-yellow-500 mb-2">
              PANEL ADMINA
            </h1>

            <p className="text-zinc-400">
              Zarządzanie barberem 💈
            </p>
          </div>

          <button
            onClick={logout}
            className="bg-red-500 px-6 py-3 rounded-2xl font-bold"
          >
            Wyloguj
          </button>
        </div>

        {/* GODZINY */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-10">
          <h2 className="text-2xl font-bold mb-6">
            Godziny pracy
          </h2>

          <div className="flex gap-3 mb-6">
            <input
              placeholder="09:00"
              value={newHour}
              onChange={(e) =>
                setNewHour(e.target.value)
              }
              className="w-full p-4 rounded-2xl bg-black border border-zinc-700 outline-none"
            />

            <button
              onClick={addHour}
              className="bg-yellow-500 text-black px-6 rounded-2xl font-black"
            >
              Dodaj
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            {hours.map((hour) => (
              <div
                key={hour.id}
                className="bg-black border border-zinc-700 px-4 py-3 rounded-2xl flex items-center gap-3"
              >
                <span>{hour.hour}</span>

                <button
                  onClick={() =>
                    deleteHour(hour.id)
                  }
                  className="text-red-500 font-bold"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* BLOKOWANIE DNI */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-10">
          <h2 className="text-2xl font-bold mb-6">
            Zablokuj dzień
          </h2>

          <DatePicker
            selected={blockedDate}
            onChange={(date: Date | null) =>
              setBlockedDate(date)
            }
            minDate={new Date()}
            dateFormat="dd.MM.yyyy"
            placeholderText="Wybierz dzień"
            className="w-full mb-6 p-4 rounded-2xl bg-black border border-zinc-700 outline-none"
          />

          <button
            onClick={blockDate}
            className="bg-red-500 px-6 py-4 rounded-2xl font-bold"
          >
            Zablokuj dzień
          </button>
        </div>

        {/* REZERWACJE */}
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
            >
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {booking.name}
                </h2>

                <p className="text-zinc-400">
                  📞 {booking.phone}
                </p>

                <p className="text-zinc-400">
                  💈 {booking.service}
                </p>

                <p className="text-yellow-500 font-bold mt-2">
                  📅 {booking.booking_date} • {booking.booking_hour}
                </p>
              </div>

              <button
                onClick={() =>
                  deleteBooking(booking.id)
                }
                className="bg-red-500 px-6 py-3 rounded-2xl font-bold hover:opacity-80 transition"
              >
                Usuń
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}