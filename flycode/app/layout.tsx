import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";


export const metadata: Metadata = {
  title: "flycode",
  description: "Message Sharing app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="en">
      <body
        className={``}
      >
        
          {children}
        <Toaster/>
      </body>
    </html>
  );
}
