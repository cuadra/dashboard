import websites from "@/src/data/2026-03-10/websites.json";
import * as stylex from "@stylexjs/stylex";
import Sitemap from "@/src/components/Sitemap/page";
import { TPage, TChildren } from "@/src/components/Sitemap/sitemap.types";
import typography from "@/src/styles/typography";
export default async function Home({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const { status = "all" } = searchParams ?? {};

  void status;

  const website = stylex.create({
    site: {
      margin: "50px 0",
      width: "100%",
      overflow: "clip",
    },
    hideMobile: {
      "@media (max-width: 767px)": {
        display: "none",
      },
    },
  });

  function buildSitemap(urls: string[]): TChildren {
    const root: TPage = {
      url: "/",
      children: [],
      fullUrl: "",
    };
    for (const fullUrl of urls) {
      const path = new URL(fullUrl).pathname.replace(/^\/|\/$/g, "");
      const segments = path ? path.split("/") : [];

      let current: TPage = root;
      let currentPath = "";

      for (const segment of segments) {
        //currentPath += `/${segment}/`;
        currentPath = `${segment}/`;

        let child = current.children.find((c) => c.url === currentPath);

        if (!child) {
          child = {
            url: currentPath,
            children: [],
            fullUrl: fullUrl,
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
      children: buildSitemap(website.pages),
      fullUrl: "",
    };
  });

  const inbox = stylex.create({
    container: {
      padding: 0,
      "@media (min-width: 768px)": {
        display: "flex",
        gap: "16px",
      },
      ":nth-child(even)": {
        "@media (min-width: 768px)": {
          backgroundColor: "rgba(255, 255, 255, 0.05)",
        },
      },
    },
    details: {
      margin: 0,
      padding: 0,
      marginInlineStart: 0,
      display: "inline-block",
      "@media (min-width: 768px)": {
        display: "none",
      },
    },
    definition: {
      margin: 0,
      "@media (min-width: 768px)": {
        padding: 10,
      },
    },
    domain: {
      "@media (min-width: 768px)": {
        padding: 10,
      },
      flexGrow: 1,
    },

    clientlib: {
      "@media (min-width: 768px)": {
        width: "7%",
      },
    },
    components: {
      "@media (min-width: 768px)": {
        width: "10%",
      },
    },
    instances: {
      "@media (min-width: 768px)": {
        width: "10%",
      },
    },
    token: {
      "@media (min-width: 768px)": {
        width: "25%",
      },
    },
    modified: {
      "@media (min-width: 768px)": {
        width: "15%",
      },
    },
    hideMobile: {
      "@media (max-width: 767px)": {
        display: "none",
      },
    },
  });

  return (
    <>
      <header>
        <h1 {...stylex.props(typography.default, typography.h1)}>Websites</h1>
      </header>
      <dl {...stylex.props(inbox.container, inbox.hideMobile)}>
        <dt {...stylex.props(inbox.domain)}>Domain</dt>
        <dd {...stylex.props(inbox.definition, inbox.clientlib)}>
          <span {...stylex.props()}>Clientlib:</span>
        </dd>
        <dd {...stylex.props(inbox.definition, inbox.token)}>
          <span {...stylex.props()}>Token:</span>
        </dd>
        <dd {...stylex.props(inbox.definition, inbox.components)}>
          <span {...stylex.props()}>Components:</span>
        </dd>
        <dd {...stylex.props(inbox.definition, inbox.instances)}>
          <span {...stylex.props()}>Instances:</span>
        </dd>
        <dd {...stylex.props(inbox.definition, inbox.modified)}>
          <span {...stylex.props()}>Last Modified: </span>
        </dd>
      </dl>

      {websites.websites.map((item, i) => (
        <dl key={i} {...stylex.props(inbox.container)}>
          <dt {...stylex.props(inbox.domain)}>{item.domain}</dt>
          <dd {...stylex.props(inbox.definition, inbox.clientlib)}>
            <span {...stylex.props(inbox.details)}>Clientlib:</span>{" "}
            {item.clientlib}
          </dd>
          <dd {...stylex.props(inbox.definition, inbox.token)}>
            <span {...stylex.props(inbox.details)}>Token:</span>{" "}
            {item.designToken}
          </dd>
          <dd {...stylex.props(inbox.definition, inbox.components)}>
            <span {...stylex.props(inbox.details)}>Total components:</span>{" "}
            {item.componentCount}
          </dd>
          <dd {...stylex.props(inbox.definition, inbox.instances)}>
            <span {...stylex.props(inbox.details)}>Instances:</span>{" "}
            {item.totalInstances}
          </dd>
          <dd {...stylex.props(inbox.definition, inbox.modified)}>
            <span {...stylex.props(inbox.details)}>Last Modified: </span>
            {new Date(item.lastModified).toLocaleString("en-US", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </dd>
        </dl>
      ))}
      <br />
      <br />
      <div {...stylex.props(website.hideMobile)}>
        <header>
          <h1 {...stylex.props(typography.default, typography.h1)}>Sitemaps</h1>
        </header>
        {mapping.map((item, i) => (
          <div key={i} {...stylex.props(website.site)}>
            <h2>{item.url}</h2>
            <Sitemap page={item} />
          </div>
        ))}
      </div>
    </>
  );
}
