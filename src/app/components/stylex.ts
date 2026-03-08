import * as stylex from "@stylexjs/stylex";

export const container = stylex.create({
  container: {
    marginTop: 30,
    display: "flex",
    gap: 25,
    flexWrap: "wrap",
    justifyContent: "space-evenly",
  },
});

export const list = stylex.create({
  item: {
    margin: "5px 0",
    width: "45%",
  },
  title: {
    paddingRight: 20,
    width: "100%",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    textAlign: "left",
    overflow: "hidden",
  },
  definition: {
    marginLeft: 0,
  },
});
