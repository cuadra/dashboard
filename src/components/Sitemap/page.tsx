import * as stylex from "@stylexjs/stylex";
import { TPage } from "./sitemap.types";
import Children from "./children";
const box = stylex.create({
  default: {},
  sized: {
    padding: 20,
    width: 200,
    fontSize: 12,
    display: "flex",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
  },
  nowrap: {
    width: "100%",
  },
  page: {
    gap: 30,
    display: "flex",
    color: "rgba(255, 255, 255, 0.5)",
  },
  children: {
    gap: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  sticky: {
    position: "sticky",
    top: 70,
    alignSelf: "flex-start",
  },
  details: {
    marginTop: 10,
    display: "block",
  },
  link: {
    maxWidth: "100%",
    display: "inline-block",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    textDecoration: "none",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
});

export default ({ page }: { page: TPage }) => {
  return (
    <div {...stylex.props(box.page)}>
      <div {...stylex.props(box.sized)}>
        <div {...stylex.props(box.nowrap, box.sticky)}>
          <a
            {...stylex.props(box.link)}
            href={page.fullUrl}
            target="_blank"
            title="Open in new tab"
          >
            {page.url}
          </a>
          {page.totalComponents && (
            <div {...stylex.props(box.details)}>
              Total Components: <br />
              {page.totalComponents}
            </div>
          )}
          {page.instances && (
            <div {...stylex.props(box.details)}>
              Instances: <br />
              {page.instances}
            </div>
          )}
          {page.clientlib && (
            <div {...stylex.props(box.details)}>
              Clientlib: <br />
              {page.clientlib}
            </div>
          )}
          {page.token && (
            <div {...stylex.props(box.details)}>
              Token:
              <br /> {page.token.replace("gsk-", "")}
            </div>
          )}
          {page.lastModified && (
            <div {...stylex.props(box.details)}>
              Last Modified: <br />
              {new Date(page.lastModified).toLocaleString()}
            </div>
          )}
        </div>
      </div>
      {page.children && page.children.length > 0 && (
        <Children children={page.children} />
      )}
    </div>
  );
};
