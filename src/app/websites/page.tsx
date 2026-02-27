import { Fragment } from "react";
import { Sparkles } from "lucide-react";
import { ChartExample } from "@/src/components/Charts/horizontalBars";
import websites from "@/src/data/2026-02-26/websites.json";
import { filteredComponents } from "@/features/filters/excludeComponents";

export default async function Home({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const { status = "all" } = searchParams ?? {};

  void status;

  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="px-4 py-2">Domain</th>
                <th className="px-4 py-2">Total Components</th>
                <th className="px-4 py-2">Instances</th>
                <th className="px-4 py-2">Clientlib</th>
                <th className="px-4 py-2">Token</th>
                <th className="px-4 py-2">Last Modified</th>
                <th className="px-4 py-2">Details</th>
                <th className="px-4 py-2">Issues</th>
                <th className="px-4 py-2">
                  Component Usage
                  <small className="subtitle">
                    This chart provides a comparative view of component
                    deployment volume, identifying which components are most
                    heavily leveraged within the current implementation
                    landscape.
                  </small>
                </th>
              </tr>
            </thead>
            <tbody>
              {websites.websites.map((website) => (
                <Fragment key={website.domain}>
                  <tr className="border-b hover:bg-accent cursor-pointer">
                    <td className="px-4 py-2">{website.domain}</td>
                    <td className="px-4 py-2">{website.componentCount}</td>
                    <td className="px-4 py-2">{website.totalInstances}</td>
                    <td className="px-4 py-2">{website.clientlib}</td>
                    <td className="px-4 py-2">{website.designToken}</td>
                    <td className="px-4 py-2">
                      {new Date(website.lastModified).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      <a href="#">View</a>
                    </td>
                    <td className="px-4 py-2">Yes/No</td>
                    <td colSpan={7} className="w-50 px-4 py-2 bg-gray-100">
                      <details>
                        <summary>Toggle bar graph</summary>
                        <ChartExample
                          data={filteredComponents(website.components)}
                          heightClass="h-48"
                        />
                      </details>
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
