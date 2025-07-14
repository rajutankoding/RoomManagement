// src/app/admin/page.jsx
"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
// import { useSession } from "next-auth/react"; // Jika Anda menggunakan NextAuth di halaman admin ini

// Helper function untuk mengelompokkan booking berdasarkan tanggal dan ruangan
const groupBookingsByDateAndRoom = (bookings) => {
  const grouped = {};

  bookings.forEach((booking) => {
    const dateKey = booking.date; // Asumsi booking memiliki properti 'date'
    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        borobudur: [],
        prambanan: [],
      };
    }

    if (booking.room && booking.room.toLowerCase().includes("borobudur")) {
      grouped[dateKey].borobudur.push(booking);
    } else if (
      booking.room &&
      booking.room.toLowerCase().includes("prambanan")
    ) {
      grouped[dateKey].prambanan.push(booking);
    }
  });

  return grouped;
};

// --- FUNGSI PEMBANTU BARU UNTUK CEK KONFLIK WAKTU DAN TANGGAL ---
const isTimeConflict = (newBooking, allGroupedBookings, currentEditingId) => {
  // Parsing tanggal dan waktu dari booking baru ke objek Date
  const newStartDate = new Date(`${newBooking.date}T${newBooking.startTime}`);
  const newEndDate = new Date(`${newBooking.date}T${newBooking.endTime}`);

  // Pastikan waktu selesai setelah waktu mulai
  if (newEndDate <= newStartDate) {
    // Validasi ini juga bisa dilakukan di handleSubmitEditBooking
    // Namun, ada baiknya juga ada di sini jika fungsi ini dipanggil di tempat lain
    return true; // Konflik karena waktu selesai tidak valid
  }

  // Dapatkan daftar booking yang ada pada tanggal dan ruangan yang sama
  // (Pastikan nama ruangan di `allGroupedBookings` dalam huruf kecil)
  const roomKey = newBooking.room.toLowerCase();
  const existingBookingsOnSameDateAndRoom = allGroupedBookings[newBooking.date]
    ? allGroupedBookings[newBooking.date][roomKey] || []
    : [];

  for (const existingBooking of existingBookingsOnSameDateAndRoom) {
    // Lewati booking yang sedang diedit itu sendiri
    if (existingBooking.id === currentEditingId) {
      continue;
    }

    // Parsing tanggal dan waktu dari booking yang sudah ada
    const existingStartDate = new Date(
      `${existingBooking.date}T${existingBooking.startTime}`
    );
    const existingEndDate = new Date(
      `${existingBooking.date}T${existingBooking.endTime}`
    );

    // Cek kondisi tumpang tindih: (Start1 < End2 && End1 > Start2)
    // Ini mencakup semua skenario tumpang tindih
    if (newStartDate < existingEndDate && newEndDate > existingStartDate) {
      return true; // Ditemukan konflik waktu
    }
  }
  return false; // Tidak ada konflik waktu yang ditemukan
};
// --- AKHIR FUNGSI PEMBANTU BARU ---

export default function AdminPage() {
  const router = useRouter();
  // const { data: session, status } = useSession(); // Uncomment jika Anda menggunakan NextAuth
  const [dataJadwal, setDataJadwal] = useState({}); // State untuk data booking yang sudah dikelompokkan
  const [loading, setLoading] = useState(true); //
  const [error, setError] = useState(null); //

  // --- State untuk Edit/Delete Booking ---
  const [showEditModal, setShowEditModal] = useState(false); //
  const [editingBooking, setEditingBooking] = useState(null); // Menyimpan objek booking yang sedang diedit
  const [editBookingForm, setEditBookingForm] = useState({
    // Menyimpan data form untuk editing
    id: null,
    date: "", // Pastikan 'date' ada di sini
    room: "",
    event: "",
    startTime: "",
    endTime: "",
    bookedBy: "",
    bagian: "",
    bidang: "",
  });

  // Fungsi untuk mengambil dan memproses data jadwal
  const fetchScheduleData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "http://192.168.5.3:3005/api/schedule/admin"
      ); // Pastikan URL dan PORT benar
      if (!response.ok) {
        throw new Error(`Gagal mengambil data jadwal: ${response.statusText}`);
      }
      const rawData = await response.json();
      const processedData = groupBookingsByDateAndRoom(rawData);
      setDataJadwal(processedData);
    } catch (err) {
      console.error("Terjadi kesalahan saat fetch jadwal:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Efek untuk memuat data saat komponen dimuat dan mengelola autentikasi
  useEffect(() => {
    fetchScheduleData(); // Panggil fungsi pengambilan data

    // Jika Anda menggunakan NextAuth, uncomment bagian ini
    // if (status === "loading") return;

    // if (status === "unauthenticated") {
    //   router.push("/api/auth/signin");
    // } else if (status === "authenticated") {
    //   //   console.log("Pengguna terautentikasi:", session.user);
    //   if (session.user && session.user.role !== "admin") {
    //     // Sesuaikan dengan role admin Anda
    //     alert("Anda tidak memiliki akses ke halaman admin!");
    //     router.push("/");
    //   }
    // }
  }, [router, fetchScheduleData]); // Hapus 'status', 'session' dari dependency array jika NextAuth tidak digunakan

  // Handler perubahan input pada form edit booking
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditBookingForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handler saat tombol 'Edit' di tabel diklik
  const handleEditClick = (booking) => {
    setEditingBooking(booking); // Set booking yang sedang diedit
    // Isi form dengan data booking yang ada
    setEditBookingForm({
      id: booking.id,
      date: booking.date, // Pastikan ini mengisi tanggal dari booking yang diedit
      room: booking.room,
      event: booking.event,
      startTime: booking.startTime,
      endTime: booking.endTime,
      bookedBy: booking.bookedBy || "",
      bagian: booking.bagian || "",
      bidang: booking.bidang || "",
    });
    setShowEditModal(true); // Tampilkan modal edit
  };

  // Handler saat tombol 'Hapus' di tabel diklik
  const handleDeleteClick = async (bookingId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus booking ini?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://192.168.5.3:3005/api/schedule/book/${bookingId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Gagal menghapus booking: ${response.statusText}`);
      }

      alert("Booking berhasil dihapus!");
      fetchScheduleData(); // Refresh data setelah penghapusan
    } catch (err) {
      console.error("Error menghapus booking:", err);
      alert(`Gagal menghapus booking: ${err.message}`);
    }
  };

  // Handler saat form edit disubmit
  const handleSubmitEditBooking = async (e) => {
    e.preventDefault();
    if (!editingBooking || !editBookingForm.id) return;

    // --- Validasi Waktu Selesai harus setelah Waktu Mulai ---
    const newStartDate = new Date(
      `${editBookingForm.date}T${editBookingForm.startTime}`
    );
    const newEndDate = new Date(
      `${editBookingForm.date}T${editBookingForm.endTime}`
    );

    if (newEndDate <= newStartDate) {
      alert("Waktu selesai harus setelah waktu mulai.");
      return;
    }

    // --- CEK KONFLIK WAKTU DENGAN BOOKING LAIN ---
    const hasConflict = isTimeConflict(
      editBookingForm, // Booking yang baru diedit
      dataJadwal, // Semua booking yang sudah dikelompokkan
      editBookingForm.id // ID booking yang sedang diedit (untuk dilewati dalam cek konflik)
    );

    if (hasConflict) {
      alert(
        "Terjadi konflik waktu. Ruangan sudah dibooking pada jam tersebut."
      );
      return; // Hentikan proses submit jika ada konflik
    }
    // --- AKHIR CEK KONFLIK WAKTU ---

    try {
      const response = await fetch(
        `http://192.168.5.3:3005/api/schedule/book/${editBookingForm.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editBookingForm),
        }
      );

      if (!response.ok) {
        throw new Error(`Gagal memperbarui booking: ${response.statusText}`);
      }

      alert("Booking berhasil diperbarui!");
      setShowEditModal(false); // Tutup modal
      setEditingBooking(null); // Reset booking yang diedit
      fetchScheduleData(); // Refresh data setelah update
    } catch (err) {
      console.error("Error memperbarui booking:", err);
      alert(`Gagal memperbarui booking: ${err.message}`);
    }
  };

  // Tutup modal edit
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingBooking(null);
    setEditBookingForm({
      id: null,
      date: "",
      room: "",
      event: "",
      startTime: "",
      endTime: "",
      bookedBy: "",
      bagian: "",
      bidang: "",
    });
  };

  const sortedDates = Object.keys(dataJadwal).sort();

  return (
    <>
      {" "}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Dashboard Admin Jadwal Ruangan
      </h1>
      {/* Status Loading dan Error */}
      {loading && (
        <p className="text-center text-gray-600 text-lg mt-8">
          Memuat data jadwal...
        </p>
      )}
      {error && (
        <p className="text-center text-red-600 text-lg mt-8">
          Error: {error}. Silakan coba lagi.
        </p>
      )}
      {/* Tabel Jadwal */}
      {!loading && !error && (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Tanggal</th>
                <th className="py-3 px-6 text-left">Ruang BOROBUDUR</th>
                <th className="py-3 px-6 text-left">Ruang PRAMBANAN</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light divide-y divide-gray-200">
              {sortedDates.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-4">
                    Tidak ada jadwal yang akan datang.
                  </td>
                </tr>
              ) : (
                sortedDates.map((dateKey) => (
                  <tr
                    key={dateKey}
                    className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-left whitespace-nowrap align-top pt-4">
                      <span className="font-semibold">
                        {new Date(dateKey).toLocaleDateString("id-ID", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-left align-top">
                      {dataJadwal[dateKey].borobudur.length === 0 ? (
                        <span className="text-gray-400">Tidak ada booking</span>
                      ) : (
                        dataJadwal[dateKey].borobudur.map((booking) => (
                          <div
                            key={booking.id}
                            className="mb-3 p-3 bg-blue-50 rounded-md border border-blue-200 shadow-sm">
                            <p className="font-semibold text-gray-800">
                              {booking.event}
                            </p>
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">Waktu:</span>{" "}
                              {booking.startTime} - {booking.endTime}
                            </p>
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">Pemesan:</span>{" "}
                              {booking.bookedBy || "N/A"}
                            </p>
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">Bidang:</span>{" "}
                              {booking.bidang || "N/A"}
                            </p>
                            <div className="mt-2 flex space-x-2">
                              <button
                                onClick={() => handleEditClick(booking)}
                                className="px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors">
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteClick(booking.id)}
                                className="px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-colors">
                                Hapus
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </td>
                    <td className="py-3 px-6 text-left align-top">
                      {dataJadwal[dateKey].prambanan.length === 0 ? (
                        <span className="text-gray-400">Tidak ada booking</span>
                      ) : (
                        dataJadwal[dateKey].prambanan.map((booking) => (
                          <div
                            key={booking.id}
                            className="mb-3 p-3 bg-purple-50 rounded-md border border-purple-200 shadow-sm">
                            <p className="font-semibold text-gray-800">
                              {booking.event}
                            </p>
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">Waktu:</span>{" "}
                              {booking.startTime} - {booking.endTime}
                            </p>
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">Pemesan:</span>{" "}
                              {booking.bookedBy || "N/A"}
                            </p>
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">Bidang:</span>{" "}
                              {booking.bidang || "N/A"}
                            </p>
                            <div className="mt-2 flex space-x-2">
                              <button
                                onClick={() => handleEditClick(booking)}
                                className="px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors">
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteClick(booking.id)}
                                className="px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-colors">
                                Hapus
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* --- Modal Edit Booking --- */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-fade-in-up">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Edit Booking
            </h2>
            <form onSubmit={handleSubmitEditBooking}>
              {/* ID Booking (hidden, hanya untuk referensi) */}
              <input type="hidden" name="id" value={editBookingForm.id || ""} />

              {/* Tanggal */}
              <div className="mb-4">
                <label
                  htmlFor="editDate"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  id="editDate"
                  name="date"
                  value={editBookingForm.date}
                  onChange={handleEditFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>

              {/* Ruangan (select) */}
              <div className="mb-4">
                <label
                  htmlFor="editRoom"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  Ruangan
                </label>
                <select
                  id="editRoom"
                  name="room"
                  value={editBookingForm.room}
                  onChange={handleEditFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  required>
                  <option value="">Pilih Ruangan</option>
                  <option value="BOROBUDUR">Ruang Borobudur</option>
                  <option value="PRAMBANAN">Ruang Prambanan</option>
                </select>
              </div>

              {/* Aktivitas */}
              <div className="mb-4">
                <label
                  htmlFor="editEvent"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  Aktivitas
                </label>
                <input
                  type="text"
                  id="editEvent"
                  name="event"
                  value={editBookingForm.event}
                  onChange={handleEditFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Contoh: Rapat Koordinasi"
                  required
                />
              </div>

              {/* NIP Pemesan */}
              <div className="mb-4">
                <label
                  htmlFor="editBookedBy"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  NIP Pemesan
                </label>
                <input
                  type="text"
                  id="editBookedBy"
                  name="bookedBy"
                  value={editBookingForm.bookedBy}
                  onChange={handleEditFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="e.g., Jhon Doe / NIP"
                  required
                />
              </div>

              {/* Bagian */}
              {/* <div className="mb-4">
                <label
                  htmlFor="editBagian"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  Bagian
                </label>
                <input
                  type="text"
                  id="editBagian"
                  name="bagian"
                  value={editBookingForm.bagian}
                  onChange={handleEditFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="e.g., TI"
                />
              </div> */}

              {/* Bidang */}
              <div className="mb-4">
                <label
                  htmlFor="editBidang"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  Bidang/Bagian
                </label>
                <input
                  type="text"
                  id="editBidang"
                  name="bidang"
                  value={editBookingForm.bidang}
                  onChange={handleEditFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="e.g., MDSI"
                  required
                />
              </div>

              {/* Waktu Mulai & Selesai */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label
                    htmlFor="editStartTime"
                    className="block text-sm font-medium text-gray-700 mb-1">
                    Waktu Mulai
                  </label>
                  <input
                    type="time"
                    id="editStartTime"
                    name="startTime"
                    value={editBookingForm.startTime}
                    onChange={handleEditFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="editEndTime"
                    className="block text-sm font-medium text-gray-700 mb-1">
                    Waktu Selesai
                  </label>
                  <input
                    type="time"
                    id="editEndTime"
                    name="endTime"
                    value={editBookingForm.endTime}
                    onChange={handleEditFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors">
                  Update Booking
                </button>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 px-4 py-2 bg-gray-400 text-white font-semibold rounded-md hover:bg-gray-500 transition-colors">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
