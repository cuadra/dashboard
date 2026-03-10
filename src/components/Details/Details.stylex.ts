import * as stylex from "@stylexjs/stylex";
export const details = stylex.create({
  details: {
    padding: "10px 15px",
    ":nth-child(even)": {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
    },
  },

  summary: {
    cursor: "pointer",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    listStyle: "none",
    "::-webkit-details-marker": {
      display: "none",
    },
  },
  list: {
    margin: 0,
    padding: "0 0 0 10px",
    color: "rgba(255, 255, 255, 0.3)",
    fontSize: "14px",
    letterSpacing: "0.5px",
    listStyle: "none",
    borderLeftWidth: "1px",
    borderLeftStyle: "solid",
    borderLeftColor: "rgba(255, 255, 255, 0.1)",
  },
  li: {},
});
