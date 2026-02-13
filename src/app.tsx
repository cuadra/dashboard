import { createSignal, createEffect, For, Component, onMount } from "solid-js";
import {
  globalStyle,
  createThemeContract,
  createTheme,
} from "@macaron-css/core";
import type { ComponentsJson } from "./types/components";

import { styled } from "@macaron-css/solid";
export const App: Component = () => {
  const [componentSource, setComponentSource] = createSignal<ComponentsJson>(
    {},
  );
  const [components, setComponents] = createSignal<ComponentsJson>({});
  const [domainsList, setDomainsList] = createSignal<string[]>([]);
  const [clientLibsList, setClientLibsList] = createSignal<string[]>([]);
  const [domainsFilter, setDomainsFilter] = createSignal<string[]>([]);
  const [clientlibsFilter, setClientlibsFilter] = createSignal<string[]>([]);

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
    const json = (await data.json()) as ComponentsJson;
    setComponentSource(json);
    setComponents(json);
    let domains: string[] = [];
    let clientlibs: string[] = [];

    Object.entries(json).forEach((c, i) => {
      const arr = c[1];

      for (const item of arr) {
        const domain = item.domain;
        if (domain) {
          if (!domains.includes(domain)) {
            domains.push(domain);
          }
        }
        const clientlib = item.clientlib?.toString();

        if (clientlib) {
          if (!clientlibs.includes(clientlib)) {
            clientlibs.push(clientlib);
          }
        }
      }
    });
    setDomainsList(domains.sort());

    setClientLibsList(clientlibs.sort());
  });
  createEffect(() => {
    console.log("Domains filter: ", domainsFilter());
    console.log("Clientlibs filter: ", clientlibsFilter());
    //console.log("Components source: ", typeof components(), components());

    const filteredComponents: ComponentsJson = {};
    for (const [key, value] of Object.entries(componentSource())) {
      filteredComponents[key] = value.filter((item) => {
        const domainMatch = domainsFilter().includes(item.domain);
        const clientlibMatch = clientlibsFilter().includes(
          item.clientlib.toString(),
        );
        return !(domainMatch || clientlibMatch);
      });
    }
    //console.log("Filtered components: ", filteredComponents);
    setComponents(filteredComponents);

    /*
    let filteredComponents = components();

    for (const [key, value] of Object.entries(filteredComponents)) {
      console.log(key, value);

      const tempArr = value.filter((item) => {
        const domainMatch =
          domainsFilter().length > 0 && domainsFilter().includes(item.domain);
        const clientlibMatch =
          clientlibsFilter().length > 0 &&
          clientlibsFilter().includes(item.clientlib || "");
        return domainMatch && clientlibMatch;
      });

      filteredComponents[key] = tempArr;
    }

    console.log("Filtered components: ", filteredComponents);
    //setComponents(filteredComponents);
    */
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
      <h2>Components:</h2>
      {Object.entries(components()).map(
        ([key, value]) =>
          value.length > 0 && (
            <details>
              <summary title={key}>
                {key.substring(key.lastIndexOf("/") + 1)} {value.length}
              </summary>
              <ol>
                <For each={value}>
                  {(item) => (
                    <li>
                      {item.domain}
                      <br />
                      <small>{item.page}</small>
                      <br />
                      <small>{item.clientlib}</small>
                    </li>
                  )}
                </For>
              </ol>
            </details>
          ),
      )}
    </>
  );
};
