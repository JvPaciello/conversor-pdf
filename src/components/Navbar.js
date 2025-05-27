import Link from 'next/link';
import { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link href="/" className={styles.navLogo}>
          ConverterPDF
        </Link>
        
        {/* Mobile menu button */}
        <button 
          className={styles.mobileMenuButton}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className={styles.hamburger}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>

        <div className={`${styles.navLinks} ${isOpen ? styles.showMenu : ''}`}>
          <Link href="/conversores/word-para-pdf">Word</Link>
          <Link href="/conversores/excel-para-pdf">Excel</Link>
          <Link href="/conversores/jpg-para-pdf">JPG</Link>
        </div>
      </div>
    </nav>
  );
}