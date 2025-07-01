"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/api/auth/signin");
    } else if (session?.user?.role !== "admin") {
      alert("Anda tidak memiliki akses ke halaman admin.");
      router.replace("/");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return <div className="p-6 text-center">🔄 Memuat sesi...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="navbar bg-base-100 shadow-sm px-4">
        <div className="flex-1">
          <Link href="/" className="btn btn-ghost text-xl">
            Booking Room
          </Link>
        </div>
        <div className="flex gap-2 items-center">
          {/* <Link
            href="/booking/admin"
            className={`btn btn-sm ${
              pathname === "/booking/admin"
                ? "bg-blue-700 text-white"
                : "bg-blue-300 text-white"
            }`}>
            Dashboard
          </Link>
          <Link
            href="/booking"
            className={`btn btn-sm ${
              pathname === "/booking"
                ? "bg-blue-700 text-white"
                : "bg-blue-300 text-white"
            }`}>
            Booking
          </Link> */}
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <Image
                  src="/ProfilePicture.jpg"
                  className="rounded-full"
                  alt="Avatar"
                  width={40}
                  height={40}
                />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box shadow mt-3 w-52 z-[1]">
              <li>
                <a>Profil</a>
              </li>
              <li>
                <a>Pengaturan</a>
              </li>
              <li
                onClick={() =>
                  signOut({
                    callbackUrl: "/api/auth/signin",
                  })
                }>
                <a>Keluar</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <main className="flex-grow p-4 bg-gray-100">{children}</main>
    </div>
  );
}
