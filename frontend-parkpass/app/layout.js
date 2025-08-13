import './globals.css';
import { Inter, Montserrat } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata = {
  title: 'ParkPass - Online Park Booking System',
  description: 'Book your park tickets online with ParkPass',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="min-h-screen bg-gray-50">
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  );
}