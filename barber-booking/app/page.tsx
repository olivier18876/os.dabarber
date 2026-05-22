"use client";

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

import { supabase } from "../lib/supabase";

export default function Home() {
  const [selectedHour, setSelectedHour] =
    useState("");

  const [selectedDate, setSelectedDate] =
    useState<Date | null>(null);

  const [name, setName] = useState("");

  const [phone, setPhone] = useState("");

  const [service, setService] =
    useState("Strzyżenie");

  // GODZINY Z BAZY
  const [hours, setHours] =
    useState<any[]>([]);

  // ZAJĘTE GODZINY
  const [bookedHours, setBookedHours] =
    useState<string[]>([]);

  // ZABLOKOWANE DNI
  const [blockedDates, setBlockedDates] =
    useState<Date[]>([]);

  // POBIERANIE GODZIN
  useEffect(() => {
    const fetchHours = async () => {
      const { data, error } = await supabase
        .from("barber_hours")
        .select("*");

      if (data) {
        setHours(data);
      }

      if (error) {
        console.log(error);
      }
    };

    fetchHours();
  }, []);

  // POBIERANIE ZAJĘTYCH GODZIN
  useEffect(() => {
    const fetchBookings = async () => {
      if (!selectedDate) return;

      const formattedDate =
  `${selectedDate.getFullYear()}-${
    String(
      selectedDate.getMonth() + 1
    ).padStart(2, "0")
  }-${
    String(
      selectedDate.getDate()
    ).padStart(2, "0")
  }`;

      const { data, error } = await supabase
        .from("bookings")
        .select("booking_hour")
        .eq("booking_date", formattedDate);

      if (data) {
        const booked = data.map(
          (booking: any) =>
            booking.booking_hour
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
  (item: any) => {
    const parts =
      item.blocked_date.split("-");

    return new Date(
      Number(parts[0]),
      Number(parts[1]) - 1,
      Number(parts[2])
    );
  }
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
    const numbersOnly =
      e.target.value.replace(/\D/g, "");

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
      alert(
        "Numer telefonu musi mieć 9 cyfr"
      );

      return;
    }

   const formattedDate =
  `${selectedDate.getFullYear()}-${
    String(
      selectedDate.getMonth() + 1
    ).padStart(2, "0")
  }-${
    String(
      selectedDate.getDate()
    ).padStart(2, "0")
  }`;

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
      alert(
        "Ta godzina jest już zajęta 😄"
      );

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
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}
        <div className="mb-10 text-center">
          <h1 className="text-5xl md:text-7xl font-black text-yellow-500 mb-4 tracking-tight">
            OSDA BARBER
          </h1>

          <p className="text-zinc-400 text-lg">
            Rezerwacje online 💈
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">

          {/* LEWA */}
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">

            <h2 className="text-3xl font-black mb-8">
              Dane klienta
            </h2>

            <input
              placeholder="Imię"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="w-full mb-4 p-4 rounded-2xl bg-black border border-zinc-700 outline-none focus:border-yellow-500 transition"
            />

            {/* TELEFON */}
            <div className="flex items-center mb-4 rounded-2xl bg-black border border-zinc-700 overflow-hidden focus-within:border-yellow-500">

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

            {/* USŁUGI */}
            <select
              value={service}
              onChange={(e) =>
                setService(e.target.value)
              }
              className="w-full p-4 rounded-2xl bg-black border border-zinc-700 outline-none focus:border-yellow-500 transition"
            >
              <option>Strzyżenie</option>

              <option>
                Strzyżenie + Design
              </option>

              <option>Broda</option>

              <option>Combo</option>
            </select>
          </div>

          {/* PRAWA */}
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">

            <h2 className="text-3xl font-black mb-8">
              Wybierz termin
            </h2>

            {/* KALENDARZ */}
            <DatePicker
              selected={selectedDate}
              onChange={(
                date: Date | null
              ) => setSelectedDate(date)}
              minDate={
  new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  )
}
              excludeDates={blockedDates}
              dateFormat="dd.MM.yyyy"
              placeholderText="Wybierz dzień"
              className="w-full mb-6 p-4 rounded-2xl bg-black border border-zinc-700 outline-none focus:border-yellow-500 transition"
            />

            {/* GODZINY */}
            <div className="grid grid-cols-2 gap-3">

              {hours.map((hourItem) => {

                const hour =
                  hourItem.hour;

                const isBooked =
                  bookedHours.includes(hour);

                return (
                  <button
                    key={hourItem.id}
                    disabled={isBooked}
                    onClick={() =>
                      setSelectedHour(hour)
                    }
                    className={`p-4 rounded-2xl font-black transition-all duration-200 ${
                      isBooked
                        ? "bg-red-500 opacity-60 cursor-not-allowed"
                        : selectedHour === hour
                        ? "bg-yellow-500 text-black scale-105"
                        : "bg-black border border-zinc-700 hover:border-yellow-500 hover:scale-105"
                    }`}
                  >
                    {isBooked
                      ? `${hour} Zajęte`
                      : hour}
                  </button>
                );
              })}
            </div>

            {/* BUTTON */}
            <button
              onClick={handleBooking}
              className="w-full mt-8 bg-yellow-500 text-black p-5 rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-xl"
            >
              Potwierdź rezerwację
            </button>

            {/* PODSUMOWANIE */}
            {selectedDate &&
              selectedHour && (
                <div className="mt-6 text-center bg-black border border-zinc-800 rounded-2xl p-4">

                  <p className="text-zinc-400 mb-2">
                    Wybrany termin
                  </p>

                  <p className="text-yellow-500 font-black text-xl">
                    {selectedDate.toLocaleDateString()} •{" "}
                    {selectedHour}
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>
    </main>
  );
}