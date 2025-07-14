"use client";
import "../globals.css"; // Pastikan path ini sesuai dengan struktur proyek Anda

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Google Calendar Integration
        </h1>
        <p className="text-gray-700 mb-4">
          This page is designed to integrate with Google Calendar. Please ensure
          you have the necessary API keys and client ID configured.
        </p>
        <button
          onClick={() => (window.location.href = "/api/auth/google")}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200">
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
