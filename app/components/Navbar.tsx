"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isStories = Boolean(pathname && pathname.startsWith("/stories"));
  const isLightPage = Boolean(
    pathname && (pathname.startsWith("/stories") || pathname.startsWith("/sign-up") || pathname.startsWith("/admin"))
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 5);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 w-full px-6 py-[25px] sm:px-10 transition-colors duration-300 ${
        scrolled ? "bg-white border-b border-slate-200 shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <a href="/" className={"header-title sm:text-2xl text-lg font-semibold " + (scrolled ? "text-slate-900" : isLightPage ? "text-slate-900" : "text-white")}>
          Virac Special
        </a>
        <nav className={`flex items-center gap-8 text-sm font-medium uppercase tracking-[0.25em] ${scrolled ? "text-slate-700" : isLightPage ? "text-slate-700" : "text-white"}`}>
          <a
            href="/stories"
            className={`transition ${(scrolled || isLightPage) ? "hover:text-slate-900" : "hover:text-slate-200"}`}
          >
            Stories
          </a>
          <a
            href="mailto:kevdkoz@gmail.com"
            className={`transition ${(scrolled || isLightPage) ? "hover:text-slate-900" : "hover:text-slate-200"}`}
          >
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}
