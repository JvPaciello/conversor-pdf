import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  function handleNavToggle() {
    setIsNavOpen(!isNavOpen);
  }

  return (
    <header className=" p-10 flex items-center justify-between p-5 bg-neutral-950 fixed top-0 left-0 right-0 z-50">
      <Link href="/" className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 hover:opacity-80 transition-opacity">
        ConverterPDF
      </Link>

      {/* Menu do pc */}
      <nav className="hidden lg:flex gap-8">
        <Link
          href="/"
          className="text-gray-100 hover:text-teal-700 transition"
        >
          Início
        </Link>
        <Link
          href="/conversores/word-para-pdf"
          className="text-gray-100 hover:text-teal-700 transition"
        >
          Word
        </Link>
        <Link
          href="/conversores/excel-para-pdf"
          className="text-gray-100 hover:text-teal-700 transition"
        >
          Excel
        </Link>
        <Link
          href="/conversores/jpg-para-pdf"
          className="text-gray-100 hover:text-teal-700 transition"
        >
          JPG
        </Link>
      </nav>

      {/* hamburguer mobile */}
      <div className="lg:hidden">
        <label className="flex flex-col gap-1 w-6 cursor-pointer">
          <input
            onClick={handleNavToggle}
            className="peer hidden"
            type="checkbox"
            checked={isNavOpen}
            onChange={handleNavToggle}
          />
          <div className="rounded h-[3px] w-full bg-white duration-300 peer-checked:rotate-45 peer-checked:translate-y-[9px] origin-center" />
          <div className="rounded h-[3px] w-full bg-white duration-300 peer-checked:opacity-0" />
          <div className="rounded h-[3px] w-full bg-white duration-300 peer-checked:-rotate-45 peer-checked:-translate-y-[9px] origin-center" />
        </label>
      </div>

      {/* Menu do mobile */}
      {isNavOpen && (
        <div className="absolute top-16 left-0 w-full bg-black/50 shadow-md py-5 px-6 flex flex-col gap-4 lg:hidden z-20">
          <Link
            href="/"
            onClick={handleNavToggle}
            className="text-gray-100 hover:text-teal-700 transition"
          >
            Início
          </Link>
          <Link
            href="/conversores/word-para-pdf"
            onClick={handleNavToggle}
            className="text-gray-100 hover:text-teal-700 transition"
          >
            Word
          </Link>
          <Link
            href="/conversores/excel-para-pdf"
            onClick={handleNavToggle}
            className="text-gray-100 hover:text-teal-700 transition"
          >
            Excel
          </Link>
          <Link
            href="/conversores/jpg-para-pdf"
            onClick={handleNavToggle}
            className="text-gray-100 hover:text-teal-700 transition"
          >
            JPG
          </Link>
        </div>
      )}
    </header>
  );
}
