import localFont from "next/font/local";
import "./globals.css";
import { StoreProvider } from "@/redux/StoreProvider";
import { PeerProvider } from "@/contexts/PeerContext";
import { Toaster } from "react-hot-toast";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "AI Quiz App",
  description: "Multiplayer quiz application with PDF upload and real-time gameplay",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <StoreProvider>
          <PeerProvider>
            {children}
            <Toaster position="top-center" reverseOrder={false} />
          </PeerProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
