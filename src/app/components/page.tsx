import json from "@/src/data/2026-03-12/components.json";
import { excludedList } from "@/src/data/excludedComponents";
import { friendlyMapping } from "@/src/data/friendlyMapping";
import * as stylex from "@stylexjs/stylex";
import Card from "@/src/components/Card/Card";
import { container, list } from "./stylex";
import typography from "@/src/styles/typography";
import { dl } from "@/src/styles/typography/lists";

import Nav from "@/src/components/Nav/Nav";
const Components = async ({
  searchParams,
}: {
  searchParams: Promise<{ user?: string; pass?: string }>;
}) => {
  const params = await searchParams;
  let isAuthenticated = false;
  if (
    params.user === process.env.USER_NAME &&
    params.pass === process.env.USER_PASSWORD
  ) {
    isAuthenticated = true;
  }

  const filteredComponents = json.components
    .map((component) => ({
      ...component,
      component: component.component.split("/").pop() ?? component.component,
    }))
    .filter((component) => !excludedList.includes(component.component));

  return (
    <>
      {isAuthenticated && (
        <>
          <Nav user={params.user} pass={params.pass} />
          <div className="container">
            <header>
              <h1 {...stylex.props(typography.default, typography.h1)}>
                Components
              </h1>
            </header>

            <div {...stylex.props(container.container)}>
              {filteredComponents.map((component) => (
                <Card
                  key={component.component}
                  label={
                    friendlyMapping[component.component] ?? component.component
                  }
                  alert={component.totalInstances}
                >
                  <>
                    {component.sites.map((site, i) => (
                      <dl key={i} {...stylex.props(list.item)}>
                        <dt
                          {...stylex.props(list.title, dl.title)}
                          title={site.domain}
                        >
                          {site.domain}
                        </dt>
                        <dd {...stylex.props(list.definition, dl.definition)}>
                          {site.clientlib} / {site.totalInstances}
                        </dd>
                      </dl>
                    ))}
                  </>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};
Components.displayName = "Components Page";
export default Components;
