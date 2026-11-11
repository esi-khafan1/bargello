import type { Metadata } from 'next';
import '@fontsource-variable/vazirmatn';
import '@fontsource-variable/playfair-display';
import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import { Header } from '@/components/Header';
import { CartDrawer } from '@/components/CartDrawer';
import { SearchModal } from '@/components/SearchModal';
import { FloatingSupport } from '@/components/FloatingSupport';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'بارگلو ایران | فروشگاه رسمی عطر و ادکلن اورجینال بارگلو (طرح ۱+۱)',
  description:
    'خرید اینترنتی عطر و ادکلن اورجینال بارگلو ترکیه با ضمانت اصالت، کمپین ۱+۱ ادکلن‌های ۵۰ میل، کالکشن نیش، بادی اسپلش و عطر خودرو.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <StoreProvider>
          <Header />
          <CartDrawer />
          <SearchModal />
          <main style={{ minHeight: '68vh' }}>{children}</main>
          <FloatingSupport />
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
