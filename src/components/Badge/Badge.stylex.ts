import * as stylex from "@stylexjs/stylex";
import { colors } from "@/src/styles/tokens/index.stylex";

export default stylex.create({
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
