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
                courses={dayData.courses.filter((c) => c.room === "BOROBUDUR")}
              />
            ))}
          </div>
        </div>

        {/* Kolom 2: Booking QR */}
        <div className="">
          {/* <div className="flex flex-col items-center justify-center h-[80vh] text-white">
            <h2 className="text-xl font-bold mb-4">Booking Ruangan</h2>
            <div className="bg-white p-4 rounded-xl shadow-xl">
              <img src="/qr-code.jpg" alt="QR Booking" className="w-40 h-40" />
            </div>
            <p className="mt-4 text-sm opacity-80 text-center">
              Scan QR ini untuk melakukan pemesanan
            </p>
          </div> */}
          <Calendar data={backendBookings} />
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
                courses={dayData.courses.filter((c) => c.room === "PRAMBANAN")}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

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
                courses={dayData.courses.filter((c) => c.room === "BOROBUDUR")}
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
              <img src="/qr-code.jpg" alt="QR Booking" className="w-40 h-40" />
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
                courses={dayData.courses.filter((c) => c.room === "PRAMBANAN")}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

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
            <div className="absolute left-[70px] top-[40px] bottom-6 w-0.5 bg-white/20"></div>
            {loading && (
              <p className="text-white text-center">Memuat jadwal...</p>
            )}
            {error && <p className="text-red-400 text-center">{error}</p>}
            {!loading &&
              !error &&
              processedSchedule.map((dayData, index) => (
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

        {/* Kolom 2: Calendar Component + QR (Tidak diubah dari penempatan Anda sebelumnya) */}
        <div className="flex flex-col items-center justify-center h-[80vh] text-white">
          <h2 className="text-xl font-bold mb-4">Booking Ruangan</h2>
          <div className="bg-white p-4 rounded-xl shadow-xl">
            {/* Ganti src ini dengan QR Code dinamis jika perlu */}
            <img
              src="/qrcode-placeholder.png" // Menggunakan placeholder QR yang Anda miliki
              alt="QR Booking"
              className="w-40 h-40"
            />
          </div>
          <p className="mt-4 text-sm opacity-80 text-center">
            Scan QR ini untuk melakukan pemesanan
          </p>
          {/* Calendar Component */}
          {/* Di sini, `onDataChange` tidak akan memicu fetch HTTP lagi,
                tapi hanya memproses ulang `backendDummyData` untuk demo ini.
                Dalam aplikasi nyata, ini akan memicu re-fetch dari API. */}
          <Calendar
            data={bookingsByDate}
            onDataChange={() => processBookingData(backendDummyData)} // Memanggil ulang processBookingData dengan dummyData
          />
        </div>

        {/* Kolom 3: Prambanan */}
        <div className="bg-purple-800/30 backdrop-blur-xl border border-purple-400/20 rounded-3xl p-6 shadow-2xl flex flex-col h-[80vh]">
          <div className="text-white mb-4">
            <h1 className="text-2xl font-bold">PRAMBANAN</h1>
            <p className="text-sm opacity-80">Ruang Meeting 2</p>
          </div>
          <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar relative">
            <div className="absolute left-[70px] top-[40px] bottom-6 w-0.5 bg-white/20"></div>
            {loading && (
              <p className="text-white text-center">Memuat jadwal...</p>
            )}
            {error && <p className="text-red-400 text-center">{error}</p>}
            {!loading &&
              !error &&
              processedSchedule.map((dayData, index) => (
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
