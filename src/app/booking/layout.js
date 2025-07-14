"use client";

import Link from "next/link";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="navbar bg-base-100 shadow-sm px-4">
        <div className="flex-1">
          <Link href="/" className="btn btn-ghost text-xl">
            Booking Room
          </Link>
        </div>
        <div className="flex gap-2 items-center">
          <a
            onClick={() =>
<<<<<<< HEAD
              alert("Warna ini menandakan booking ruangan BOROBUDUR")
            }
            className="btn btn-sm bg-green-600 text-white">
            BOROBUDUR
          </a>
          <a
            onClick={() =>
              alert("Warna ini menandakan booking ruangan PRAMBANAN")
            }
            className="btn btn-sm bg-purple-600 text-white">
            PRAMBANAN
=======
              alert("Warna ini menandakan booking ruangan PRAMBANAN")
            }
            className="btn btn-sm bg-green-600 text-white">
            PRAMBANAN
          </a>
          <a
            onClick={() =>
              alert("Warna ini menandakan booking ruangan BOROBUDUR")
            }
            className="btn btn-sm bg-purple-600 text-white">
            BOROBUDUR
>>>>>>> 3e38e4585f8f968c9345500075b25864d7d916f2
          </a>
          <div className="dropdown dropdown-end"></div>
        </div>
      </div>
      <main className="flex-grow p-4 bg-gray-100">{children}</main>
<<<<<<< HEAD
      <footer className="footer sm:footer-horizontal footer-center bg-base-300 text-base-content p-4">
        <aside>
          <p>Copyright © {new Date().getFullYear()} - MDSI Amino</p>
        </aside>
      </footer>
=======
>>>>>>> 3e38e4585f8f968c9345500075b25864d7d916f2
    </div>
  );
}
