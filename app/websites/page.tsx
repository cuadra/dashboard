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
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");

async function loadLatestWebsites() {
  const entries = await readdir(DATA_DIR, { withFileTypes: true });
  const datedDirs = entries
    .filter(
      (entry) => entry.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(entry.name),
    )
    .map((entry) => entry.name)
    .sort();

  const latest = datedDirs.at(-1);
  if (!latest) {
    return { websites: [] };
  }

  const filePath = path.join(DATA_DIR, latest, "websites.json");
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

export default async function Home({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const { status = "all" } = searchParams ?? {};
  const websites = await loadLatestWebsites();

  void status;

  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen gap-6">
        <Sparkles size={48} className="animate-pulse text-primary" />
        <h1 className="text-4xl font-bold">Websites tested</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <table className="w-full">
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
                      <table className="w-full">
                        <tbody>
                          {website.components.map((component) => (
                            <tr key={component.name} className="border-b">
                              <td className="px-4 py-2">{component.name}</td>
                              <td className="px-4 py-2">
                                {component.instances}
                              </td>
                            </tr>
                          ))}
                        </tbody>
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
