import * as stylex from "@stylexjs/stylex";
import { colors } from "@/src/styles/tokens/index.stylex";

export const card = stylex.create({
  default: {
    width: {
      "@media (min-width: 768px)": "40%",
      "@media (min-width: 1200px)": "20%",
    },

    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
    flexGrow: 1,
  },
  container: {
    marginTop: 30,
    display: "flex",
    gap: 25,
    flexWrap: "wrap",
    justifyContent: "space-evenly",
  },
  background: {
    height: "100%",
    backgroundColor: colors.secondary,
    borderRadius: 8,
    position: "relative",
    zIndex: 1,
    overflow: "hidden",
  },
  listContainer: {
    padding: 16,
    display: "flex",
    flexWrap: "wrap",
    gap: "10%",
  },
});

export const fonts = stylex.create({
  title: {
    margin: "0",
    padding: 16,
    color: "white",
    fontSize: "18px",
    fontWeight: 200,
    backgroundColor: colors.accent,
  },
  description: {
    marginTop: "20px",
    marginBottom: "10px",
    fontSize: 14,
    display: "block",
    fontWeight: 600,
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.2)",
  },
});
export const notification = stylex.create({
  default: {
    marginLeft: 8,
    padding: "2px 6px",
    fontSize: 12,
    fontWeight: 600,
    backgroundColor: colors.primary,
    borderRadius: 4,
    color: "#eee",
    position: "relative",
    top: -10,
  },
});
