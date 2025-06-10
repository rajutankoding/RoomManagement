"use client";
import { useState } from "react";
import ApiCalendar from "react-google-calendar-api";
import styles from "./page.module.css";
import Calendar from "./components/Calendar";
const config = {
  clientId: "<CLIENT_ID>",
  apiKey: "<API_KEY>",
  scope: "https://www.googleapis.com/auth/calendar",
  discoveryDocs: [
    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
  ],
};

const apiCalendar = new ApiCalendar(config);

// Data jadwal
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

// Map singkatan hari ke nama lokal
const dayMap = {
  MON: "Senin",
  TUE: "Selasa",
  WED: "Rabu",
  THU: "Kamis",
  FRI: "Jumat",
};

// Komponen CourseCard
const CourseCard = ({ name, time, highlight }) => (
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
    <button className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors">
      &#x22EE;
    </button>
  </div>
);

// Komponen DaySchedule
const DaySchedule = ({ day, courses }) => (
  <div className="relative flex items-start mb-8">
    <div className="w-20 flex-shrink-0 text-white font-bold text-sm mt-2">
      {dayMap[day]}
    </div>
    <div className="flex-1 ml-4 relative">
      {courses.map((course, index) => (
        <CourseCard key={index} {...course} />
      ))}
    </div>
  </div>
);

const handleItemClick = (event, item) => {
  event.preventDefault();
  // Logika untuk menangani klik item, misalnya membuka detail atau melakukan booking
  console.log("Item clicked:", item);
};

// Komponen utama
export default function SchedulePage() {
  const [selectedDay, setSelectedDay] = useState("");

  const filteredSchedule = selectedDay
    ? scheduleData.filter((d) => d.day === selectedDay)
    : scheduleData;

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
              {filteredSchedule.map((dayData, index) => (
                <DaySchedule key={index} {...dayData} />
              ))}
            </div>
          </div>

          {/* Kolom 2: Booking QR */}
          {/* <div className="flex flex-col items-center justify-center h-[80vh] text-white">
            <h2 className="text-xl font-bold mb-4">Booking Ruangan</h2>
            <div className="bg-white p-4 rounded-xl shadow-xl">
              <img src="/qr-code.jpg" alt="QR Booking" className="w-40 h-40" />
            </div>
            <p className="mt-4 text-sm opacity-80 text-center">
              Scan QR ini untuk melakukan pemesanan
            </p>
          </div> */}
          <div className="">
            <Calendar />
          </div>

          {/* Kolom 3: Prambanan */}
          <div className="bg-purple-800/30 backdrop-blur-xl border border-purple-400/20 rounded-3xl p-6 shadow-2xl flex flex-col h-[80vh]">
            <div className="text-white mb-4">
              <h1 className="text-2xl font-bold">PRAMBANAN</h1>
              <p className="text-sm opacity-80">Ruang Meeting 2</p>
            </div>
            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar relative">
              {filteredSchedule.map((dayData, index) => (
                <DaySchedule key={index} {...dayData} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
