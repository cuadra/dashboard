import Image from "next/image";
import overview from "@/data/overview.json";
import { ChartExample } from "./components/Charts";
import { PChart } from "./components/Charts/clientlibs";
import { TokenChart } from "./components/Charts/tokens";
import { ComponentStackBar } from "./components/Charts/component-stack-bar";
import {
  Smile,
  Library,
  Coins,
  Layers,
  Settings,
  AppWindow,
  Sparkles,
  Bug,
} from "lucide-react";
export default function Home() {
  const excludeList = [
    "page",
    "responsivegrid",
    "proxyheader",
    "proxyfooter",
    "proxyexitnotification",
    "button",
    "header",
    "footer",
    "primary-nav",
    "utility-nav",
    "language-selector",
    "utility-navigation-item",
    "exit-overlay",
    "container",
    "search-box",
    "indication-picker",
    "socialmediaicons",
    "experiencefragment",
    "rte",
    "columncontrol",
    "fab",
    "isi",
    "error-page",
  ];
  const components = overview.components.filter((c) => {
    const shortened = c.name.split("/").pop();
    return !excludeList.includes(shortened?.toLowerCase());
  });

  const totalInstances = components.reduce((sum, c) => sum + c.instances, 0);

  const percentages = components.map((component) => ({
    ...component,
    percentage: ((component.instances / totalInstances) * 100).toFixed(2) + "%",
  }));

  const clientlibPercentages = overview.clientlibs.map((clientlib) => ({
    name: clientlib.name,
    percentage:
      ((clientlib.domains.length / overview.totalSites) * 100).toFixed(2) + "%",
  }));

  const chartData = percentages.map((component) => ({
    name: component.name.split("/").pop() || component.name,
    percentage: parseFloat(component.percentage),
    instances: component.instances,
  }));

  const chartClientlibData = clientlibPercentages.map((clientlib) => ({
    name: clientlib.name,
    percentage: parseFloat(clientlib.percentage),
  }));

  const sortedComponents = [...components].sort(
    (a, b) => b.instances - a.instances,
  );

  console.log(overview);

  return (
    <>
      <section className="layout-row">
        <div className="card card-flex">
          <AppWindow />
          {overview.totalSites} <small>websites</small>
        </div>
        <div className="card card-flex">
          <Library />
          {overview.clientlibs.length} <small>clientlibs</small>
        </div>
        <div className="card card-flex">
          <Coins />
          {overview.tokens.length} <small>token files</small>
        </div>
        <div className="card card-flex">
          <Layers />
          {overview.totalPages} <small>pages</small>
        </div>
        <div className="card card-flex">
          <Settings />
          {components.length} <small>component types</small>
        </div>
      </section>
      <section className="layout-row mt-md">
        <div className="card card-grow text-center">
          <blockquote>
            {totalInstances} <small>components have been used</small>
          </blockquote>
        </div>
      </section>
      <div className="section-pad">
        <div className="mt-lg">
          <h2 className="text-center">
            <Sparkles />
            Component popularity
          </h2>
          <ComponentStackBar data={chartData} />
        </div>
        <ChartExample data={chartData} />
        <div className="text-center">
          The following core infrastructure components have been excluded to
          focus attention on optional and content-driven components.
          <br />
          {excludeList.map((comp) => (
            <span key={comp} className="badge">
              {comp}
            </span>
          ))}
        </div>
      </div>

      <section className="layout-row">
        <div className="card card-flex">
          <PChart data={chartClientlibData} />
          <table className="table table--mt">
            <caption>per last modified date</caption>
            <thead>
              <tr>
                <th className="text-left">Clientlib</th>
                <th className="text-right">Sites</th>
              </tr>
            </thead>
            <tbody>
              {[...overview.clientlibs]
                .sort((a, b) => b.domains.length - a.domains.length)
                .map((lib) => (
                  <tr key={lib.name} className="table-row">
                    <td>
                      <details open>
                        <summary>{lib.name}</summary>
                        <ol>
                          {lib.domains.map((domain) => (
                            <li key={domain}>{domain}</li>
                          ))}
                        </ol>
                      </details>
                    </td>
                    <td className="text-right">{lib.domains.length}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="card card-flex">
          <h2 className="text-center">Token breakdown</h2>
          <table className="table table--mt">
            <caption>tokens by site usage</caption>
            <thead>
              <tr>
                <th className="text-left">Token</th>
                <th className="text-right">Sites</th>
              </tr>
            </thead>
            <tbody>
              {[...overview.tokens]
                .sort((a, b) => b.domains.length - a.domains.length)
                .map((token) => (
                  <tr key={token.name} className="table-row">
                    <td>
                      <details open>
                        <summary>{token.name.replace(".json", "")}</summary>
                        <ol>
                          {token.domains.map((domain) => (
                            <li key={domain}>{domain}</li>
                          ))}
                        </ol>
                      </details>
                    </td>
                    <td className="text-right">{token.domains.length}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
      <h2 className="text-center">Latest Published Pages</h2>
      <div className="section-pad-lg">
        <table className="table">
          <caption>per last modified date</caption>
          <thead>
            <tr>
              <th style={{ width: 30 }} className="text-left">
                ID
              </th>
              <th style={{ width: 100 }} className="text-left">
                Domain
              </th>
              <th className="text-left">Web page</th>
              <th className="text-left">When?</th>
              <th className="text-right">Link</th>
            </tr>
          </thead>
          <tbody>
            {overview.latestPages.map((page, i) => (
              <tr key={page.url} className="table-row">
                <td className="text-muted text-left py-10">{i + 1}</td>
                <td className="text-muted text-left py-10">
                  {new URL(page.url).hostname}
                </td>
                <td className="text-muted">{page.url.toLowerCase()}</td>
                <td>
                  <small>{new Date(page.lastModified).toLocaleString()}</small>
                </td>
                <td className="text-right">
                  <a target="_blank" href={page.url.toLowerCase()}>
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="section-pad-lg">
        <h2 id="errors" className="text-center">
          <Bug />
          Errors
        </h2>
        <table className="table">
          <caption>Issues</caption>
          <thead>
            <tr>
              <th style={{ width: 30 }} className="text-left">
                ID
              </th>
              <th className="text-left">Webpage</th>
              <th className="text-left">Errors</th>
              <th className="text-right">Link</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(overview.errorMessages).map(([key, value], i) => (
              <tr key={key} className="table-row">
                <td className="text-muted text-left py-10">{i + 1}</td>
                <td className="text-muted text-left py-10">
                  {key.toLowerCase()}
                  <details open={value.length < 6}>
                    <summary>View error messages</summary>
                    <ol>
                      {value.map((message, index) => (
                        <li key={index}>{message}</li>
                      ))}
                    </ol>
                  </details>
                </td>
                <td className="text-muted">{value.length}</td>
                <td className="text-right">
                  <a target="_blank" href={key.toLowerCase()}>
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
