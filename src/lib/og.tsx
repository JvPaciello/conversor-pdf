import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import type { FileFormat } from './tools';

export const OG_SIZE = { width: 1200, height: 630 };

const NAVY = '#12142b';
const STAMP = '#a194ff';
const FAMILY_COLORS: Record<FileFormat['family'] | 'pdf', string> = {
  doc: '#2b579a',
  sheet: '#1d6f42',
  image: '#a24a06',
  pdf: '#c4271b',
};

function Badge({ label, family }: { label: string; family: FileFormat['family'] | 'pdf' }) {
  return (
    <div
      style={{
        display: 'flex',
        padding: '6px 12px',
        borderRadius: 6,
        background: FAMILY_COLORS[family],
        color: '#fff',
        fontSize: 22,
        fontWeight: 800,
        letterSpacing: 1,
      }}
    >
      {label}
    </div>
  );
}

// Static instances of the site's typeface (OFL) and the logo; images are rendered at build time.
function loadAssets() {
  const root = process.cwd();
  return Promise.all([
    readFile(join(root, 'src/assets/archivo-500.ttf')),
    readFile(join(root, 'src/assets/archivo-semiexpanded-800.ttf')),
    readFile(join(root, 'public/logo.svg'), 'base64'),
  ]);
}

/** Shared social preview: the title on the desk, a stamped sheet beside it. */
export async function ogImage({ title, formats }: { title: string; formats: FileFormat[] }) {
  const shown = formats.filter((f) => f.ext !== 'jpeg');
  const [regular, heavy, logo] = await loadAssets();
  return new ImageResponse(
    (
      <div
        style={{ display: 'flex', width: '100%', height: '100%', background: NAVY, padding: 72, fontFamily: 'Archivo' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 700 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 30, fontWeight: 800, color: '#fff' }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- rendered by next/og, not the browser */}
            <img src={`data:image/svg+xml;base64,${logo}`} width={56} height={56} alt="" />
            <div style={{ display: 'flex' }}>
              ConverterPDF<span style={{ color: STAMP, marginLeft: 8 }}>BR</span>
            </div>
          </div>
          <div style={{ display: 'flex', fontSize: 62, fontWeight: 800, lineHeight: 1.08, color: '#fff', letterSpacing: -1.5 }}>
            {title}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {shown.map((f) => (
                <Badge key={f.ext} label={f.ext.toUpperCase()} family={f.family} />
              ))}
              <div style={{ display: 'flex', color: '#868da9', fontSize: 30, margin: '0 6px' }}>→</div>
              <Badge label="PDF" family="pdf" />
            </div>
            <div style={{ display: 'flex', fontSize: 26, color: '#b0b6cf' }}>
              Grátis, sem cadastro e sem enviar arquivos
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              display: 'flex',
              position: 'relative',
              flexDirection: 'column',
              width: 300,
              height: 400,
              background: '#fff',
              padding: '56px 36px',
              gap: 18,
              transform: 'rotate(4deg)',
              boxShadow: '0 10px 0 #0a0c1c',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 44,
                height: 44,
                backgroundImage: `linear-gradient(to bottom left, ${NAVY} 50%, #dde1ea 50%)`,
              }}
            />
            {[200, 228, 170, 228, 210, 120].map((w, i) => (
              <div key={i} style={{ display: 'flex', width: w, height: 12, borderRadius: 6, background: '#e3e6ee' }} />
            ))}
            <div
              style={{
                position: 'absolute',
                left: 32,
                top: 240,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 236,
                height: 92,
                border: '6px solid #3a2bc4',
                borderRadius: 10,
                color: '#3a2bc4',
                fontSize: 26,
                fontWeight: 800,
                whiteSpace: 'nowrap',
                transform: 'rotate(-12deg)',
              }}
            >
              PDF PRONTO
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Archivo', data: regular, weight: 500, style: 'normal' },
        { name: 'Archivo', data: heavy, weight: 800, style: 'normal' },
      ],
    },
  );
}
