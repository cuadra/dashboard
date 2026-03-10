import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  graph: {
    margin: "40px 0",
  },
  labelContainer: (barColor) => ({
    "@media (min-width:769px)": {
      padding: "0 10px",
      width: "10%",
      textAlign: "right",
    },
    height: "22px",
    color: "grey",
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
    borderTopLeftRadius: "4px",
    borderBottomLeftRadius: "4px",
    overflow: "hidden",
    opacity: 0.6,
  }),
  label: {
    width: "100%",
    fontSize: "14px",

    "@media (min-width:769px)": {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
  },
  container: {
    display: "flex",
    flexDirection: "column",
  },
  row: {
    marginBottom: "10px",
    "@media (min-width:769px)": {
      display: "flex",
      alignItems: "center",
    },
  },
  barContainer: (barBackgroundColor) => ({
    width: "100%",
    color: "#003366",
    height: "22px",
    display: "flex",
    backgroundColor: barBackgroundColor,
    borderRadius: "4px",
    borderTopLeftRadius: "0",
    borderBottomLeftRadius: "0",
    overflow: "hidden",
  }),
  bar: (width: string, tip: string, barColor, align) => ({
    width: width,
    height: "4px",
    display: "flex",
    justifyContent: align,
    backgroundColor: barColor,
    "::after": {
      padding: "0 5px",
      color: "rgba(255,255,255,.2)",
      content: `"${tip}"`,
      display: "block",
      fontSize: "11px",
      position: "relative",
      top: "5px",
      fontStyle: "italic",

      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
  }),
});

interface Bar {
  xLabel: string;
  yLabel: string;
  value: number;
  tip: string;
}

interface BarChartProps {
  horizontal?: boolean;
  data: Bar[];
  barColor: string;
  barBackgroundColor: string;
}

export default ({
  horizontal = false,
  data,
  barColor,
  barBackgroundColor,
}: BarChartProps) => {
  return (
    <div {...stylex.props(styles.graph)}>
      <div {...stylex.props(styles.container)}>
        {data.map((bar, i) => (
          <div key={i} {...stylex.props(styles.row)}>
            <div
              title={bar.xLabel}
              {...stylex.props(styles.labelContainer(barColor))}
            >
              <div {...stylex.props(styles.label)}>{bar.xLabel}</div>
            </div>
            <div {...stylex.props(styles.barContainer(barBackgroundColor))}>
              <div
                title={`${bar.tip} Instances`}
                {...stylex.props(
                  styles.bar(
                    `${bar.value}%`,
                    bar.tip,
                    barColor,
                    bar.value > 6 ? "flex-end" : "flex-start",
                  ),
                )}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
