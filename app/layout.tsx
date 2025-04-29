import "./globals.css";
import { Providers } from "./provider";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import HeadMeta from "@/components/HeadMeta";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <HeadMeta /> {/* already handles dynamic theme-color */}
      <body>
        <Providers>
          <ClientLayoutWrapper />
          <Nav />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}