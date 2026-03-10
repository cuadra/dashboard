import * as stylex from "@stylexjs/stylex";
export default stylex.create({
  h1: {
    margin: "clamp(40px, 10vw, 100px) 0",
    fontSize: "clamp(16px, 10vw, 70px)",
    fontWeight: 200,
    textAlign: "center",
  },
  h2: {
    margin: 0,
    padding: 0,
    fontSize: "clamp(16px, 8vw, 60px)",
    fontWeight: 200,
    textAlign: "center",
  },
});
