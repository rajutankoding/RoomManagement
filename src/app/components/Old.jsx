// src/components/Calendar.jsx
"use client"; // Penting untuk komponen interaktif

import React, { useState } from "react";

// Fungsi untuk mendapatkan semua hari dalam sebulan untuk tampilan kalender
const generateCalendarDays = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday...

  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Minggu (0) jadi 6 (Senin=0)

  const prevMonthDays = new Date(year, month, 0).getDate();
  const days = [];

  // Tambahkan hari dari bulan sebelumnya
  for (let i = adjustedFirstDay; i > 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthDays - i + 1),
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

  // Tambahkan hari dari bulan berikutnya
  const totalCells = 42; // 6 minggu * 7 hari (jumlah maksimal sel kalender)
  const remainingCells = totalCells - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    });
  }
  return days;
};

const dayNames = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

const isSameDay = (d1, d2) => d1.toDateString() === d2.toDateString();

export default function Calendar({ data }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    id: null, // Tambahkan ID untuk edit
    room: "",
    activity: "",
    startTime: "",
    endTime: "",
  });

  // State untuk form booking (di dalam modal)
  const [newBooking, setNewBooking] = useState({
    room: "",
    activity: "",
    startTime: "",
    endTime: "",
  });

  const calendarDays = generateCalendarDays(currentMonth);
  const today = new Date();

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleDayClick = (date) => {
    if (date.getMonth() === currentMonth.getMonth()) {
      console.log("Cek Tanggal", date);
      // Hanya izinkan klik pada hari di bulan saat ini
      setSelectedDate(date);
      setIsModalOpen(true);
      setNewBooking({ room: "", activity: "", startTime: "", endTime: "" }); // Reset form
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  const handleBookingFormChange = (e) => {
    const { name, value } = e.target;
    setNewBooking((prev) => ({ ...prev, [name]: value }));
  };

  const handleBookNow = (e) => {
    e.preventDefault();
    if (!selectedDate) return;

    const dateKey = selectedDate.toISOString().split("T")[0]; // 'YYYY-MM-DD'

    console.log("Booking baru untuk", dateKey, ":", newBooking);
    // Di sini Anda akan mengirim data `newBooking` ke backend
    // Untuk demo, kita akan update data secara lokal dan tutup modal
    if (!data[dateKey]) {
      data[dateKey] = [];
    }
    data[dateKey].push({
      id: Date.now(),
      room: newBooking.room,
      activity: newBooking.activity,
      startTime: newBooking.startTime,
      endTime: newBooking.endTime,
    });

    closeModal();
    alert(
      `Booking "${newBooking.activity}" di ${
        newBooking.room
      } pada ${selectedDate.toDateString()} berhasil!`
    );
  };

  // Fungsi untuk memulai mode edit
  const handleEditBooking = (booking) => {
    setEditingBooking(booking); // Set booking yang akan diedit
    setBookingForm({
      // Isi form dengan data booking yang ada
      id: booking.id,
      room: booking.room,
      activity: booking.activity,
      startTime: booking.startTime,
      endTime: booking.endTime,
    });
    setIsModalOpen(true); // Buka modal
  };

  // Fungsi untuk menambah booking baru
  const handleCreateBooking = (e) => {
    e.preventDefault();
    if (!selectedDate) return;

    const dateKey = selectedDate.toISOString().split("T")[0];

    const newBookingData = {
      id: Date.now(),
      room: bookingForm.room,
      activity: bookingForm.activity,
      startTime: bookingForm.startTime,
      endTime: bookingForm.endTime,
    };

    setBookingsData((prevBookings) => ({
      // Update state menggunakan setBookingsData
      ...prevBookings,
      [dateKey]: [...(prevBookings[dateKey] || []), newBookingData],
    }));

    console.log("Booking baru ditambahkan:", newBookingData);
    alert(
      `Booking "${newBookingData.activity}" di ${newBookingData.room} berhasil ditambahkan!`
    );
    closeModal();
  };

  const getBookingsForDateByRoom = (date, room) => {
    const dateKey = date.toISOString().split("T")[0];
    const allBookings = data[dateKey] || [];
    return allBookings.filter((b) => b.room === room);
  };

  const getBookingsForDate = (date, room) => {
    const dateKey = date.toISOString().split("T")[0];
    return data[dateKey] || [];
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-md font-bold text-gray-800">
            {currentMonth.toLocaleString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <div className="flex space-x-1">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 auto-rows-fr gap-1 flex-1 overflow-y-auto">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((dayObj, index) => {
            const date = dayObj.date;
            const isCurrentMonth = dayObj.isCurrentMonth;
            const dayNumber = date.getDate();
            const isToday = isSameDay(date, today);
            const hasBookings = getBookingsForDate(date).length > 0;
            const isSelected = selectedDate && isSameDay(date, selectedDate);

            return (
              <div
                key={index}
                className={`
                                relative p-1 h-[vh] rounded-md flex flex-col items-center justify-start cursor-pointer
                                ${
                                  isCurrentMonth
                                    ? "bg-gray-50  hover:bg-gray-100"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                }
                                ${
                                  isToday
                                    ? "border-2 border-blue-500 bg-blue-100 font-bold"
                                    : ""
                                }
                                ${
                                  isSelected
                                    ? "ring-2 ring-purple-500 bg-purple-100"
                                    : ""
                                }
                            `}
                onClick={() => handleDayClick(date)}>
                <span
                  className={`text-xs font-medium ${
                    isToday
                      ? "text-blue-700"
                      : isCurrentMonth
                      ? "text-gray-800"
                      : "text-gray-400"
                  }`}>
                  {dayNumber}
                </span>
                {hasBookings && isCurrentMonth && (
                  <div>
                    {/* Jumlah untuk Borobudur */}
                    {getBookingsForDateByRoom(date, "Ruang Borobudur").length >
                      0 && (
                      <span className="px-1 py-0.5 bg-green-600 text-white text-[0.6rem] rounded-full">
                        {" "}
                        {
                          getBookingsForDateByRoom(date, "Ruang Borobudur")
                            .length
                        }
                      </span>
                    )}

                    {/* Jumlah untuk Prambanan */}
                    {getBookingsForDateByRoom(date, "Ruang Prambanan").length >
                      0 && (
                      <span className="px-1 py-0.5 bg-purple-500 text-white text-[0.6rem] rounded-full">
                        {" "}
                        {
                          getBookingsForDateByRoom(date, "Ruang Prambanan")
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
      </div>
      {/* Kolom 2: Booking QR */}
      <div className="flex flex-col items-center justify-center mb-4 text-black">
        <h2 className="text-xl font-bold mb-4">Booking Ruangan</h2>
        <div className="bg-zinc-300 p-4 rounded-xl shadow-xl">
          <img src="/qr-code.jpg" alt="QR Booking" className=" h-[25vh]" />
        </div>
        <p className="mt-4 text-sm opacity-80 text-center">
          Scan QR ini untuk melakukan pemesanan
        </p>
      </div>

      {/* Booking Modal */}
      {isModalOpen && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-fade-in-up">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-xl font-bold text-gray-800">
                {editingBooking ? "Edit Booking" : "Book for"}{" "}
                {selectedDate.toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Daftar Jam Ruangan Digunakan - Hanya tampilkan jika tidak dalam mode edit */}
            {!editingBooking && (
              <div className="mb-6 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                <h4 className="text-md font-semibold text-gray-700 mb-2">
                  Booked Times:
                </h4>
                {getBookingsForDateByRoom(selectedDate).length > 0 ? (
                  <ul className="space-y-2">
                    {getBookingsForDateByRoom(selectedDate).map((booking) => (
                      <li
                        key={booking.id}
                        className="p-3 bg-blue-50 rounded-md text-sm text-blue-800 flex justify-between items-center">
                        <div>
                          <span className="font-bold">
                            {booking.startTime} - {booking.endTime}
                          </span>
                          <p className="text-xs">
                            {booking.activity} ({booking.room})
                          </p>
                        </div>
                        {/* Tombol Edit untuk setiap booking user login*/}
                        <button
                          onClick={() => handleEditBooking(booking)}
                          className="text-blue-600 hover:text-blue-800 ml-2 text-sm font-semibold">
                          Edit
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">
                    No bookings for this day yet.
                  </p>
                )}
              </div>
            )}

            {/* Form Pengisian Kegiatan Booking / Edit */}
            <form
              onSubmit={
                editingBooking ? handleUpdateBooking : handleCreateBooking
              }
              className="space-y-4">
              <h4 className="text-md font-semibold text-gray-700 mb-2">
                {editingBooking ? "Edit Details" : "New Booking"}:
              </h4>
              <div>
                <label
                  htmlFor="room"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  Room
                </label>
                <select
                  id="room"
                  name="room"
                  value={bookingForm.room}
                  onChange={handleBookingFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  required>
                  <option value="">Select a Room</option>
                  <option value="Ruang Borobudur">Ruang Borobudur</option>
                  <option value="Ruang Prambanan">Ruang Prambanan</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="activity"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  Activity
                </label>
                <input
                  type="text"
                  id="activity"
                  name="activity"
                  value={bookingForm.activity}
                  onChange={handleBookingFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="e.g., Rapat Tim, Workshop"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="startTime"
                    className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
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
                    End Time
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
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition-colors">
                {editingBooking ? "Update Booking" : "Book Now"}
              </button>
              {editingBooking ? (
                <button
                  type="button"
                  onClick={cancelOrder}
                  className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors">
                  Batalkan
                </button>
              ) : null}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
