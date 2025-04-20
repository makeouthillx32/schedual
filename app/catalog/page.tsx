import ProductCatalog from "./catalog";

import { Providers } from "@/app/provider";

export default function Page() {
  return (
    <Providers>
      <main className="p-6">
        
        <ProductCatalog />
      </main>
    </Providers>
  );
}