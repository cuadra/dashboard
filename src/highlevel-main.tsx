import { render } from "solid-js/web";
import { ComponentTotals } from "./components/ComponentTotals";
import { ClientlibTotals } from "./components/ClientlibTotals";

const HighLevelPage = () => {
  return (
    <main style={{ padding: "24px", "font-family": "Arial, sans-serif" }}>
      <ComponentTotals />
      <ClientlibTotals />
    </main>
  );
};

render(() => <HighLevelPage />, document.getElementById("root")!);
