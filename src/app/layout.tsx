import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";

const manrope = localFont({
  src: "./fonts/Manrope-VariableFont_wght.ttf",
  variable: "--font-sans",
  weight: "200 800",
});

export const metadata: Metadata = {
  title: "Chat Interview",
  description: "Structured chat interview experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(manrope.variable, "h-full overflow-hidden")}>
      <body className={cn(manrope.className, "antialiased h-full overflow-hidden")}>
        {children}
      </body>
    </html>
  );
}
