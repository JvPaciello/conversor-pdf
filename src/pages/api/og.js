import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default function handler() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          padding: '40px 60px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: 80, fontWeight: 700, color: '#ffffff', letterSpacing: '-2px' }}>
            ConverterPDF
          </span>
          <span style={{ fontSize: 80, fontWeight: 700, color: '#ef4444', letterSpacing: '-2px' }}>
            BR
          </span>
        </div>

        <div
          style={{
            fontSize: 34,
            color: '#a3a3a3',
            textAlign: 'center',
            maxWidth: '860px',
            marginBottom: '36px',
          }}
        >
          Converta Word, Excel e Imagens para PDF — 100% Grátis, Sem Cadastro
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          {['Word → PDF', 'Excel → PDF', 'JPG → PDF'].map((text) => (
            <div
              key={text}
              style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333333',
                borderRadius: '10px',
                padding: '14px 28px',
                color: '#ffffff',
                fontSize: 24,
              }}
            >
              {text}
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: '36px',
            fontSize: 22,
            color: '#22c55e',
            fontWeight: 600,
          }}
        >
          converterpdfbr.com.br
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
