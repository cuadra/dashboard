import { Fragment } from "react";
import { ComponentStackBar } from "@/src/components/Charts/component-stack-bar";
import { Sparkles } from "lucide-react";
import { ChartExample } from "@/src/components/Charts/horizontalBars";
import websites from "@/src/data/2026-03-06/websites.json";
import { filteredComponents } from "@/features/filters/excludeComponents";
import * as stylex from "@stylexjs/stylex";

export default async function Home({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const { status = "all" } = searchParams ?? {};

  void status;

  const box = stylex.create({
    default: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
      backgroundColor: "rgba(255, 255, 255, 0.01)",
    },
    sized: {
      width: 100,
      height: 100,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },

    border: {
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: "rgba(255, 255, 255, 0.1)",
    },
    row: {
      gap: 20,
      display: "flex",
      flexDirection: "row",
      justifyContent: "flex-start",
    },
    column: {
      gap: 20,
      display: "flex",
      flexDirection: "column",
      alignItems: "start",
    },
  });

  return (
    <>
      <div {...stylex.props(box.default, box.row)}>
        <div {...stylex.props(box.default, box.sized)}>test</div>
        <div {...stylex.props(box.default, box.column)}>
          <div {...stylex.props(box.default, box.row)}>
            <div {...stylex.props(box.default, box.sized)}>test</div>
          </div>

          <div {...stylex.props(box.default, box.row, box.border)}>
            <div {...stylex.props(box.default, box.sized)}>test</div>
            <div {...stylex.props(box.default, box.column)}>
              <div {...stylex.props(box.default, box.sized)}>test</div>
              <div {...stylex.props(box.default, box.sized)}>test</div>
              <div {...stylex.props(box.default, box.sized)}>test</div>
            </div>
          </div>

          <div {...stylex.props(box.default, box.row, box.border)}>
            <div {...stylex.props(box.default, box.sized)}>test</div>
            <div {...stylex.props(box.default, box.column)}>
              <div {...stylex.props(box.default, box.sized)}>test</div>

              <div {...stylex.props(box.default, box.row, box.border)}>
                <div {...stylex.props(box.default, box.sized)}>test</div>
                <div {...stylex.props(box.default, box.column)}>
                  <div {...stylex.props(box.default, box.sized)}>test</div>
                  <div {...stylex.props(box.default, box.sized)}>test</div>
                  <div {...stylex.props(box.default, box.sized)}>test</div>
                </div>
              </div>
            </div>
          </div>

          <div {...stylex.props(box.default, box.row)}>
            <div {...stylex.props(box.default, box.sized)}>test</div>
          </div>
        </div>
      </div>

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
              </tr>
            </thead>
            <tbody>
              {websites.websites.map((website) => {
                const totalInstances = website.components.reduce(
                  (sum, component) => sum + component.instances,
                  0,
                );
                const componentsWithPercentages = website.components.map(
                  (component) => ({
                    ...component,
                    percentage:
                      totalInstances === 0
                        ? 0
                        : Number(
                            (
                              (component.instances / totalInstances) *
                              100
                            ).toFixed(2),
                          ),
                  }),
                );

                return (
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
                    </tr>
                    <tr>
                      <td colSpan={8} className="w-50 px-4 py-2 bg-gray-100">
                        <details>
                          <summary>Breakdown</summary>
                          <ComponentStackBar
                            legend={false}
                            data={filteredComponents(componentsWithPercentages)}
                          />
                        </details>
                      </td>
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
