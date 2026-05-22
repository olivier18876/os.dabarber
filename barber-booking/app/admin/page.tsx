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
  const [blockedHours, setBlockedHours] = useState<string[]>([]);
  const [newHour, setNewHour] = useState("");

  // Domyślne godziny
  const hours = ["09:00","10:00","11:00","12:00","13:00","14:00","16:00","17:00"];

  useEffect(() => {
    const auth = localStorage.getItem("admin-auth");
    if (auth !== "true") router.push("/login");
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at",{ascending:false});
    if(data) setBookings(data);
  };

  const fetchBlockedHours = async (day: Date | null) => {
    if (!day) return;
    const formattedDate = `${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`;
    const { data } = await supabase
      .from("blocked_hours")
      .select("*")
      .eq("blocked_date", formattedDate);
    if(data) setBlockedHours(data.map((b:any)=>b.blocked_hour));
  };

  const blockHour = async (hour: string) => {
    if(!selectedDay) return;
    const formattedDate = `${selectedDay.getFullYear()}-${String(selectedDay.getMonth()+1).padStart(2,'0')}-${String(selectedDay.getDate()).padStart(2,'0')}`;
    const { error } = await supabase
      .from("blocked_hours")
      .insert([{blocked_date:formattedDate, blocked_hour:hour}]);
    if(!error && selectedDay) fetchBlockedHours(selectedDay);
  };

  const unblockHour = async (hour: string) => {
    if(!selectedDay) return;
    const formattedDate = `${selectedDay.getFullYear()}-${String(selectedDay.getMonth()+1).padStart(2,'0')}-${String(selectedDay.getDate()).padStart(2,'0')}`;
    const { error } = await supabase
      .from("blocked_hours")
      .delete()
      .eq("blocked_date",formattedDate)
      .eq("blocked_hour",hour);
    if(!error && selectedDay) fetchBlockedHours(selectedDay);
  };

  const deleteBooking = async (id:number) => {
    if(!confirm("Usunąć rezerwację?")) return;
    const { error } = await supabase.from("bookings").delete().eq("id",id);
    if(!error) fetchBookings();
  };

  const blockDateHandler = async () => {
    if(!blockedDate) return;
    const formattedDate = `${blockedDate.getFullYear()}-${String(blockedDate.getMonth()+1).padStart(2,'0')}-${String(blockedDate.getDate()).padStart(2,'0')}`;
    const { error } = await supabase.from("blocked_dates").insert([{blocked_date:formattedDate}]);
    if(!error) setBlockedDate(null);
  };

  const logout = () => {
    localStorage.removeItem("admin-auth");
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="mx-auto max-w-6xl">

        <div className="flex items-center justify-between mb-10">
          <h1 className="text-5xl font-black text-yellow-500">ADMIN PANEL</h1>
          <button onClick={logout} className="bg-red-500 px-6 py-3 rounded-2xl font-bold">Wyloguj</button>
        </div>

        {/* Wybór dnia do blokowania godzin */}
        <div className="mb-6">
          <DatePicker
            selected={selectedDay}
            onChange={(date: Date | null) => { setSelectedDay(date); fetchBlockedHours(date); }}
            minDate={new Date()}
            placeholderText="Wybierz dzień do blokowania godzin"
            className="p-4 rounded-2xl bg-black border border-zinc-700 outline-none"
          />
        </div>

        {/* Godziny do blokowania */}
        {selectedDay && (
          <div className="mb-10 bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <h2 className="text-2xl font-bold mb-4">Blokuj godziny dnia {selectedDay.toLocaleDateString()}</h2>
            <div className="flex flex-wrap gap-3">
              {hours.map(hour=>{
                const isBlocked = blockedHours.includes(hour);
                return (
                  <button key={hour} onClick={()=>isBlocked?unblockHour(hour):blockHour(hour)}
                    className={`px-4 py-2 rounded-2xl font-bold ${isBlocked?"bg-red-500":"bg-yellow-500 text-black"}`}>
                    {hour} {isBlocked?"(zablokowane)":"(dostępne)"}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Blokowanie całych dni */}
        <div className="mb-10 bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <h2 className="text-2xl font-bold mb-4">Blokuj cały dzień</h2>
          <DatePicker
            selected={blockedDate}
            onChange={(date: Date | null)=>setBlockedDate(date)}
            minDate={new Date()}
            placeholderText="Wybierz dzień"
            className="p-4 rounded-2xl bg-black border border-zinc-700 outline-none"
          />
          <button onClick={blockDateHandler} className="bg-red-500 px-6 py-3 rounded-2xl font-bold mt-2">Zablokuj dzień</button>
        </div>

        {/* Rezerwacje */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <h2 className="text-2xl font-bold mb-4">Rezerwacje</h2>
          <div className="flex flex-col gap-3">
            {bookings.map(b=>(
              <div key={b.id} className="bg-black border border-zinc-700 p-3 rounded-2xl flex justify-between items-center">
                <div>
                  <p className="font-bold">{b.name}</p>
                  <p className="text-zinc-400">{b.booking_date} • {b.booking_hour}</p>
                </div>
                <button onClick={()=>deleteBooking(b.id)} className="text-red-500 font-bold">Usuń</button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}