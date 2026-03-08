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
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
  },
  nowrap: {
    ":not(:hover)": {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
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
  sticky: {
    position: "sticky",
    top: 20,
    alignSelf: "flex-start",
  },
});

export default ({ page }: { page: TPage }) => {
  return (
    <div {...stylex.props(box.page)}>
      <div {...stylex.props(box.sized)}>
        <div {...stylex.props(box.nowrap, box.sticky)}>
          {page.url}
          <br />
          {page.totalComponents && `Total Components: ${page.totalComponents}`}
          <br />
          {page.instances && `Instances: ${page.instances}`}
          <br />
          {page.clientlib && `Clientlib: ${page.clientlib}`}
          <br />
          {page.token && `Token: ${page.token.replace("gsk-", "")}`}
          <br />
          {page.lastModified &&
            `Last Modified: ${new Date(page.lastModified).toLocaleString()}`}
        </div>
      </div>
      {page.children && page.children.length > 0 && (
        <Children children={page.children} />
      )}
    </div>
  );
};
