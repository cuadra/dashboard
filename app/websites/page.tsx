import { domains } from "@/sites.js";
import { Fragment } from "react";
import {
  Library,
  Coins,
  Layers,
  Settings,
  AppWindow,
  Sparkles,
  Bug,
} from "lucide-react";
import websites from "@/data/2026-02-26/websites.json";
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "all" } = await searchParams;

  console.log(status);

  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen gap-6">
        <Sparkles size={48} className="animate-pulse text-primary" />
        <h1 className="text-4xl font-bold">Websites tested</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <table>
            <thead>
              <tr>
                <th className="px-4 py-2">Domain</th>
                <th className="px-4 py-2">Total Components</th>
                <th className="px-4 py-2">Instances</th>
                <th className="px-4 py-2">Clientlib</th>
                <th className="px-4 py-2">Token</th>
                <th className="px-4 py-2">Last Modified</th>
              </tr>
              <tr>
                <th className="px-4 py-2">
                  <input type="text" />
                </th>
                <th className="px-4 py-2">
                  <button>sort</button>
                </th>
                <th className="px-4 py-2">
                  <button>sort</button>
                </th>
                <th className="px-4 py-2">
                  <input type="text" />
                </th>
                <th className="px-4 py-2">
                  <input type="text" />
                </th>
                <th className="px-4 py-2">
                  <button>sort</button>
                </th>
              </tr>
            </thead>
            <tbody>
              {websites.websites.map((website) => (
                <Fragment key={website.domain}>
                  <tr className="border-b hover:bg-accent cursor-pointer">
                    <td className="px-4 py-2">
                      <h2 className="text-xl font-semibold">
                        {website.domain}
                      </h2>
                    </td>
                    <td className="px-4 py-2">{website.componentCount}</td>
                    <td className="px-4 py-2">{website.totalInstances}</td>
                    <td className="px-4 py-2">{website.clientlib}</td>
                    <td className="px-4 py-2">{website.designToken}</td>
                    <td className="px-4 py-2">{website.lastModified}</td>
                    <td className="px-4 py-2">
                      <a href="#">View</a>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={7} className="px-4 py-2 bg-gray-100">
                      <table>
                        {website.components.map((component) => (
                          <tr key={component.name} className="border-b">
                            <td className="px-4 py-2">{component.name}</td>
                            <td className="px-4 py-2">{component.instances}</td>
                          </tr>
                        ))}
                      </table>
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
