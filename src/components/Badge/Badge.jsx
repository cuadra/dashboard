import * as stylex from "@stylexjs/stylex";
import badgeStyles from "./Badge.stylex";

export default function Badge({ v: number }) {
  return <span {...stylex.props(badgeStyles.default)}>{number}</span>;
}
