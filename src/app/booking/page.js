// src/components/Calendar.jsx
"use client"; // Penting untuk komponen interaktif

import React, { useCallback, useEffect, useState } from "react";
import { SessionProvider, useSession } from "next-auth/react"; // Import useSession untuk autentikasi

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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState(""); // State untuk pesan validasi NIP
  const [isNipValid, setIsNipValid] = useState(false); // State untuk status validasi NIP
  const [isNipChecking, setIsNipChecking] = useState(false); // State untuk indikator loading
  const [bookedBy, setBookedBy] = useState("");
  const [bidang, setBidang] = useState("");
  const [admin, setAdmin] = useState(false); // State untuk status admin
  const [editingBooking, setEditingBooking] = useState({
    id: null,
    bidang: "",
    bagian: "",
    room: "",
    activity: "",
    startTime: "",
    endTime: "",
    bookedBy: "",
  });
  const [bookingsData, setBookingsData] = useState([]);
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
      setBookingsData(data);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    }
  };

  const formatDateToKey = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const nipToValidate = bookingForm.bookedBy;
    // if (!session || status !== "authenticated") {
    //   // Jika user belum login, redirect ke halaman login
    //   setAdmin(false);
    // }
    fetchBookings();
    // Abaikan validasi jika NIP kosong atau terlalu pendek
    if (!nipToValidate || nipToValidate.trim().length < 3) {
      // Minimal 3 karakter untuk memicu cek
      setValidationMessage("");
      setIsNipValid(false);
      setIsNipChecking(false);
      return;
    }

    // Set timeout untuk debounce
    const handler = setTimeout(async () => {
      try {
        // Ganti URL ini dengan endpoint API backend Anda untuk validasi user
        // Contoh: http://your-backend-api.com/api/users/check-nip
        // Atau: http://your-backend-api.com/api/users?nip=<nip_yang_dicek>
        const response = await fetch(
          `http://192.168.5.3:3005/api/user/check?nip=${encodeURIComponent(
            nipToValidate
          )}`
        );

        if (response.ok) {
          const data = await response.json();
          // Asumsi backend mengembalikan { exists: true, user: { name: "Nama User" } }
          if (data.exists) {
            setValidationMessage(`✔️ ${data.user.name} ditemukan.`); // Tampilkan nama user
            setIsNipValid(true);
            setBookedBy(data.user.name); // Set nama user ke state bookedBy
            setBidang(data.user.bidang); // Set nama user ke state bookedBy
          } else {
            setValidationMessage("❌ NIP tidak ditemukan.");
            setIsNipValid(false);
          }
        } else {
          // Tangani error dari backend (misal, server error)
          setValidationMessage("Terjadi kesalahan saat memeriksa NIP.");
          setIsNipValid(false);
          console.error("Backend check failed:", response.statusText);
        }
      } catch (error) {
        setValidationMessage("Gagal terhubung ke server.");
        setIsNipValid(false);
        console.error("Error fetching NIP validation:", error);
      } finally {
        setIsNipChecking(false); // Selesai checking
      }
    }, 500); // Debounce 500ms

    // Cleanup function: Hapus timeout jika input berubah sebelum delay berakhir
    return () => {
      clearTimeout(handler);
    };
  }, [bookingForm.bookedBy]); // Dependensi: useEffect ini akan berjalan setiap kali bookingForm.bookedBy berubah

  const getBookingsForDate = useCallback(
    (date) => {
      const dateKey = formatDateToKey(date);
      return bookingsData[dateKey] || [];
    },
    [bookingsData]
  );

  // Fungsi Pembantu: Mengonversi waktu HH:mm ke menit sejak tengah malam
  const timeToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Fungsi untuk mengecek apakah ada konflik waktu
  const isTimeConflict = (newBooking, existingBookings) => {
    const newStartMinutes = timeToMinutes(newBooking.startTime);
    const newEndMinutes = timeToMinutes(newBooking.endTime);

    for (const existingBooking of existingBookings) {
      // Lewati booking itu sendiri jika sedang dalam mode edit (UPDATE)
      // Ini penting agar saat edit, booking lama tidak dianggap konflik dengan dirinya sendiri.
      if (editingBooking && existingBooking.id === editingBooking.id) {
        continue;
      }

      const existingStartMinutes = timeToMinutes(existingBooking.startTime);
      const existingEndMinutes = timeToMinutes(existingBooking.endTime);

      // Kondisi untuk TABRAKAN:
      // (Mulai booking baru < Akhir booking lama) DAN (Akhir booking baru > Mulai booking lama)
      if (
        newStartMinutes < existingEndMinutes &&
        newEndMinutes > existingStartMinutes
      ) {
        // Ada tabrakan!
        return true;
      }
    }
    // Tidak ada tabrakan ditemukan
    return false;
  };

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
    if (date.getMonth()) {
      // Hanya izinkan klik pada hari di bulan saat ini
      setSelectedDate(date);
      setIsModalOpen(true);
      setEditingBooking(null); // Pastikan tidak ada booking yang diedit saat membuka dari klik tanggal
      setBookingForm({
        id: null,
        bidang: "",
        bagian: "",
        room: "",
        activity: "",
        startTime: "",
        endTime: "",
        bookedBy: "",
      }); // Reset form
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
    setEditingBooking(null); // Reset booking yang diedit saat modal ditutup
    setBookingForm({
      id: null,
      bidang: "",
      bagian: "",
      room: "",
      activity: "",
      startTime: "",
      endTime: "",
      bookedBy: "",
    }); // Reset form
  };

  const handleBookingFormChange = (e) => {
    // const { name, value } = e.target;
    // setBookingForm((prev) => ({ ...prev, [name]: value }));
    const { name, value } = e.target;
    setBookingForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Jika input yang berubah adalah 'bookedBy', reset status validasi
    if (name === "bookedBy") {
      setValidationMessage("");
      setIsNipValid(false);
      setIsNipChecking(true); // Mulai status checking
    }
  };

  // Fungsi untuk memulai mode edit
  const handleEditBooking = (booking) => {
    setEditingBooking(booking); // Set booking yang akan diedit
    setBookingForm({
      // Isi form dengan data booking yang ada
      bidang: booking.bidang,
      bagian: booking.bagian,
      id: booking.id,
      room: booking.room,
      activity: booking.activity,
      startTime: booking.startTime,
      endTime: booking.endTime,
      bookedBy: booking.bookedBy,
    });
    setIsModalOpen(true); // Buka modal
  };

  // Fungsi untuk menambah booking baru
  const handleCreateBooking = async (e) => {
    // Tambahkan 'async' di sini
    e.preventDefault();
    if (!selectedDate) return;

    // Pastikan waktu mulai tidak lebih dari atau sama dengan waktu selesai
    if (
      timeToMinutes(bookingForm.startTime) >= timeToMinutes(bookingForm.endTime)
    ) {
      alert("Waktu selesai harus setelah waktu mulai.");
      return;
    }

    // Cara aman untuk mendapatkan YYYY-MM-DD tanpa masalah zona waktu
    const year = selectedDate.getFullYear();
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0"); // Bulan dimulai dari 0
    const day = selectedDate.getDate().toString().padStart(2, "0");

    const dateKey = `${year}-${month}-${day}`;

    // Siapkan data yang akan dikirim ke backend
    // Sesuaikan nama field 'activity' menjadi 'event' jika backend mengharapkan 'event'
    const newBookingPayload = {
      date: dateKey,
      bidang: bookingForm.bidang,
      bagian: bookingForm.bagian,
      room: bookingForm.room,
      event: bookingForm.activity,
      startTime: bookingForm.startTime,
      endTime: bookingForm.endTime,
      bookedBy: bookedBy,
    };

    // --- VALIDASI KONFLIK WAKTU ---
    const existingBookingsForSelectedDate = getBookingsForDate(selectedDate);
    const bookingsInSameRoom = existingBookingsForSelectedDate.filter(
      (booking) => booking.room === newBookingPayload.room
    );

    if (isTimeConflict(newBookingPayload, bookingsInSameRoom)) {
      alert(
        "Waktu booking yang Anda pilih bertabrakan dengan jadwal yang sudah ada di ruangan ini. Mohon pilih waktu lain."
      );
      return; // Hentikan proses submit jika ada konflik
    }
    // --- AKHIR VALIDASI KONFLIK WAKTU ---

    try {
      let response;
      if (editingBooking) {
        // Logika untuk UPDATE booking
        response = await fetch(
          `http://192.168.5.3:3005/api/schedule/book/${editingBooking.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newBookingPayload),
          }
        );
      } else {
        // Logika untuk CREATE booking
        response = await fetch("http://192.168.5.3:3005/api/schedule/book", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newBookingPayload),
        });
        console.log("Membuat booking baru:", newBookingPayload);
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Gagal ${editingBooking ? "memperbarui" : "membuat"} booking: ${
            errorData.message || response.statusText
          }`
        );
      }

      const result = await response.json();
      // console.log("Operasi booking berhasil:", result);
      alert(`Booking ${editingBooking ? "diperbarui" : "ditambahkan"}!`);

      closeModal();
      // if (onDataChange) {
      //   onDataChange();
      // }
    } catch (error) {
      console.error("Error dalam operasi booking:", error);
      alert(`Error: ${error.message}`);
    }
    fetchBookings();
  };

  // Fungsi untuk mengupdate booking yang sudah ada
  const handleUpdateBooking = (e) => {
    e.preventDefault();
    if (!editingBooking || !selectedDate) return;

    const dateKey = selectedDate.toISOString().split("T")[0];

    setBookingsData((prevBookings) => ({
      // Update state menggunakan setBookingsData
      ...prevBookings,
      [dateKey]: prevBookings[dateKey].map((booking) =>
        booking.id === editingBooking.id
          ? { ...booking, ...bookingForm } // Update dengan data dari bookingForm
          : booking
      ),
    }));

    console.log("Booking diupdate:", bookingForm);
    alert(`Booking "${bookingForm.activity}" berhasil diupdate!`);
    closeModal();
  };

  const handleDeleteBooking = () => {
    if (!editingBooking || !selectedDate) return;

    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus booking "${editingBooking.activity}"?`
    );
    if (!confirmDelete) return;

    const dateKey = selectedDate.toISOString().split("T")[0];

    setBookingsData((prevBookings) => ({
      ...prevBookings,
      [dateKey]: prevBookings[dateKey].filter(
        (booking) => booking.id !== editingBooking.id
      ),
    }));

    alert(`Booking "${editingBooking.activity}" berhasil dihapus!`);
    fetchBookings();
    closeModal(); // Tutup modal setelah penghapusan
  };

  const cancelOrder = async (id) => {
    if (!editingBooking || !selectedDate) return;

    const confirmCancel = window.confirm(
      `Apakah Anda yakin ingin membatalkan booking "${editingBooking.activity}"?`
    );
    if (!confirmCancel) return;

    const response = await fetch(
      `http://192.168.5.3:3005/api/schedule/book/${id}`,
      {
        method: "delete",
      }
    );

    if (!response.ok) {
      // Tangani jika respons dari server tidak OK (misal status 4xx atau 5xx)
      const errorData = await response.json(); // Coba baca error dari respons
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${
          errorData.message || "Unknown error"
        }`
      );
    }

    alert(`Booking "${editingBooking.activity}" berhasil dibatalkan!`);
    fetchBookings();
    closeModal(); // Tutup modal setelah pembatalan
  };
  return (
    <>
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
              const hasBookings = getBookingsForDate(dayObj.date);
              const isSelected = selectedDate && isSameDay(date, selectedDate);

              return (
                <div
                  key={index}
                  className={`
                                relative p-1 h-16 rounded-md flex flex-col items-center justify-start cursor-pointer
                                ${
                                  isCurrentMonth
                                    ? "bg-gray-200 hover:bg-gray-100"
                                    : "bg-gray-20 text-gray-400 cursor-not-allowed"
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
                    <div className="absolute bottom-1 right-1 left-1 flex justify-center space-x-1">
                      {/* Tampilkan jumlah booking untuk BOROBUDUR jika ada */}
                      {hasBookings.filter((c) => c.room === "BOROBUDUR")
                        .length > 0 && (
                        <span
                          className="text-xs font-semibold px-1 py-0.5 rounded bg-emerald-400 text-black"
                          title={`${
                            hasBookings.filter((c) => c.room === "BOROBUDUR")
                              .length
                          } kegiatan Borobudur`}>
                          {
                            hasBookings.filter((c) => c.room === "BOROBUDUR")
                              .length
                          }
                        </span>
                      )}

                      {/* Tampilkan jumlah booking untuk PRAMBANAN jika ada */}
                      {hasBookings.filter((c) => c.room === "PRAMBANAN")
                        .length > 0 && (
                        <span
                          className="text-xs font-semibold px-1 py-0.5 rounded bg-purple-400 text-black"
                          title={`${
                            hasBookings.filter((c) => c.room === "PRAMBANAN")
                              .length
                          } kegiatan Prambanan`}>
                          {
                            hasBookings.filter((c) => c.room === "PRAMBANAN")
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
                                {booking.activity} ({booking.room})
                              </p>
                            </div>
                            {/* Tombol Edit untuk setiap booking user login*/}
                            <SessionProvider>
                              {admin ? (
                                <button
                                  onClick={() => handleEditBooking(booking)}
                                  className="text-blue-600 hover:text-blue-800 ml-2 text-sm font-semibold">
                                  Edit
                                </button>
                              ) : null}
                            </SessionProvider>
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
                    <div className="mb-4">
                      <label
                        htmlFor="bookedBy"
                        className="block text-sm font-medium text-gray-700 mb-1">
                        NIP Pemesan
                      </label>
                      <input
                        type="text"
                        id="bookedBy"
                        name="bookedBy"
                        value={bookingForm.bookedBy || ""}
                        onChange={handleBookingFormChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        placeholder="e.g., Jhon Doe / NIP"
                        required
                      />
                      {/* Pesan Validasi NIP/Pemesan */}
                      <div className="mt-1 text-sm">
                        {isNipChecking && (
                          <p className="text-gray-500">Memeriksa...</p>
                        )}
                        {validationMessage && !isNipChecking && (
                          <p
                            className={
                              isNipValid ? "text-green-600" : "text-red-600"
                            }>
                            {validationMessage}
                          </p>
                        )}
                      </div>
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
                        placeholder="e.g., Rapat Tim, Workshop"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="bagian"
                        className="block text-sm font-medium text-gray-700 mb-1">
                        Bagian
                      </label>
                      <input
                        type="text"
                        id="bagian"
                        name="bagian"
                        value={bookingForm.bagian || ""}
                        onChange={handleBookingFormChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        placeholder="e.g., Rapat Tim, Workshop"
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
                      <option value="BOROBUDUR">Ruang Borobudur</option>
                      <option value="PRAMBANAN">Ruang Prambanan</option>
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
                    className={`w-full px-4 py-2 ${
                      isNipValid ? "bg-purple-600" : "bg-gray-400"
                    }  text-white font-semibold rounded-md hover:bg-purple-700 transition-colors`}>
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
    </>
  );
}
