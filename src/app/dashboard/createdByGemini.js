// src/components/Calendar.jsx
"use client"; // Penting untuk komponen interaktif

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react"; // Import useSession untuk autentikasi
import { useRouter } from "next/navigation"; // Import useRouter untuk navigasi

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

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const isSameDay = (d1, d2) => d1.toDateString() === d2.toDateString();

export default function Calendar() {
  const { data: session, status } = useSession(); // Ambil data session untuk autentikasi
  const router = useRouter(); // Inisialisasi router untuk navigasi
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [bookingsData, setBookingsData] = useState({}); // Mengubah ini menjadi objek untuk akses mudah berdasarkan tanggal
  // State untuk form booking (digunakan untuk CREATE dan EDIT)
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

  const fetchBookings = async () => {
    try {
      const response = await fetch("http://192.168.5.3:3005/api/schedule");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      // Transform the data to be easily accessible by date
      const transformedData = data.reduce((acc, booking) => {
        const dateKey = new Date(booking.date).toISOString().split("T")[0];
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(booking);
        return acc;
      }, {});
      setBookingsData(transformedData);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (status === "loading") return <div>Loading...</div>;
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
      setSelectedDate(date);
      setIsModalOpen(true);
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
    }
  };

  const closeModal = () => {
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
  };

  const handleBookingFormChange = (e) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditBooking = (booking) => {
    setEditingBooking(booking);
    setBookingForm({
      bidang: booking.bidang,
      bagian: booking.bagian,
      id: booking.id,
      room: booking.room,
      activity: booking.event, // Use 'event' from the fetched data
      startTime: booking.startTime,
      endTime: booking.endTime,
      bookedBy: booking.bookedBy,
    });
    setIsModalOpen(true);
  };

  // Fungsi untuk memeriksa konflik waktu
  const checkTimeConflict = (newBooking, existingBookings) => {
    const newStart = new Date(`2000/01/01 ${newBooking.startTime}`);
    const newEnd = new Date(`2000/01/01 ${newBooking.endTime}`);

    if (newStart >= newEnd) {
      return "End time must be after start time.";
    }

    for (const booking of existingBookings) {
      // If editing, skip the booking being edited
      if (newBooking.id && booking.id === newBooking.id) {
        continue;
      }

      if (booking.room === newBooking.room) {
        const existingStart = new Date(`2000/01/01 ${booking.startTime}`);
        const existingEnd = new Date(`2000/01/01 ${booking.endTime}`);

        // Check for overlap
        if (newStart < existingEnd && newEnd > existingStart) {
          return `Room "${newBooking.room}" is already booked from ${booking.startTime} to ${booking.endTime} for "${booking.event}".`;
        }
      }
    }
    return null; // No conflict
  };

  // Fungsi untuk menambah booking baru
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!selectedDate) return;

    const dateKey = selectedDate.toISOString().split("T")[0];

    const newBookingPayload = {
      date: dateKey,
      bidang: bookingForm.bidang,
      bagian: bookingForm.bagian,
      room: bookingForm.room,
      event: bookingForm.activity,
      startTime: bookingForm.startTime,
      endTime: bookingForm.endTime,
      bookedBy: bookingForm.bookedBy,
    };

    const conflictMessage = checkTimeConflict(
      newBookingPayload,
      getBookingsForDate(selectedDate)
    );
    if (conflictMessage) {
      alert(`Booking conflict: ${conflictMessage}`);
      return;
    }

    try {
      const response = await fetch(
        "http://192.168.5.3:3005/api/schedule/book",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newBookingPayload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${
            errorData.message || "Unknown error"
          }`
        );
      }

      const result = await response.json();
      console.log("Booking berhasil dibuat di backend:", result);
      alert(
        `Booking "${newBookingPayload.event}" di ${newBookingPayload.room} berhasil ditambahkan!`
      );

      await fetchBookings();
      closeModal();
    } catch (error) {
      console.error("Gagal membuat booking:", error);
      alert(`Gagal membuat booking: ${error.message}`);
    }
  };

  // Fungsi untuk mengupdate booking yang sudah ada
  const handleUpdateBooking = async (e) => {
    e.preventDefault();
    if (!editingBooking || !selectedDate) return;

    const dateKey = selectedDate.toISOString().split("T")[0];

    const updatedBookingPayload = {
      id: bookingForm.id,
      date: dateKey,
      bidang: bookingForm.bidang,
      bagian: bookingForm.bagian,
      room: bookingForm.room,
      event: bookingForm.activity,
      startTime: bookingForm.startTime,
      endTime: bookingForm.endTime,
      bookedBy: bookingForm.bookedBy,
    };

    const conflictMessage = checkTimeConflict(
      updatedBookingPayload,
      getBookingsForDate(selectedDate)
    );
    if (conflictMessage) {
      alert(`Booking conflict: ${conflictMessage}`);
      return;
    }

    try {
      const response = await fetch(
        `http://192.168.5.3:3005/api/schedule/book/${bookingForm.id}`,
        {
          method: "PUT", // Assuming your API uses PUT for updates
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedBookingPayload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${
            errorData.message || "Unknown error"
          }`
        );
      }

      const result = await response.json();
      console.log("Booking berhasil diupdate di backend:", result);
      alert(`Booking "${bookingForm.activity}" berhasil diupdate!`);

      await fetchBookings();
      closeModal();
    } catch (error) {
      console.error("Gagal mengupdate booking:", error);
      alert(`Gagal mengupdate booking: ${error.message}`);
    }
  };

  const getBookingsForDate = (date) => {
    if (!bookingsData) return [];
    const dateKey = date.toISOString().split("T")[0];
    return bookingsData[dateKey] || [];
  };

  const cancelOrder = async (id) => {
    if (!editingBooking || !selectedDate) return;

    const confirmCancel = window.confirm(
      `Apakah Anda yakin ingin membatalkan booking "${editingBooking.activity}"?`
    );
    if (!confirmCancel) return;

    try {
      const response = await fetch(
        `http://192.168.5.3:3005/api/schedule/book/${id}`,
        {
          method: "DELETE", // Assuming your API uses DELETE for cancellation
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${
            errorData.message || "Unknown error"
          }`
        );
      }
      const result = await response.json(); // Use await here
      console.log("response", result);

      alert(`Booking "${editingBooking.activity}" berhasil dibatalkan!`);
      await fetchBookings(); // Re-fetch bookings after cancellation
      closeModal();
    } catch (error) {
      console.error("Gagal membatalkan booking:", error);
      alert(`Gagal membatalkan booking: ${error.message}`);
    }
  };

  return (
    <div className="bg-gray-100 flex flex-col items-center">
      {/* Main Calendar Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl">
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
        <div className="grid grid-cols-7 gap-1 mb-2">
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
                                relative p-1 h-16 rounded-md flex flex-col items-center justify-start cursor-pointer
                                ${
                                  isCurrentMonth
                                    ? "bg-gray-50 hover:bg-gray-100"
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
                  <span className="mt-1 px-1 py-0.5 bg-green-500 text-white text-[0.6rem] rounded-full">
                    {getBookingsForDate(date).length}
                  </span>
                )}
              </div>
            );
          })}
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
                  {getBookingsForDate(selectedDate).length > 0 ? (
                    <ul className="space-y-2">
                      {getBookingsForDate(selectedDate).map((booking) => (
                        <li
                          key={booking.id}
                          className="p-3 bg-blue-50 rounded-md text-sm text-blue-800 flex justify-between items-center">
                          <div>
                            <span className="font-bold">
                              {booking.startTime} - {booking.endTime}
                            </span>
                            <p className="text-xs">
                              {booking.event} ({booking.room})
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
                  {editingBooking ? "Edit Details" : "Pesan Ruangan"}:
                </h4>
                <div>
                  <div>
                    <label
                      htmlFor="bookedBy"
                      className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Pemesan
                    </label>
                    <input
                      type="text"
                      id="bookedBy"
                      name="bookedBy"
                      value={bookingForm.bookedBy || ""}
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
                      value={bookingForm.bidang || ""}
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
                      value={bookingForm.bagian || ""}
                      onChange={handleBookingFormChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      placeholder="e.g., MDSI"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="activity"
                      className="block text-sm font-medium text-gray-700 mb-1">
                      Kegiatan
                    </label>
                    <input
                      type="text"
                      id="activity"
                      name="activity"
                      value={bookingForm.activity || ""}
                      onChange={handleBookingFormChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      placeholder="e.g., Rapat Tim, Workshop"
                      required
                    />
                  </div>
                  <label
                    htmlFor="room"
                    className="block text-sm font-medium text-gray-700 mb-1">
                    Ruangan
                  </label>
                  <select
                    id="room"
                    name="room"
                    value={bookingForm.room || ""}
                    onChange={handleBookingFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    required>
                    <option value="">Select a Room</option>
                    <option value="Ruang Borobudur">Ruang Borobudur</option>
                    <option value="Ruang Prambanan">Ruang Prambanan</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="startTime"
                      className="block text-sm font-medium text-gray-700 mb-1">
                      Waktu Mulai
                    </label>
                    <input
                      type="time"
                      id="startTime"
                      name="startTime"
                      value={bookingForm.startTime || ""}
                      onChange={handleBookingFormChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="endTime"
                      className="block text-sm font-medium text-gray-700 mb-1">
                      Waktu Selesai
                    </label>
                    <input
                      type="time"
                      id="endTime"
                      name="endTime"
                      value={bookingForm.endTime || ""}
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
                    onClick={() => cancelOrder(bookingForm.id)}
                    className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors">
                    Batalkan
                  </button>
                ) : null}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
