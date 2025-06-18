// src/app/page.jsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";
import Calendar from "./components/Calendar"; // Pastikan path ini benar

// --- Data Mock Backend (Sekarang ini adalah "simulasi" data dari BE) ---
// Kita akan memuat ini secara langsung untuk demo.
// Dalam aplikasi nyata, ini akan didapat dari fetch.
import backendDummyData from "../../dummyData.json"; // Sesuaikan path jika berbeda

// Map nama hari lengkap (dari Date.getDay()) ke singkatan (untuk kunci scheduleData)
// Sunday - Saturday : 0 - 6
const fullDayToShortDayMap = {
  0: "SUN",
  1: "MON",
  2: "TUE",
  3: "WED",
  4: "THU",
  5: "FRI",
  6: "SAT",
};

// Map singkatan hari ke nama lokal (untuk tampilan)
const shortDayToLocalNameMap = {
  SUN: "Minggu",
  MON: "Senin",
  TUE: "Selasa",
  WED: "Rabu",
  THU: "Kamis",
  FRI: "Jumat",
  SAT: "Sabtu",
};

// --- Komponen Pembantu (Tidak Berubah dari versi sebelumnya) ---

const CourseCard = ({ name, time, room, bookedBy, highlight }) => (
  <div
    className={`${
      highlight ? "bg-green-600 text-white" : "bg-white/30 text-gray-800"
    } rounded-xl p-4 mb-2 shadow-md backdrop-blur-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02] relative`}>
    <div className="font-semibold text-lg flex justify-between items-center">
      {name}
      {highlight && (
        <span className="bg-yellow-400 text-xs text-black font-bold px-2 py-0.5 rounded animate-pulse">
          Sedang Berlangsung
        </span>
      )}
    </div>
    <div className="text-sm opacity-90">{time}</div>
    {room && <div className="text-xs opacity-70">Ruangan: {room}</div>}
    {bookedBy && <div className="text-xs opacity-70">Oleh: {bookedBy}</div>}
    <button className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors">
      &#x22EE;
    </button>
  </div>
);

const DaySchedule = ({ day, courses }) => (
  <div className="relative flex items-start mb-8">
    <div className="absolute left-8 top-0 mt-3 h-3 w-3 rounded-full bg-white ring-2 ring-white/50 z-10"></div>
    <div className="w-20 flex-shrink-0 text-white font-bold text-sm mt-2">
      {shortDayToLocalNameMap[day]}
    </div>
    <div className="flex-1 ml-4 relative">
      {courses.length > 0 ? (
        courses.map((course, index) => <CourseCard key={index} {...course} />)
      ) : (
        <div className="p-4 text-gray-500 text-sm italic">
          Tidak ada kegiatan terjadwal.
        </div>
      )}
    </div>
  </div>
);

// --- Komponen utama ---
export default function SchedulePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingsByDate, setBookingsByDate] = useState({}); // Data untuk Calendar
  const [processedSchedule, setProcessedSchedule] = useState([]); // Data untuk kolom jadwal harian

  const getTodayDayNumber = () => {
    return new Date().getDay(); // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
  };

  const calculateHighlight = (bookingDate, startTime, endTime) => {
    const now = new Date();
    // Pastikan bookingDate adalah string 'YYYY-MM-DD'
    const courseStartDate = new Date(`${bookingDate}T${startTime}:00`);
    const courseEndDate = new Date(`${bookingDate}T${endTime}:00`);

    return now >= courseStartDate && now <= courseEndDate;
  };

  // --- Fungsi untuk Memproses Data Booking ---
  // Fungsi ini akan mengambil data dari backendDummyData (yang mensimulasikan data BE)
  const processBookingData = useCallback((dataFromBackend) => {
    const groupedByDate = {}; // Untuk prop `data` di Calendar
    const allBookings = []; // Untuk mengumpulkan semua booking dari semua tanggal

    // Iterasi melalui properti (tanggal) dari objek backendDummyData
    for (const dateKey in dataFromBackend) {
      if (Object.prototype.hasOwnProperty.call(dataFromBackend, dateKey)) {
        const bookingsForThisDate = dataFromBackend[dateKey];
        groupedByDate[dateKey] = bookingsForThisDate; // Langsung gunakan array yang ada

        // Tambahkan semua booking ke allBookings untuk proses jadwal harian
        bookingsForThisDate.forEach((booking) => {
          // Tambahkan properti 'date' yang mungkin tidak ada di individual booking jika kunci adalah tanggal
          // Pastikan format date adalah YYYY-MM-DD untuk konsistensi
          const fullBooking = { ...booking, date: dateKey };
          allBookings.push(fullBooking);
        });
      }
    }
    setBookingsByDate(groupedByDate); // Update state bookingsByDate untuk Calendar

    const groupedByDayShort = {}; // Untuk kolom jadwal harian
    allBookings.forEach((booking) => {
      const bookingDate = new Date(booking.date);
      const dayNumber = bookingDate.getDay();
      const shortDay = fullDayToShortDayMap[dayNumber];

      if (!groupedByDayShort[shortDay]) {
        groupedByDayShort[shortDay] = {
          day: shortDay,
          courses: [],
        };
      }

      groupedByDayShort[shortDay].courses.push({
        name: booking.activity || booking.event || "Kegiatan Tidak Dikenal", // Gunakan 'activity' atau 'event'
        time: `${booking.startTime} - ${booking.endTime}`,
        room: booking.room,
        bookedBy: booking.bookedBy,
        highlight: calculateHighlight(
          booking.date.split("T")[0],
          booking.startTime,
          booking.endTime
        ),
      });
    });

    const todayDayNumber = getTodayDayNumber();
    const orderedDaysKeys = [];
    // Urutkan hari mulai dari hari ini
    for (let i = 0; i < 7; i++) {
      orderedDaysKeys.push(fullDayToShortDayMap[(todayDayNumber + i) % 7]);
    }

    const finalSchedule = orderedDaysKeys
      .map(
        (dayKey) => groupedByDayShort[dayKey] || { day: dayKey, courses: [] }
      )
      .filter(Boolean); // Filter out any null/undefined entries if any

    setProcessedSchedule(finalSchedule); // Update state processedSchedule untuk kolom jadwal
    setLoading(false); // Set loading ke false setelah data diproses
  }, []); // Dependensi kosong karena fungsi ini tidak bergantung pada state/props lain

  // --- useEffect untuk memicu proses data saat komponen dimuat ---
  // dan juga untuk interval refresh highlight
  useEffect(() => {
    // Memproses data langsung dari import dummyData.json
    // Simulasikan delay fetch jika perlu dengan setTimeout
    // setTimeout(() => {
    processBookingData(backendDummyData);
    // }, 500); // Contoh delay 500ms

    // Setup interval untuk refresh data setiap menit (untuk update highlight)
    // Dalam kasus nyata dengan BE, ini akan memicu fetch ulang.
    // Karena kita pakai dummyData, ini hanya akan me-recalculate highlight
    const intervalId = setInterval(() => {
      processBookingData(backendDummyData);
    }, 60 * 1000);

    // Cleanup function untuk membersihkan interval saat komponen dilepas
    return () => clearInterval(intervalId);
  }, [processBookingData]); // Tambahkan processBookingData sebagai dependency

  return (
    <div className={styles.background}>
      <div className={"min-h-screen max-h-screen"}>
        <h1 className="text-center mt-3 text-white">
          <span className="text-4xl font-bold ">
            Informasi Jadwal Ruangan Meeting
          </span>
        </h1>
        <div className=" px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Kolom 1: Borobudur */}
          <div className="bg-emerald-800/30 backdrop-blur-xl border border-emerald-400/20 rounded-3xl p-6 shadow-2xl flex flex-col h-[80vh]">
            <div className="text-white mb-4">
              <h1 className="text-2xl font-bold">BOROBUDUR</h1>
              <p className="text-sm opacity-80">Ruang Meeting 1</p>
            </div>
            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar relative">
              {processedSchedule.map((dayData, index) => (
                <DaySchedule
                  key={index}
                  day={dayData.day}
                  courses={dayData.courses.filter(
                    (c) => c.room === "BOROBUDUR"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Kolom 2: Booking QR */}
          <div className="">
            {/* <div className="flex flex-col items-center justify-center h-[80vh] text-white">
            <h2 className="text-xl font-bold mb-4">Booking Ruangan</h2>
            <div className="bg-white p-4 rounded-xl shadow-xl">
              <img src="/qr-code.jpg" alt="QR Booking" className="w-40 h-40" />
            </div>
            <p className="mt-4 text-sm opacity-80 text-center">
              Scan QR ini untuk melakukan pemesanan
            </p>
          </div> */}
            <Calendar
              data={bookingsByDate}
              onDataChange={() => processBookingData(backendDummyData)} // Memanggil ulang processBookingData dengan dummyData
            />
          </div>

          {/* Kolom 3: Prambanan */}
          <div className="bg-purple-800/30 backdrop-blur-xl border border-purple-400/20 rounded-3xl p-6 shadow-2xl flex flex-col h-[80vh]">
            <div className="text-white mb-4">
              <h1 className="text-2xl font-bold">PRAMBANAN</h1>
              <p className="text-sm opacity-80">Ruang Meeting 2</p>
            </div>
            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar relative">
              {processedSchedule.map((dayData, index) => (
                <DaySchedule
                  key={index}
                  day={dayData.day}
                  courses={dayData.courses.filter(
                    (c) => c.room === "PRAMBANAN"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
