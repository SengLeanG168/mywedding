import localFont from 'next/font/local';

export const khmerSiemreap = localFont({
  src: [
    {
      path: '../public/fonts/Siemreap-Regular.ttf',
      weight: '100 900',
      style: 'normal',
    },
  ],
  variable: '--font-khmer-siemreap',
  display: 'swap',
  preload: true,
  fallback: ['Khmer OS Siemreap', 'Khmer', 'sans-serif'],
});

export const khmerMuolLight = localFont({
  src: [
    {
      path: '../public/fonts/Moul-Regular.ttf',
      weight: '100 900',
      style: 'normal',
    },
  ],
  variable: '--font-khmer-muol-light',
  display: 'swap',
  preload: true,
  fallback: ['Khmer OS Muol Light', 'Khmer', 'serif'],
});
