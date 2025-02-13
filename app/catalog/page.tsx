import ProductCatalog from "./catalog";
import Provider from "@/app/provider"; // Ensure this path is correct

export default function Page() {
  return (
    <Provider>
      <main className="p-6">
        <ProductCatalog />
      </main>
    </Provider>
  );
}