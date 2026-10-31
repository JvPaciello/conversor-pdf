export const SITE = {
  name: 'ConverterPDF BR',
  url: 'https://www.converterpdfbr.com.br',
  description:
    'Converta Word, Excel e imagens para PDF de graça, direto no navegador. Sem cadastro e sem enviar arquivos para a internet.',
  email: 'joaovictorpaciello@gmail.com',
  adsenseClient: 'ca-pub-2458442591696135',
  locale: 'pt_BR',
} as const;

export function absoluteUrl(path = '/') {
  return `${SITE.url}${path === '/' ? '/' : path}`;
}
