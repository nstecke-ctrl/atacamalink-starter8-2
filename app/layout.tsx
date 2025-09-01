import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import ClientProviders from "./ClientProviders";

export const metadata: Metadata = {
  title: "AtacamaLink",
  description: "Tecnología confiable para entornos mineros exigentes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ClientProviders>
          <Nav />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
