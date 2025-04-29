import { Providers } from "./provider";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import HeadMeta from "@/components/HeadMeta";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ff0000" /> {/* fallback for non-js */}
      </head>
      <body>
        <Providers>
          <HeadMeta />
          <Nav />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
