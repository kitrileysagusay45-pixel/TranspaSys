import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata = {
  title: 'TranspaSys - Barangay Transparency System',
  description: 'A modern barangay management and transparency system for budget tracking, events, announcements, and citizen engagement.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
        <script dangerouslySetInnerHTML={{
          __html: `(function(){var t=localStorage.getItem('transpasys-theme')||'dark';document.documentElement.setAttribute('data-theme',t)})()`,
        }} />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
