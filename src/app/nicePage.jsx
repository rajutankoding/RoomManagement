"use client";
import { useEffect, useState } from "react";
import ApiCalendar from "react-google-calendar-api";
import styles from "./page.module.css";
import Calendar from "./components/Calendar";
const config = {
  clientId: "proud-armor-436802-v1",
  apiKey: "AIzaSyBKO9lBWwaDFGcN53Bw3NIStFqO4P4hObQ",
  scope: "https://www.googleapis.com/auth/calendar",
  discoveryDocs: [
    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
  ],
};

// Map singkatan hari ke nama lokal
const dayMap = {
  MON: "Senin",
  TUE: "Selasa",
  WED: "Rabu",
  THU: "Kamis",
  FRI: "Jumat",
};

function groupBookingsByDay(bookings) {
  const result = {};

  bookings.forEach((booking) => {
    const date = new Date(booking.date);
    const dayKey = dayMap[date.getDay()]; // e.g. "WED"

    if (!result[dayKey]) {
      result[dayKey] = [];
    }

    result[dayKey].push({
      name: booking.event || "Meeting",
      time: `${booking.startTime} - ${booking.endTime}`,
      room: booking.room,
      bookedBy: booking.bookedBy,
    });
  });

  // Convert to array (like old format)
  return Object.keys(result).map((day) => ({
    day,
    courses: result[day],
  }));
}

// Komponen utama
export default function SchedulePage() {
  const [backendBookings, setBackendBookings] = useState([]);
  const [processedSchedule, setProcessedSchedule] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date()); // Update waktu setiap detik
    }, 60 * 1000); // Update setiap detik
    return () => clearInterval(interval); // Bersihkan interval saat komponen unmount
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("http://192.168.5.3:3005/api/schedule"); // Ganti dengan endpoint API backend Anda
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setBackendBookings(data); // Simpan data mentah dari BE
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
        // Handle error, misalnya tampilkan pesan ke user
      }
    };

    fetchBookings();
  }, []);

  // Komponen CourseCard
  const CourseCard = ({
    name,
    time,
    startTime,
    endTime,
    highlight,
    currentTime,
  }) => {
    const getStatus = () => {
      const now = currentTime;
      const nowMunutes = now.getHours() * 60 + now.getMinutes();
      const start = timeToMinutes(startTime);
      const end = timeToMinutes(endTime);

      if (nowMunutes >= start && nowMunutes <= end) return "Sedang Berlangsung";
      if (nowMunutes < start) return "Akan Datang";
      return "Sudah Lewat";
    };
    const status = getStatus();
    return (
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
  };

  // Komponen DaySchedule
  const DaySchedule = ({ day, courses }) => (
    <div className="relative flex items-start mb-8">
      <div className="w-20 flex-shrink-0 text-white font-bold text-sm mt-2">
        {dayMap[day]}
      </div>
      <div className="flex-1 ml-4 relative">
        {courses.map((course, index) => (
          <CourseCard key={index} {...course} currentTime={currentTime} />
        ))}
      </div>
    </div>
  );

  const handleItemClick = (event, item) => {
    event.preventDefault();
    // Logika untuk menangani klik item, misalnya membuka detail atau melakukan booking
    console.log("Item clicked:", item);
  };

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: "short" };
    return new Intl.DateTimeFormat("en-US", options).format(date).toUpperCase();
  };

  const timeToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== "string" || !timeStr.includes(":"))
      return 0;

    const [hour, minute] = timeStr.split(":").map(Number);
    return hour * 60 + minute;
  };

  const getStartAndEndOfWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return { monday, sunday };
  };

  const getTimeStatus = (start, end, now) => {
    if (now >= start && now <= end) return 0; // sedang berlangsung
    if (now < start) return 1; // akan datang
    return 2; // sudah lewat
  };

  const isEventHighlight = (dateString, startTime, endTime) => {
    const now = new Date();
    const eventStart = new Date(`${dateString}T${startTime}:00`);
    const eventEnd = new Date(`${dateString}T${endTime}:00`);
    return now >= eventStart && now <= eventEnd;
  };

  useEffect(() => {
    if (backendBookings.length > 0) {
      const { monday, sunday } = getStartAndEndOfWeek();

      // ⏳ Filter booking hanya yang ada dalam minggu ini
      const weeklyBookings = backendBookings.filter((booking) => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= monday && bookingDate <= sunday;
      });

      // 🧠 Lanjutkan seperti biasa pakai weeklyBookings
      const fullDayOrder = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      const today = new Date();
      const todayIndex = today.getDay();
      const dayOrder = [
        ...fullDayOrder.slice(todayIndex),
        ...fullDayOrder.slice(0, todayIndex),
      ];
      const grouped = {};

      weeklyBookings.forEach((booking) => {
        const day = getDayName(booking.date);

        if (!grouped[day]) {
          grouped[day] = [];
        }

        grouped[day].push({
          name: booking.event,
          time: `${booking.startTime} - ${booking.endTime}`,
          startTime: booking.startTime,
          highlight: isEventHighlight(
            booking.date,
            booking.startTime,
            booking.endTime
          ),
          room: booking.room,
          date: booking.date,
          bookedBy: booking.bookedBy,
        });
      });

      // Sorting dalam tiap hari
      dayOrder.forEach((day) => {
        if (grouped[day]) {
          grouped[day].sort(
            (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
          );

          if (day === getDayName(today.toISOString())) {
            const nowMinutes = today.getHours() * 60 + today.getMinutes();

            grouped[day].sort((a, b) => {
              const aStart = timeToMinutes(a.startTime);
              const aEnd = timeToMinutes(a.time.split(" - ")[1]);
              const bStart = timeToMinutes(b.startTime);
              const bEnd = timeToMinutes(b.time.split(" - ")[1]);

              const aStatus = getTimeStatus(aStart, aEnd, nowMinutes);
              const bStatus = getTimeStatus(bStart, bEnd, nowMinutes);

              // Urut: sedang berlangsung (0), akan datang (1), sudah lewat (2)
              if (aStatus !== bStatus) return aStatus - bStatus;

              // Kalau status sama, urutkan dari jam mulai
              return aStart - bStart;
            });
          }
        }
      });

      const sortedSchedule = dayOrder
        .map((day) =>
          grouped[day]
            ? {
                day,
                courses: grouped[day],
              }
            : null
        )
        .filter(Boolean);

      setProcessedSchedule(sortedSchedule);
    }
  }, [backendBookings]);

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
            <Calendar data={backendBookings} />
            <div className="flex flex-col items-center justify-center h-[80vh] text-white">
              <h2 className="text-xl font-bold mb-4">Booking Ruangan</h2>
              <div className="bg-white p-4 rounded-xl shadow-xl">
                <img
                  src="/qr-code.jpg"
                  alt="QR Booking"
                  className="w-40 h-40"
                />
              </div>
              <p className="mt-4 text-sm opacity-80 text-center">
                Scan QR ini untuk melakukan pemesanan
              </p>
            </div>
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
