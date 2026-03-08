import websites from "@/src/data/2026-03-07/websites.json";
import * as stylex from "@stylexjs/stylex";
import Sitemap from "@/src/components/Sitemap/page";
import { TPage, TChildren } from "@/src/components/Sitemap/sitemap.types";
export default async function Home({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const { status = "all" } = searchParams ?? {};

  void status;

  const website = stylex.create({
    site: {
      margin: "100px 0",
    },
  });
  const box = stylex.create({
    default: {},
    sized: {
      padding: 10,
      minWidth: 200,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: 8,
      overflow: "hidden",
      textOverflow: "ellipsis",
    },

    page: {
      gap: 30,
      display: "flex",
    },
    children: {
      gap: 20,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
    },
  });

  type SitemapNode = {
    url: string;
    children: TChildren;
  };

  function buildSitemap(urls: string[]): TChildren {
    const root: SitemapNode = {
      url: "/",
      children: [],
    };
    for (const fullUrl of urls) {
      const path = new URL(fullUrl).pathname.replace(/^\/|\/$/g, "");
      const segments = path ? path.split("/") : [];

      let current: SitemapNode = root;
      let currentPath = "";

      for (const segment of segments) {
        //currentPath += `/${segment}/`;
        currentPath = `${segment}/`;

        let child = current.children.find((c) => c.url === currentPath);

        if (!child) {
          child = {
            url: currentPath,
            children: [],
          };

          current.children.push(child);
        }

        current = child;
      }
    }

    return root.children;
  }
  const mapping = websites.websites.map((website) => {
    return {
      url: website.domain,
      clientlib: website.clientlib,
      totalComponents: website.componentCount,
      instances: website.totalInstances,
      token: website.designToken,
      lastModified: website.lastModified,
      children: buildSitemap(website.pages),
    };
  });

  return (
    <>
      {mapping.map((item, i) => (
        <div key={i} {...stylex.props(website.site)}>
          <Sitemap page={item} />
        </div>
      ))}
    </>
  );
}
