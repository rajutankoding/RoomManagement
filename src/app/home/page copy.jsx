"use client";
import React from "react";
import "../globals.css"; // Pastikan path ini sesuai dengan struktur proyek Anda
// Data jadwal
const scheduleData = [
  {
    day: "Senin",
    courses: [
      { name: "Metode Penelitian B", time: "09.30 - 11.30", highlight: true },
      { name: "Fotografi Konseptual A", time: "13.30 - 15.30" },
    ],
  },
  {
    day: "Selasa",
    courses: [
      { name: "Creative Writing B", time: "08.30 - 09.30" },
      { name: "Studio CW", time: "09.30 - 11.30" },
      { name: "Studio Seminar B", time: "15.30 - 18.30" },
    ],
  },
  {
    day: "Rabu",
    courses: [
      { name: "Visual Branding B", time: "12.30 - 13.30" },
      { name: "Visbrand - Studio 1", time: "14.30 - 18.30" },
    ],
  },
  {
    day: "Kamis",
    courses: [
      { name: "Etika Profesi N1", time: "11.30 - 13.30" },
      { name: "Teknologi Grafika A", time: "13.30 - 15.30" },
    ],
  },
  {
    day: "Jumat",
    courses: [
      { name: "Seminar B", time: "08.30 - 10.30" },
      { name: "Visbrand - Studio 2", time: "14.30 - 18.30" },
    ],
  },
];

// Komponen untuk satu kartu mata kuliah
const CourseCard = ({ name, time, highlight }) => (
  // Menggunakan template literals (backticks) untuk className multi-baris
  <div
    className={`${
      highlight ? "bg-green-600 text-white" : "bg-white/30 text-gray-800"
    }
      rounded-xl w-full p-4 mb-3 shadow-md backdrop-blur-md transition-all duration-200
      hover:shadow-lg hover:scale-[1.02] relative
    `}>
    <div className="font-semibold text-lg">{name}</div>
    <div className="text-sm opacity-90">{time}</div>
    {/* Tombol ellipsis */}
    <button className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors">
      &#x22EE; {/* Three vertical dots (ellipsis) */}
    </button>
  </div>
);

// Komponen untuk jadwal satu hari
const DaySchedule = ({ day, courses }) => (
  <div className="relative flex items-start mb-6">
    {/* Timeline dot */}
    <div className="absolute left-8 top-0 mt-3 h-3 w-3 rounded-full bg-white ring-2 ring-white/50 z-10"></div>
    {/* Day name */}
    <div className="w-16 flex-shrink-0 right-8 text-white font-bold text-sm mt-2">
      {day}
    </div>
    {/* Courses list */}
    <div className="flex-1 ml-4 relative">
      {courses.map((course, index) => (
        <CourseCard key={index} {...course} />
      ))}
    </div>
  </div>
);

// Halaman utama jadwal
export default function SchedulePage() {
  return (
    // Menggunakan template literals (backticks) untuk className multi-baris
    <div className="gap-6 grid grid-cols-1 lg:grid-cols-3 justify-center items-stretch">
      <div
        className={`
        bg-emerald-500/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl
        w-full max-w-lg mx-auto my-8 relative overflow-hidden
        h-[calc(100vh-64px)] sm:h-auto sm:max-h-[85vh] flex flex-col
      `}>
        <div className="text-white mb-6">
          <h1 className="text-3xl font-bold">Ruang Borobudur</h1>
          <p className="text-sm opacity-80 mt-1">for the 4th semester</p>
        </div>

        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
          {/* Vertical line for timeline */}
          {/* Menggunakan nilai 'top' yang lebih spesifik untuk posisi garis, atau sesuaikan jika perlu */}
          <div className="absolute left-[70px] top-[140px] bottom-6 w-0.5 bg-white/30"></div>

          {scheduleData.map((dayData, index) => (
            <DaySchedule key={index} {...dayData} />
          ))}
        </div>
      </div>

      {/* Kolom 2: Booking QR */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center h-[80vh] text-white">
        <h2 className="text-xl font-bold mb-4">Booking Ruangan</h2>
        <div className="bg-white p-4 rounded-xl shadow-xl">
          {/* Ganti src ini dengan QR Code dinamis jika perlu */}
          <img
            src="/qrcode-placeholder.png"
            alt="QR Booking"
            className="w-40 h-40"
          />
        </div>
        <p className="mt-4 text-sm opacity-80 text-center">
          Scan QR ini untuk melakukan pemesanan
        </p>
      </div>

      <div
        className={`
        bg-purple-500/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl
        w-full max-w-lg mx-auto my-8 relative overflow-hidden
        h-[calc(100vh-64px)] sm:h-auto sm:max-h-[85vh] flex flex-col
      `}>
        <div className="text-white mb-6">
          <h1 className="text-3xl font-bold">Ruang Prambanan</h1>
          <p className="text-sm opacity-80 mt-1">for the 4th semester</p>
        </div>

        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
          {/* Vertical line for timeline */}
          {/* Menggunakan nilai 'top' yang lebih spesifik untuk posisi garis, atau sesuaikan jika perlu */}
          <div className="absolute left-[70px] top-[140px] bottom-6 w-0.5 bg-white/30"></div>

          {scheduleData.map((dayData, index) => (
            <DaySchedule key={index} {...dayData} />
          ))}
        </div>
      </div>
    </div>
  );
}
