import Image from 'next/image';
import Link from 'next/link';

export function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-md" aria-label="ConverterPDF BR, página inicial">
      <Image src="/logo.svg" alt="" width={36} height={36} className="size-9" priority />
      <span className="text-[1.0625rem] leading-none font-extrabold tracking-tight [font-stretch:112%]">
        ConverterPDF<span className="text-stamp"> BR</span>
      </span>
    </Link>
  );
}
