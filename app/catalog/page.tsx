import ProductCatalog from "./catalog";
import ProductManager from "./productManager";
import { Providers } from "@/app/provider";

export default function Page() {
  return (
    <Providers>
      <main className="p-6">
        <ProductManager />
        <ProductCatalog />
      </main>
    </Providers>
  );
}