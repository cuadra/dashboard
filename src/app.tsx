import { createSignal, createEffect, For, Component, onMount } from "solid-js";
import {
  globalStyle,
  createThemeContract,
  createTheme,
} from "@macaron-css/core";

import { styled } from "@macaron-css/solid";
export const App: Component = () => {
  const [componentSource, setComponentSource] = createSignal("");
  const [components, setComponents] = createSignal([]);
  const [domainsList, setDomainsList] = createSignal([]);
  const [clientLibsList, setClientLibsList] = createSignal([]);
  const [domainsFilter, setDomainsFilter] = createSignal([]);
  const [clientlibsFilter, setClientlibsFilter] = createSignal([]);

  const vars = createThemeContract({
    color: {
      background: null,
    },
  });

  const lTheme = createTheme(vars, {
    color: {
      background: "#ffffff",
    },
  });
  const dTheme = createTheme(vars, {
    color: {
      background: "#202127",
    },
  });

  globalStyle("body", {
    margin: 0,
    padding: 0,
    backgroundColor: vars.color.background,
  });

  onMount(async () => {
    const data = await fetch("../data/components.json");
    const json = await data.json();
    setComponentSource(json);
    setComponents(json);
    let domains: string[] = [];
    let clientlibs: string[] = [];
    Object.entries(json).forEach((c: any) => {
      const domain = c[1][0].domain;
      const clientlib = c[1][0].clientlib;
      if (!domains.includes(domain)) {
        domains.push(domain);
      }
      if (!clientlibs.includes(clientlib)) {
        clientlibs.push(clientlib);
      }
    });
    setDomainsList(domains.sort());
    setClientLibsList(clientlibs.sort());
  });

  createEffect(() => {
    let filteredComponents = components();

    for (const [key, value] of Object.entries(components())) {
    }

    console.log("Filtered components: ", filteredComponents);
    setComponents(filteredComponents);
  });

  const Button = styled("button", {
    base: {
      backgroundColor: "white",
    },
    variants: {
      color: {
        active: {
          backgroundColor: "grey",
        },
      },
    },
  });
  return (
    <>
      <h2>Filters:</h2>
      <hr />
      <menu>
        {domainsList().map((domain) => (
          <Button
            color={domainsFilter().includes(domain) ? "active" : ""}
            onClick={(evt) => {
              evt.preventDefault();
              setDomainsFilter((current) =>
                current.includes(domain)
                  ? current.filter((item) => item !== domain)
                  : [...current, domain],
              );
            }}
          >
            {domain}
          </Button>
        ))}
      </menu>

      <menu>
        {clientLibsList().map((clientlib) => (
          <Button
            color={clientlibsFilter().includes(clientlib) ? "active" : ""}
            onClick={(evt) => {
              evt.preventDefault();
              setClientlibsFilter((current) =>
                current.includes(clientlib)
                  ? current.filter((item) => item !== clientlib)
                  : [...current, clientlib],
              );
            }}
          >
            {clientlib}
          </Button>
        ))}
      </menu>
      <hr />
    </>
  );
};
