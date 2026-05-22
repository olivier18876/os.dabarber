"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { supabase } from "../../lib/supabase";

export default function AdminPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<any[]>([]);
  const [blockedDate, setBlockedDate] = useState<Date | null>(null);

  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dayHours, setDayHours] = useState<any[]>([]);
  const [newHour, setNewHour] = useState("");

  useEffect(() => {
    const auth = localStorage.getItem("admin-auth");
    if (auth !== "true") router.push("/login");

    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setBookings(data);
  };

  const fetchDayHours = async (day: Date | null) => {
    if (!day) return;
    const formattedDay = `${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`;
    const { data } = await supabase
      .from("barber_day_hours")
      .select("*")
      .eq("day", formattedDay)
      .order("hour", { ascending: true });
    if (data) setDayHours(data);
  };

  const addHour = async () => {
    if (!newHour || !selectedDay) return;
    const formattedDay = `${selectedDay.getFullYear()}-${String(selectedDay.getMonth()+1).padStart(2,'0')}-${String(selectedDay.getDate()).padStart(2,'0')}`;
    const { error } = await supabase
      .from("barber_day_hours")
      .insert([{ day: formattedDay, hour: newHour }]);
    if (!error) {
      setNewHour("");
      fetchDayHours(selectedDay);
    }
  };

  const deleteHour = async (id: number) => {
    const { error } = await supabase
      .from("barber_day_hours")
      .delete()
      .eq("id", id);
    if (!error && selectedDay) fetchDayHours(selectedDay);
  };

  const deleteBooking = async (id: number) => {
    if (!confirm("Usunąć rezerwację?")) return;
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", id);
    if (!error) fetchBookings();
  };

  const blockDate = async () => {
    if (!blockedDate) return;
    const formattedDate = `${blockedDate.getFullYear()}-${String(blockedDate.getMonth()+1).padStart(2,'0')}-${String(blockedDate.getDate()).padStart(2,'0')}`;
    const { error } = await supabase
      .from("blocked_dates")
      .insert([{ blocked_date: formattedDate }]);
    if (!error) setBlockedDate(null);
  };

  const logout = () => {
    localStorage.removeItem("admin-auth");
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-5xl font-black text-yellow-500">ADMIN PANEL</h1>
          <button onClick={logout} className="bg-red-500 px-6 py-3 rounded-2xl font-bold">Wyloguj</button>
        </div>

        {/* Wybór dnia */}
        <div className="mb-6">
          <DatePicker
            selected={selectedDay}
            onChange={(date: Date | null) => {
              setSelectedDay(date);
              fetchDayHours(date);
            }}
            minDate={new Date()}
            placeholderText="Wybierz dzień do ustawienia godzin"
            className="p-4 rounded-2xl bg-black border border-zinc-700 outline-none"
          />
        </div>

        {/* Godziny wybranego dnia */}
        {selectedDay && (
          <div className="mb-10 bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <h2 className="text-2xl font-bold mb-4">Godziny dnia {selectedDay.toLocaleDateString()}</h2>

            <div className="flex gap-2 mb-4">
              <input
                placeholder="09:00"
                value={newHour}
                onChange={(e) => setNewHour(e.target.value)}
                className="p-3 rounded-2xl bg-black border border-zinc-700 outline-none"
              />
              <button onClick={addHour} className="bg-yellow-500 text-black px-4 rounded-2xl font-bold">Dodaj</button>
            </div>

            <div className="flex flex-wrap gap-3">
              {dayHours.map(hour => (
                <div key={hour.id} className="bg-black border border-zinc-700 px-4 py-2 rounded-2xl flex items-center gap-3">
                  <span>{hour.hour}</span>
                  <button onClick={() => deleteHour(hour.id)} className="text-red-500 font-bold">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Blokowanie dni i rezerwacje */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <h2 className="text-2xl font-bold mb-4">Blokuj dzień</h2>
            <DatePicker
              selected={blockedDate}
              onChange={(date: Date | null) => setBlockedDate(date)}
              minDate={new Date()}
              placeholderText="Wybierz dzień do zablokowania"
              className="p-4 rounded-2xl bg-black border border-zinc-700 outline-none"
            />
            <button onClick={blockDate} className="bg-red-500 px-6 py-3 rounded-2xl font-bold mt-2">Zablokuj</button>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <h2 className="text-2xl font-bold mb-4">Rezerwacje</h2>
            <div className="flex flex-col gap-3">
              {bookings.map(b => (
                <div key={b.id} className="bg-black border border-zinc-700 p-3 rounded-2xl flex justify-between items-center">
                  <div>
                    <p className="font-bold">{b.name}</p>
                    <p className="text-zinc-400">{b.booking_date} • {b.booking_hour}</p>
                  </div>
                  <button onClick={() => deleteBooking(b.id)} className="text-red-500 font-bold">Usuń</button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}