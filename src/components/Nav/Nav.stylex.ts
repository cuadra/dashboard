import * as stylex from "@stylexjs/stylex";
import { colors } from "@/src/styles/tokens/index.stylex";
export const nav = stylex.create({
  navigation: {
    margin: "0 auto",
    height: "50px",
    display: "flex",
    justifyContent: "center",
    backgroundColor: "orange",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  container: {
    gap: 20,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  link: {
    width: "25%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  navigation1: {
    backgroundColor: "#037bfc",
  },
  navigation2: {
    backgroundColor: "#8809ab",
  },
  navigation3: {
    backgroundColor: "#09ab4f",
  },
  navigation4: {
    backgroundColor: "#fc5e03",
  },
});
