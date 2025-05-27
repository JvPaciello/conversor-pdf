import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p>
        © {new Date().getFullYear()} Converter PDF BR. Todos os direitos reservados.
      </p>
      <div className={styles.footerLinks}>
        <Link href="/politica-de-privacidade">Política de Privacidade</Link>
        <span>|</span>
        <Link href="/termos-de-uso">Termos de Uso</Link>
        <span>|</span>
        <Link href="/contato">Contato</Link>
      </div>
    </footer>
  );
}
