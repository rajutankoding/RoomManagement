// src/app/page.jsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";
import Calendar from "./components/Calendar"; // Pastikan path ini benar

// --- Komponen utama ---
export default function SchedulePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingsByDate, setBookingsByDate] = useState({}); // Data untuk Calendar
  const [processedSchedule, setProcessedSchedule] = useState([]); // Data untuk kolom jadwal harian
  const [dataBe, setDataBe] = useState([]); // Menyimpan data mentah dari backend
  const [currentTime, setCurrentTime] = useState(new Date()); // Digunakan untuk perhitungan highlight

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
  const dayMap = {
    SUN: "Minggu",
    MON: "Senin",
    TUE: "Selasa",
    WED: "Rabu",
    THU: "Kamis",
    FRI: "Jumat",
    SAT: "Sabtu",
  };

  // --- Komponen Pembantu ---
  const CourseCard = ({
    name,
    time,
    room,
    bookedBy,
    highlight,
    bagian,
    bidang,
  }) => (
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
      {/* {room && <div className="text-xs opacity-70">Ruangan: {room}</div>} */}
      {/* {bookedBy && <div className="text-xs opacity-70">Oleh: {bookedBy}</div>} */}
      {/* Tampilkan Bagian dan Bidang jika ada */}
      {bagian && <div className="text-xs opacity-70">Bagian: {bagian}</div>}
      {/* {bidang && <div className="text-xs opacity-70">Bidang: {bidang}</div>} */}
      <button className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors">
        &#x22EE;
      </button>
    </div>
  );

  // Perubahan di sini: tambahkan `dateDisplay` sebagai prop baru
  const DaySchedule = ({ day, dateDisplay, courses }) => (
    <div className="relative flex items-start mb-8">
      <div className="w-20 flex-shrink-0 text-white font-bold text-sm mt-2">
        <div>{dayMap[day]}</div>
        {/* Tampilkan tanggal di bawah nama hari */}
        {dateDisplay && (
          <div className="text-xs opacity-70 font-normal">{dateDisplay}</div>
        )}
      </div>
      <div className="flex-1 ml-4 relative">
        {courses.length > 0 ? (
          courses.map((course, index) => <CourseCard key={index} {...course} />)
        ) : (
          <p className="text-gray-400 text-sm italic mt-4">Tidak ada jadwal.</p>
        )}
      </div>
    </div>
  );

  const getTodayDayNumber = () => {
    return new Date().getDay(); // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
  };

  const calculateHighlight = (bookingDate, startTime, endTime) => {
    const now = new Date();
    const courseStartDate = new Date(`${bookingDate}T${startTime}:00`);
    const courseEndDate = new Date(`${bookingDate}T${endTime}:00`);

    return now >= courseStartDate && now <= courseEndDate;
  };

  // Fungsi helper untuk memformat tanggal
  const formatDate = (dateString) => {
    const options = { day: "numeric", month: "short" }; // Misalnya "23 Jun"
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  // --- Fungsi untuk Memproses Data Booking ---
  const processBookingData = useCallback((dataFromBackend) => {
    const groupedByDate = {};
    const allBookings = [];

    for (const dateKey in dataFromBackend) {
      if (Object.prototype.hasOwnProperty.call(dataFromBackend, dateKey)) {
        const bookingsForThisDate = dataFromBackend[dateKey];
        groupedByDate[dateKey] = bookingsForThisDate;

        bookingsForThisDate.forEach((booking) => {
          const fullBooking = { ...booking, date: dateKey };
          allBookings.push(fullBooking);
        });
      }
    }
    setBookingsByDate(groupedByDate);

    const groupedByDayShort = {};
    allBookings.forEach((booking) => {
      const bookingDate = new Date(booking.date);
      const dayNumber = bookingDate.getDay();
      const shortDay = fullDayToShortDayMap[dayNumber];

      if (!groupedByDayShort[shortDay]) {
        groupedByDayShort[shortDay] = {
          day: shortDay,
          // Tambahkan `dateDisplay` di sini, ambil dari booking pertama yang ditemukan untuk hari itu
          // Atau lebih baik, buat struktur yang bisa menampung tanggal spesifik per hari
          // Kita akan mengelola tanggal di `finalSchedule` nanti agar lebih akurat per tanggal.
          courses: [],
          datesFound: new Set(), // Untuk menyimpan tanggal unik yang ditemukan untuk hari ini
        };
      }
      groupedByDayShort[shortDay].datesFound.add(booking.date); // Tambahkan tanggal ke Set

      groupedByDayShort[shortDay].courses.push({
        name: booking.activity || "Kegiatan Tidak Dikenal",
        time: `${booking.startTime} - ${booking.endTime}`,
        room: booking.room,
        bookedBy: booking.bookedBy,
        bagian: booking.bagian,
        bidang: booking.bidang,
        highlight: calculateHighlight(
          booking.date,
          booking.startTime,
          booking.endTime
        ),
      });
    });

    // Urutkan courses berdasarkan waktu mulai untuk setiap hari
    for (const dayKey in groupedByDayShort) {
      if (Object.prototype.hasOwnProperty.call(groupedByDayShort, dayKey)) {
        groupedByDayShort[dayKey].courses.sort((a, b) => {
          const timeA = a.time.split(" - ")[0];
          const timeB = b.time.split(" - ")[0];
          return timeA.localeCompare(timeB);
        });
      }
    }

    const todayDayNumber = getTodayDayNumber();
    const orderedDays = []; // Akan menyimpan objek { day: 'MON', date: '2025-06-23', dateDisplay: '23 Jun' }

    // Buat daftar tanggal untuk 7 hari ke depan mulai dari hari ini
    // Untuk memastikan setiap "hari" di sidebar memiliki tanggal yang spesifik
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + i);
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`; // Format YYYY-MM-DD

      const dayNumber = currentDate.getDay();
      const shortDay = fullDayToShortDayMap[dayNumber];

      // Ambil bookings untuk tanggal spesifik ini dari groupedByDate
      const coursesForThisDate = groupedByDate[formattedDate] || [];

      // Proses courses untuk tanggal spesifik ini, bukan hanya berdasarkan nama hari
      const processedCoursesForThisDate = coursesForThisDate
        .map((booking) => ({
          name: booking.activity || "Kegiatan Tidak Dikenal",
          time: `${booking.startTime} - ${booking.endTime}`,
          room: booking.room,
          bookedBy: booking.bookedBy,
          bagian: booking.bagian,
          bidang: booking.bidang,
          highlight: calculateHighlight(
            formattedDate,
            booking.startTime,
            booking.endTime
          ),
        }))
        .sort((a, b) => {
          // Urutkan juga di sini
          const timeA = a.time.split(" - ")[0];
          const timeB = b.time.split(" - ")[0];
          return timeA.localeCompare(timeB);
        });

      orderedDays.push({
        day: shortDay,
        date: formattedDate,
        dateDisplay: formatDate(formattedDate),
        courses: processedCoursesForThisDate,
      });
    }

    setProcessedSchedule(orderedDays); // Update processedSchedule dengan data yang lebih lengkap
    setLoading(false);
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("http://192.168.5.3:3005/api/schedule");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        processBookingData(data);
        setDataBe(data);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
        setError("Gagal memuat jadwal. Silakan coba lagi nanti.");
        setLoading(false);
      }
    };

    fetchBookings();

    const intervalId = setInterval(() => {
      fetchBookings();
    }, 60 * 1000);

    return () => clearInterval(intervalId);
  }, [processBookingData]);

  if (loading) {
    return (
      <div className={styles.background}>
        <div className="min-h-screen flex items-center justify-center text-white text-2xl">
          Memuat jadwal...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.background}>
        <div className="min-h-screen flex items-center justify-center text-red-400 text-2xl text-center">
          {error}
        </div>
      </div>
    );
  }

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
                  key={dayData.date} // Gunakan tanggal sebagai key untuk unik
                  day={dayData.day}
                  dateDisplay={dayData.dateDisplay} // Teruskan prop tanggal
                  courses={dayData.courses.filter(
                    (c) => c.room === "BOROBUDUR"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Kolom 2: Calendar */}
          <div className="">
            <Calendar
              data={bookingsByDate}
              onDataChange={() => processBookingData(dataBe)}
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
                  key={dayData.date} // Gunakan tanggal sebagai key untuk unik
                  day={dayData.day}
                  dateDisplay={dayData.dateDisplay} // Teruskan prop tanggal
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
