import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  item: {
    padding: 8,
    color: "#CCC",
    fontSize: 12,
    backgroundColor: "#333",
    borderRadius: 13,
    whiteSpace: "nowrap",
    opacity: 0.3,
  },
  container: {
    gap: 8,
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
  },
});

interface Props {
  list: string[];
}

export default ({ list }: Props) => {
  return (
    <div {...stylex.props(styles.container)}>
      {list.map((comp, i) => (
        <div key={i} {...stylex.props(styles.item)}>
          {comp}
        </div>
      ))}
    </div>
  );
};
