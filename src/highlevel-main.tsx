import { render } from "solid-js/web";
import { ComponentTotals } from "./components/ComponentTotals";
import { ClientlibTotals } from "./components/ClientlibTotals";

import { styled } from "@macaron-css/solid";

const HighLevelPage = () => {
  const Main = styled("main", {
    base: {
      display: "flex",
      gap: "24px",
    },
  });
  return (
    <Main>
      <ComponentTotals />
      <ClientlibTotals />
    </Main>
  );
};

render(() => <HighLevelPage />, document.getElementById("root")!);
