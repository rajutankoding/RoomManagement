// src/components/Calendar.jsx
"use client";

import { QRCodeCanvas } from "qrcode.react";
import React, { useState, useEffect, useCallback } from "react"; // Tambahkan useCallback dan useEffect
// import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from 'date-fns'; // Opsional: jika ingin menggunakan date-fns
// Untuk kesederhanaan, kita akan tetap pakai Date object standar JS

// --- Fungsi Pembantu ---

// Fungsi untuk menghasilkan hari-hari kalender dalam sebulan
const generateCalendarDays = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday...

  // Sesuaikan firstDayOfMonth agar Senin adalah indeks 0
  // Jika Sunday (0) menjadi 6 (akhir minggu), Senin (1) menjadi 0 (awal minggu)
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const prevMonthDaysCount = new Date(year, month, 0).getDate();
  const days = [];

  // Tambahkan hari dari bulan sebelumnya (untuk mengisi baris pertama kalender)
  for (let i = adjustedFirstDay; i > 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthDaysCount - i + 1),
      isCurrentMonth: false,
    });
  }

  // Tambahkan hari dari bulan saat ini
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
    });
  }

  // Tambahkan hari dari bulan berikutnya (untuk melengkapi baris terakhir kalender agar 6x7 grid)
  const remainingDays = 42 - days.length; // 6 baris * 7 hari = 42
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    });
  }

  return days;
};

// Fungsi untuk memformat tanggal menjadi YYYY-MM-DD
const formatDateToKey = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Fungsi untuk memeriksa apakah dua tanggal sama (hanya tanggal, abaikan waktu)
const isSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// --- Komponen Kalender Utama ---
export default function Calendar({ data }) {
  // console.log("Cek Data", data);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null); // Menyimpan objek booking yang sedang diedit
  const [bookingsData, setBookingsData] = useState({}); // State untuk menyimpan data booking
  const [bookingForm, setBookingForm] = useState({
    id: null,
    bidang: "",
    bagian: "",
    room: "",
    activity: "",
    startTime: "",
    endTime: "",
    bookedBy: "",
  });
  useEffect(() => {
    setBookingsData(data);
  }, [data]);

  // --- Fungsi untuk Mengelola Data Booking (CRUD) ---

  // Fetches bookings for a specific date (from local state for now, eventually from BE)
  const getBookingsForDate = useCallback(
    (date) => {
      const dateKey = formatDateToKey(date);
      return bookingsData[dateKey] || [];
    },
    [bookingsData]
  ); // Tambahkan bookingsData sebagai dependency

  // Menangani perubahan input pada form booking
  const handleBookingFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setBookingForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  }, []);

  // Membuka modal dan mengatur form untuk booking baru
  const openModalForNewBooking = useCallback((date) => {
    setSelectedDate(date);
    setEditingBooking(null); // Pastikan bukan mode edit
    setBookingForm({
      id: null,
      bidang: "",
      bagian: "",
      room: "",
      activity: "",
      startTime: "",
      endTime: "",
      bookedBy: "",
    });
    setIsModalOpen(true);
  }, []);

  // Membuka modal dan mengisi form untuk mengedit booking yang sudah ada
  const openModalForEditBooking = useCallback((booking) => {
    setSelectedDate(new Date(booking.date || "")); // Pastikan ada tanggal di booking object
    setEditingBooking(booking); // Set booking yang sedang diedit
    setBookingForm({
      id: booking.id,
      bidang: booking.bidang,
      bagian: booking.bagian,
      room: booking.room,
      activity: booking.activity,
      startTime: booking.startTime,
      endTime: booking.endTime,
      bookedBy: booking.bookedBy,
    });
    setIsModalOpen(true);
  }, []);

  // Menutup modal dan mereset semua state terkait form
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedDate(null);
    setEditingBooking(null);
    setBookingForm({
      id: null,
      bidang: "",
      bagian: "",
      room: "",
      activity: "",
      startTime: "",
      endTime: "",
      bookedBy: "",
    });
  }, []);

  // Menangani pembuatan booking baru
  const handleCreateBooking = useCallback(
    (e) => {
      e.preventDefault();
      if (!selectedDate) return;

      const dateKey = formatDateToKey(selectedDate);
      const newBookingData = {
        id: Date.now(), // ID unik
        bidang: bookingForm.bidang,
        bagian: bookingForm.bagian,
        date: dateKey, // Tambahkan tanggal ke objek booking
        room: bookingForm.room,
        activity: bookingForm.activity,
        startTime: bookingForm.startTime,
        endTime: bookingForm.endTime,
        bookedBy: bookingForm.bookedBy,
      };

      setBookingsData((prevBookings) => ({
        ...prevBookings,
        [dateKey]: [...(prevBookings[dateKey] || []), newBookingData],
      }));

      console.log("Booking baru ditambahkan:", newBookingData);
      alert(
        `Booking "${newBookingData.activity}" di ${newBookingData.room} pada ${dateKey} berhasil ditambahkan!`
      );
      closeModal();
    },
    [selectedDate, bookingForm, closeModal]
  ); // Dependencies

  // Menangani pembaruan booking yang sudah ada
  const handleUpdateBooking = useCallback(
    (e) => {
      e.preventDefault();
      if (!editingBooking || !selectedDate) return;

      const dateKey = formatDateToKey(selectedDate);
      const updatedBookingData = {
        ...editingBooking, // Pertahankan properti lain dari booking asli
        ...bookingForm, // Overwrite dengan data dari form
        date: dateKey, // Pastikan tanggal tetap konsisten
      };

      setBookingsData((prevBookings) => ({
        ...prevBookings,
        [dateKey]: prevBookings[dateKey].map((booking) =>
          booking.id === updatedBookingData.id ? updatedBookingData : booking
        ),
      }));

      console.log("Booking diupdate:", updatedBookingData);
      alert(`Booking "${updatedBookingData.activity}" berhasil diupdate!`);
      closeModal();
    },
    [editingBooking, selectedDate, bookingForm, closeModal]
  ); // Dependencies

  // Menangani penghapusan booking
  const handleDeleteBooking = useCallback(() => {
    if (!editingBooking || !selectedDate) return;

    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus booking "${editingBooking.activity}"?`
    );
    if (!confirmDelete) return;

    const dateKey = formatDateToKey(selectedDate);

    setBookingsData((prevBookings) => ({
      ...prevBookings,
      [dateKey]: prevBookings[dateKey].filter(
        (booking) => booking.id !== editingBooking.id
      ),
    }));

    alert(`Booking "${editingBooking.activity}" berhasil dihapus!`);
    closeModal();
  }, [editingBooking, selectedDate, closeModal]); // Dependencies

  // Fungsi untuk membatalkan proses edit/tambah booking (menutup modal tanpa simpan)
  const cancelOrder = useCallback(() => {
    closeModal();
  }, [closeModal]);

  // --- Fungsi Navigasi Kalender ---

  const goToNextMonth = useCallback(() => {
    setCurrentMonth((prevMonth) => {
      const nextMonth = new Date(prevMonth);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth;
    });
  }, []);

  const goToPrevMonth = useCallback(() => {
    setCurrentMonth((prevMonth) => {
      const prevMonthDate = new Date(prevMonth);
      prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
      return prevMonthDate;
    });
  }, []);

  // --- Render Komponen ---

  const daysInMonth = generateCalendarDays(currentMonth);
  const currentMonthName = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(currentMonth);

  const daysOfWeek = [
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
    "Minggu",
  ];

  return (
    <div className="bg-blue-800/30 backdrop-blur-xl border border-blue-400/20 rounded-3xl p-6 shadow-2xl h-[80vh] flex flex-col justify-between text-white">
      {/* Header Kalender */}

      <div className="flex justify-between items-center mb-4">
        <button
          onClick={goToPrevMonth}
          className="p-2 rounded-full hover:bg-white/20 transition-colors">
          &lt;
        </button>
        <h2 className="text-xl font-semibold">{currentMonthName}</h2>
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-full hover:bg-white/20 transition-colors">
          &gt;
        </button>
      </div>

      {/* Nama Hari dalam Seminggu */}
      <div className="grid grid-cols-7 text-center text-sm font-medium mb-2">
        {daysOfWeek.map((day) => (
          <div key={day}>{day.substring(0, 3)}</div>
        ))}
      </div>

      {/* Grid Hari Kalender */}
      <div className="grid grid-cols-7 gap-1 flex-grow">
        {daysInMonth.map((day, index) => {
          const isSelected = selectedDate && isSameDay(day.date, selectedDate);
          const isToday = isSameDay(day.date, new Date());
          const bookingsOnThisDay = getBookingsForDate(day.date);

          return (
            <div
              key={index}
              className={`
                relative flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer
                ${
                  day.isCurrentMonth
                    ? "hover:bg-white/20"
                    : "text-gray-400 cursor-not-allowed"
                }
                ${isSelected ? "bg-purple-600 text-white" : ""}
                ${
                  isToday && day.isCurrentMonth
                    ? "border-2 border-red-500 font-bold"
                    : ""
                }
              `}
              onClick={() =>
                day.isCurrentMonth && openModalForNewBooking(day.date)
              } // Hanya izinkan klik bulan ini
            >
              <span className="text-sm">{day.date.getDate()}</span>
              {bookingsOnThisDay.length > 0 && (
                <div className="absolute bottom-1 right-1 left-1 flex justify-center space-x-1">
                  {/* Tampilkan jumlah booking untuk BOROBUDUR jika ada */}
                  {bookingsOnThisDay.filter((c) => c.room === "BOROBUDUR")
                    .length > 0 && (
                    <span
                      className="text-xs font-semibold px-1 py-0.5 rounded bg-emerald-400 text-black"
                      title={`${
                        bookingsOnThisDay.filter((c) => c.room === "BOROBUDUR")
                          .length
                      } kegiatan Borobudur`}>
                      {
                        bookingsOnThisDay.filter((c) => c.room === "BOROBUDUR")
                          .length
                      }
                    </span>
                  )}

                  {/* Tampilkan jumlah booking untuk PRAMBANAN jika ada */}
                  {bookingsOnThisDay.filter((c) => c.room === "PRAMBANAN")
                    .length > 0 && (
                    <span
                      className="text-xs font-semibold px-1 py-0.5 rounded bg-purple-400 text-black"
                      title={`${
                        bookingsOnThisDay.filter((c) => c.room === "PRAMBANAN")
                          .length
                      } kegiatan Prambanan`}>
                      {
                        bookingsOnThisDay.filter((c) => c.room === "PRAMBANAN")
                          .length
                      }
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Booking */}
      {isModalOpen && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {/* {editingBooking ? "Edit Booking" : "Buat Booking Baru"} pada{" "} */}
              Antrian Kegiatan{" "}
              {new Intl.DateTimeFormat("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }).format(selectedDate)}
            </h3>
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-700 mb-2">
                Bookings yang sudah ada:
              </h4>
              {getBookingsForDate(selectedDate).length > 0 ? (
                <ul className="space-y-2  overflow-y-auto custom-scrollbar">
                  {getBookingsForDate(selectedDate).map((booking) => (
                    <li
                      key={booking.id}
                      className={`${
                        booking.room == "BOROBUDUR"
                          ? "bg-emerald-800/30 backdrop-blur-xl border border-emerald-400/20"
                          : "bg-purple-800/30 backdrop-blur-xl border border-purple-400/20"
                      } p-3 rounded-md flex justify-between items-center text-gray-800`}>
                      <div>
                        <p className="font-medium">
                          {booking.activity} ({booking.room})
                        </p>
                        <p className="text-sm">
                          {booking.startTime} - {booking.endTime}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 italic">
                  Tidak ada booking untuk tanggal ini.
                </p>
              )}
            </div>

            <form
              onSubmit={
                editingBooking ? handleUpdateBooking : handleCreateBooking
              }
              className="space-y-4 text-gray-800">
              {/* <div>
                <label
                  htmlFor="bookedBy"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Pemesan
                </label>
                <input
                  type="text"
                  id="bookedBy"
                  name="bookedBy"
                  value={bookingForm.bookedBy}
                  onChange={handleBookingFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="e.g., Jhon Doe"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="bidang"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  Bidang
                </label>
                <input
                  type="text"
                  id="bidang"
                  name="bidang"
                  value={bookingForm.bidang}
                  onChange={handleBookingFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="e.g., RNBANG"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="bagian"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  Sub Bagian
                </label>
                <input
                  type="text"
                  id="bagian"
                  name="bagian"
                  value={bookingForm.bagian}
                  onChange={handleBookingFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="e.g., MDSI"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="room"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  Ruangan
                </label>
                <select
                  id="room"
                  name="room"
                  value={bookingForm.room}
                  onChange={handleBookingFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  required>
                  <option value="">Pilih Ruangan</option>
                  <option value="Ruang Borobudur">Ruang Borobudur</option>
                  <option value="Ruang Prambanan">Ruang Prambanan</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="activity"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  Aktivitas/Event
                </label>
                <input
                  type="text"
                  id="activity"
                  name="activity"
                  value={bookingForm.activity}
                  onChange={handleBookingFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="startTime"
                    className="block text-sm font-medium text-gray-700 mb-1">
                    Waktu mulai
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={bookingForm.startTime}
                    onChange={handleBookingFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="endTime"
                    className="block text-sm font-medium text-gray-700 mb-1">
                    Waktu selesai
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={bookingForm.endTime}
                    onChange={handleBookingFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
              </div> */}
              {/* <button
                type="submit"
                className="w-full px-4 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition-colors">
                {editingBooking ? "Update Booking" : "Book Now"}
              </button> */}
              {editingBooking ? (
                <>
                  <button
                    type="button"
                    onClick={handleDeleteBooking} // Menggunakan fungsi handleDeleteBooking
                    className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors mt-2">
                    Hapus Booking
                  </button>
                  <button
                    type="button"
                    onClick={cancelOrder} // Menggunakan cancelOrder untuk menutup/membatalkan
                    className="w-full px-4 py-2 bg-gray-400 text-white font-semibold rounded-md hover:bg-gray-500 transition-colors mt-2">
                    Batal
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={cancelOrder}
                  className="w-full px-4 py-2 bg-gray-400 text-white font-semibold rounded-md hover:bg-gray-500 transition-colors mt-2">
                  Tutup
                </button>
              )}
            </form>
          </div>
        </div>
      )}
      {/* Kolom 2: Booking QR */}
      <div className="flex flex-col items-center justify-center text-white">
        <div className="bg-white rounded-xl shadow-xl">
          <QRCodeCanvas
            value={"http://192.168.5.3:3000/booking"}
            // size={200}
            className="w-full h-auto"
          />
        </div>
        <p className="mt-1 text-sm opacity-80 text-center">
          Scan QR ini untuk melakukan pemesanan
        </p>
      </div>
    </div>
  );
}
