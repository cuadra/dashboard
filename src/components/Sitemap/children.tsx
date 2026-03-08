import * as stylex from "@stylexjs/stylex";
import { TChildren } from "./sitemap.types";
import Page from "./page";

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

export default ({ children }: { children: TChildren }) => {
  return (
    <div {...stylex.props(box.children)}>
      {children.map((child, i) => (
        <Page key={i} page={child} />
      ))}
    </div>
  );
};
