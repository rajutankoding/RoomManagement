"use client";
import React, { useState } from "react";
import "../globals.css"; // Pastikan file ini ada dan berisi styling Tailwind CSS dasar Anda

// Data jadwal (tetap sama)
const scheduleData = [
  {
    day: "MON",
    courses: [
      { name: "Metode Penelitian B", time: "09.30 - 11.30", highlight: true },
      { name: "Fotografi Konseptual A", time: "13.30 - 15.30" },
    ],
  },
  {
    day: "TUE",
    courses: [
      { name: "Creative Writing B", time: "08.30 - 09.30" },
      { name: "Studio CW", time: "09.30 - 11.30" },
      { name: "Studio Seminar B", time: "15.30 - 18.30" },
    ],
  },
  {
    day: "WED",
    courses: [
      { name: "Visual Branding B", time: "12.30 - 13.30" },
      { name: "Visbrand - Studio 1", time: "14.30 - 18.30" },
    ],
  },
  {
    day: "THU",
    courses: [
      { name: "Etika Profesi N1", time: "11.30 - 13.30" },
      { name: "Teknologi Grafika A", time: "13.30 - 15.30" },
    ],
  },
  {
    day: "FRI",
    courses: [
      { name: "Seminar B", time: "08.30 - 10.30" },
      { name: "Visbrand - Studio 2", time: "14.30 - 18.30" },
    ],
  },
];

// Map singkatan hari ke nama lokal (tetap sama)
const dayMap = {
  MON: "Senin",
  TUE: "Selasa",
  WED: "Rabu",
  THU: "Kamis",
  FRI: "Jumat",
};

// --- Perubahan Besar di sini: CourseCard sekarang menjadi baris di dalam DaySchedule ---
// CourseCard sekarang lebih sederhana, mewakili satu baris waktu dan mata kuliah
const CourseDetailRow = ({ name, time, highlight }) => (
  <div
    className={`flex items-center py-2 ${
      highlight ? "text-green-500 font-semibold" : "text-gray-800"
    }`}>
    <div className="w-24 flex-shrink-0 text-sm font-medium pr-2 text-right">
      {time}
    </div>
    <div className="w-px h-6 bg-gray-300 mx-2"></div> {/* Vertical separator */}
    <div className="flex-1 text-sm pl-2">
      {name}
      {highlight && (
        <span className="ml-2 bg-yellow-400 text-xs text-black font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
          Sedang Berlangsung
        </span>
      )}
    </div>
  </div>
);

// Komponen DaySchedule (Diadaptasi untuk desain baru)
const DaySchedule = ({ day, courses }) => (
  <div className="mb-6 last:mb-0">
    {" "}
    {/* Hapus margin-bottom dari item terakhir */}
    <div className="flex items-start">
      {/* Kolom Kiri untuk Hari */}
      <div className="w-24 flex-shrink-0 text-right pr-4 pt-1">
        {" "}
        {/* Padding top agar sejajar dengan waktu */}
        <h3 className="text-sm font-bold text-gray-700">{dayMap[day]}</h3>
      </div>
      {/* Garis Vertikal Besar (sebagai pemisah visual hari dan detail jadwal) */}
      <div className="w-px bg-gray-300 h-auto self-stretch mx-2"></div>{" "}
      {/* Vertically stretchable line */}
      {/* Kolom Kanan untuk Detail Mata Kuliah */}
      <div className="flex-1 pl-4">
        {courses.map((course, index) => (
          <CourseDetailRow key={index} {...course} />
        ))}
      </div>
    </div>
  </div>
);

// Komponen utama SchedulePage (Dipercantik lebih lanjut)
export default function SchedulePage() {
  const [selectedDay, setSelectedDay] = useState("");

  const filteredSchedule = selectedDay
    ? scheduleData.filter((d) => d.day === selectedDay)
    : scheduleData;

  return (
    // Kontainer Grid Utama - Latar belakang kini menjadi fokus utama karena kartu transparan
    <div
      className="min-h-screen p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch
                    bg-gradient-to-br from-blue-400 to-indigo-600 dark:from-gray-800 dark:to-gray-900">
      {" "}
      {/* Latar belakang gradien */}
      {/* Kolom 1: Ruang Borobudur (Jadwal) */}
      <div
        className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-xl flex flex-col h-[80vh]
                      transition-shadow duration-300 hover:shadow-2xl">
        {" "}
        {/* Desain kartu putih transparan */}
        <div className="text-gray-800 mb-4">
          <h1 className="text-2xl font-bold">Ruang Borobudur</h1>
          <p className="text-sm opacity-80">Semester 4</p>
        </div>
        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar relative">
          {/* Garis vertikal timeline dihilangkan karena desain baru memiliki garis internal */}
          {filteredSchedule.map((dayData, index) => (
            <DaySchedule key={index} {...dayData} />
          ))}
        </div>
      </div>
      {/* Kolom 2: Booking QR */}
      <div
        className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white/90 backdrop-blur-md shadow-xl h-[80vh]
                      transition-shadow duration-300 hover:shadow-2xl">
        <h2 className="text-xl md:text-2xl font-bold mb-6 text-center text-gray-800">
          Booking Ruangan
        </h2>
        <div className="bg-gray-100 p-6 rounded-2xl shadow-lg border border-gray-200">
          <img
            src="/qrcode-placeholder.png" // Pastikan gambar ini ada di folder 'public' Anda
            alt="QR Booking"
            className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
          />
        </div>
        <p className="mt-6 text-sm opacity-80 text-center max-w-xs text-gray-700">
          Scan QR ini untuk melakukan pemesanan ruangan dan jadwal.
        </p>
      </div>
      {/* Kolom 3: Ruang Prambanan */}
      <div
        className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-xl flex flex-col h-[80vh]
                      transition-shadow duration-300 hover:shadow-2xl">
        <div className="text-gray-800 mb-4">
          <h1 className="text-2xl font-bold">Ruang Prambanan</h1>
          <p className="text-sm opacity-80">Semester 4</p>
        </div>
        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar relative">
          {filteredSchedule.map((dayData, index) => (
            <DaySchedule key={index} {...dayData} />
          ))}
        </div>
      </div>
    </div>
  );
}
