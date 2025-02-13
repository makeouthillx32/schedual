import ProductCatalog from "./catalog";
import { Providers } from "@/app/provider"; // ✅ Correct import

export default function Page() {
  return (
    <Providers>
      <main className="p-6">
        <ProductCatalog />
      </main>
    </Providers>
  );
}