import json from "@/src/data/2026-02-27/components.json";
import { Fragment } from "react";
import { excludedList } from "@/src/data/excludedComponents";
import { friendlyMapping } from "@/src/data/friendlyMapping";
import * as stylex from "@stylexjs/stylex";
export default async function Home({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const { status = "all" } = searchParams ?? {};
  const filteredComponents = json.components
    .map((component) => ({
      ...component,
      component: component.component.split("/").pop() ?? component.component,
    }))
    .filter((component) => !excludedList.includes(component.component));

  void status;
  console.log(filteredComponents);

  const card = stylex.create({
    default: {
      padding: "1px",
      width: "20%",
      position: "relative",
      borderRadius: 8,
      overflow: "hidden",
      flexGrow: 1,
      "::after": {
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        content: " ",
        backgroundImage: "linear-gradient(135deg, #ff7a18, #32d2ff)",
        zIndex: 0,
      },
    },
    container: {
      marginTop: 30,
      display: "flex",
      gap: 25,
      flexWrap: "wrap",
      justifyContent: "space-evenly",
    },
    background: {
      height: "100%",
      backgroundColor: "#1e294b",
      borderRadius: 8,
      position: "relative",
      zIndex: 1,
      overflow: "hidden",
    },
    listContainer: {
      padding: 16,
      display: "flex",
      flexWrap: "wrap",
      gap: "10%",
    },
    listItem: {
      margin: "5px 0",
      width: "45%",
    },
    title: {
      paddingRight: 20,
      width: "100%",
      fontSize: 14,
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      textAlign: "left",
      overflow: "hidden",
    },
    definition: {
      marginLeft: 0,
      fontSize: 12,
      color: "rgba(255, 255, 255, 0.3)",
    },
  });

  const fonts = stylex.create({
    line0: {
      lineHeight: "0",
    },
    default: {
      color: "#eee",
      family: "'Manrope', sans-serif",
    },
    h1: {
      margin: "0",
      fontSize: 50,
      fontWeight: 200,
      textAlign: "center",
    },
    h2: {
      marginTop: "10px",
      marginBottom: 0,
      fontSize: 70,
      color: "grey",
      fontWeight: 200,
      lineHeight: "50px",
    },
    h3: {
      marginTop: "5px",
      color: "grey",
      fontSize: 30,
      fontWeight: 200,
    },

    h4: {
      margin: "0",
      padding: 16,
      color: "grey",
      fontSize: 22,
      fontWeight: 200,
      backgroundColor: "#0f172a",
    },
    description: {
      marginTop: "20px",
      marginBottom: "10px",
      fontSize: 14,
      display: "block",
      fontWeight: 600,
      textAlign: "center",
      color: "rgba(255, 255, 255, 0.2)",
    },
  });
  const notification = stylex.create({
    default: {
      marginLeft: 8,
      padding: "2px 6px",
      fontSize: 12,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: 4,
      color: "#eee",
      position: "relative",
      top: -1,
    },
  });
  return (
    <>
      <header>
        <h1 {...stylex.props(fonts.default, fonts.h1)}>Components</h1>
      </header>
      <div {...stylex.props(card.container)}>
        {filteredComponents.map((component) => (
          <div key={component.component} {...stylex.props(card.default)}>
            <div {...stylex.props(card.background)}>
              <h2 {...stylex.props(fonts.default, fonts.h4)}>
                {friendlyMapping[component.component] ?? component.component}{" "}
                <span {...stylex.props(notification.default)}>
                  {component.totalInstances}
                </span>
              </h2>
              <div {...stylex.props(card.listContainer)}>
                {component.sites.map((site, i) => (
                  <dl key={i} {...stylex.props(card.listItem)}>
                    <dt {...stylex.props(card.title)} title={site.domain}>
                      {site.domain}
                    </dt>
                    <dd {...stylex.props(card.definition)}>
                      {site.clientlib} / {site.totalInstances}
                    </dd>
                  </dl>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
