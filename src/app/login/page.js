"use client";
import "../globals.css"; // Pastikan path ini sesuai dengan struktur proyek Anda

export default function Login() {
  return (
    <div className="bg-white p-8 rounded-lg  shadow-lg w-full max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Masuk Booking Room
      </h1>
      <form className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="email">
            Nama Pengguna
          </label>
          <input
            type="email"
            id="email"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="password">
            Kata Sandi
          </label>
          <input
            type="password"
            id="password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200">
          Masuk
        </button>
      </form>
    </div>
  );
}
