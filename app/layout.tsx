import { Providers } from "./provider";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import "./globals.css";
import HeadMeta from "@/components/HeadMeta"; // Your theme-color meta handler
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // ✅ Only exclude layout on home page "/"
  const excludeGlobalLayout = pathname === "/";

  return (
    <html lang="en" suppressHydrationWarning>
      <HeadMeta />
      <body>
        <Providers>
          {!excludeGlobalLayout && <Nav />}
          <main>{children}</main>
          {!excludeGlobalLayout && <Footer />}
        </Providers>
      </body>
    </html>
  );
}