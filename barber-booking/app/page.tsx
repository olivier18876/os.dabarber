"use client";

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

import { supabase } from "../lib/supabase";

export default function Home() {
  const [selectedHour, setSelectedHour] = useState("");
  const [selectedDate, setSelectedDate] =
    useState<Date | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("Strzyżenie");

  // ZAJĘTE GODZINY
  const [bookedHours, setBookedHours] =
    useState<string[]>([]);

  // ZABLOKOWANE DNI
  const [blockedDates, setBlockedDates] =
    useState<Date[]>([]);

  // GODZINY
  const hours = [
    "9:00",
    "10:30",
    "12:00",
    "13:30",
    "15:00",
    "16:30",
    "18:00",
  ];

  // POBIERANIE ZAJĘTYCH GODZIN
  useEffect(() => {
    const fetchBookings = async () => {
      if (!selectedDate) return;

      const formattedDate =
        selectedDate.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("bookings")
        .select("booking_hour")
        .eq("booking_date", formattedDate);

      if (data) {
        const booked = data.map(
          (booking: any) => booking.booking_hour
        );

        setBookedHours(booked);
      }

      if (error) {
        console.log(error);
      }
    };

    fetchBookings();
  }, [selectedDate]);

  // POBIERANIE ZABLOKOWANYCH DNI
  useEffect(() => {
    const fetchBlockedDates = async () => {
      const { data, error } = await supabase
        .from("blocked_dates")
        .select("*");

      if (data) {
        const formattedDates = data.map(
          (item: any) =>
            new Date(item.blocked_date)
        );

        setBlockedDates(formattedDates);
      }

      if (error) {
        console.log(error);
      }
    };

    fetchBlockedDates();
  }, []);

  // TELEFON
  const handlePhoneChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const numbersOnly = e.target.value.replace(/\D/g, "");

    if (numbersOnly.length <= 9) {
      setPhone(numbersOnly);
    }
  };

  // REZERWACJA
  const handleBooking = async () => {
    if (
      !name ||
      !phone ||
      !selectedDate ||
      !selectedHour
    ) {
      alert("Uzupełnij wszystkie pola");
      return;
    }

    if (phone.length !== 9) {
      alert("Numer telefonu musi mieć 9 cyfr");
      return;
    }

    const formattedDate =
      selectedDate.toISOString().split("T")[0];

    const fullPhone = `+48${phone}`;

    const { error } = await supabase
      .from("bookings")
      .insert([
        {
          name,
          phone: fullPhone,
          service,
          booking_date: formattedDate,
          booking_hour: selectedHour,
        },
      ]);

    if (error) {
      alert("Błąd rezerwacji");
      console.log(error);
    } else {
      alert("Rezerwacja zapisana 💈");

      setBookedHours((prev) => [
        ...prev,
        selectedHour,
      ]);

      setName("");
      setPhone("");
      setSelectedDate(null);
      setSelectedHour("");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="mx-auto max-w-5xl">

        <h1 className="text-5xl font-black text-yellow-500 mb-4">
          OSDA BARBER
        </h1>

        <p className="text-zinc-400 mb-12">
          Rezerwacje online 💈
        </p>

        <div className="grid gap-8 md:grid-cols-2">

          {/* LEWA */}
          <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
            <h2 className="text-2xl font-bold mb-6">
              Dane klienta
            </h2>

            <input
              placeholder="Imię"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mb-4 p-4 rounded-2xl bg-black border border-zinc-700 outline-none"
            />

            <div className="flex items-center mb-4 rounded-2xl bg-black border border-zinc-700 overflow-hidden">
              <div className="px-4 text-zinc-400 border-r border-zinc-700">
                +48
              </div>

              <input
                placeholder="123456789"
                value={phone}
                onChange={handlePhoneChange}
                className="w-full p-4 bg-black outline-none"
              />
            </div>

            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full p-4 rounded-2xl bg-black border border-zinc-700 outline-none"
            >
              <option>Strzyżenie</option>
              <option>Strzyżenie + Design</option>
              <option>Broda</option>
              <option>Combo</option>
            </select>
          </div>

          {/* PRAWA */}
          <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
            <h2 className="text-2xl font-bold mb-6">
              Wybierz termin
            </h2>

            {/* KALENDARZ */}
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date | null) =>
                setSelectedDate(date)
              }
              minDate={new Date()}
              excludeDates={blockedDates}
              dateFormat="dd.MM.yyyy"
              placeholderText="Wybierz dzień"
              className="w-full mb-6 p-4 rounded-2xl bg-black border border-zinc-700 outline-none"
            />

            {/* GODZINY */}
            <div className="grid grid-cols-2 gap-3">
              {hours.map((hour) => {
                const isBooked =
                  bookedHours.includes(hour);

                return (
                  <button
                    key={hour}
                    disabled={isBooked}
                    onClick={() =>
                      setSelectedHour(hour)
                    }
                    className={`p-4 rounded-2xl font-bold transition ${
                      isBooked
                        ? "bg-red-500 opacity-60 cursor-not-allowed"
                        : selectedHour === hour
                        ? "bg-yellow-500 text-black"
                        : "bg-black border border-zinc-700 hover:border-yellow-500"
                    }`}
                  >
                    {isBooked
                      ? `${hour} Zajęte`
                      : hour}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleBooking}
              className="w-full mt-8 bg-yellow-500 text-black p-4 rounded-2xl font-black text-lg hover:scale-[1.02] transition"
            >
              Potwierdź rezerwację
            </button>

            {selectedDate && selectedHour && (
              <div className="mt-6 text-center text-yellow-500 font-bold">
                Termin:{" "}
                {selectedDate.toLocaleDateString()} •{" "}
                {selectedHour}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}