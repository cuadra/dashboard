import { Fragment } from "react";
import { Sparkles } from "lucide-react";
import json from "@/src/data/2026-02-27/components.json";
import { excludedList } from "@/src/data/excludedComponents";
import { friendlyMapping } from "@/src/data/friendlyMapping";
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
  return (
    <>
      {filteredComponents.map((component) => (
        <details key={component.component}>
          <summary>
            {friendlyMapping[component.component] ?? component.component}{" "}
            <sup>{component.totalInstances}</sup>
          </summary>
          <table className="table">
            <thead>
              <tr>
                <th>site</th>
                <th>clientlib</th>
                <th>instances</th>
              </tr>
            </thead>
            <tbody>
              {component.sites.map((site, i) => (
                <tr key={i}>
                  <td>{site.domain}</td>
                  <td>{site.clientlib}</td>
                  <td>{site.totalInstances}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      ))}
    </>
  );
}
