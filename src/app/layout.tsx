import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  Show,
  UserButton,
} from "@clerk/nextjs";
import { Navbar } from "~/components/shared/navbar";

export const metadata: Metadata = {
  title: "Termin sistemi",
  description: "Deadline system for Tuzemen Textile",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <ClerkProvider>
          <main>
            <Navbar />
            {children}
          </main>
        </ClerkProvider>
      </body>
    </html>
  );
}
