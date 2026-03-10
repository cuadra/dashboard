import json from "@/src/data/2026-03-10/errors.json";
import * as stylex from "@stylexjs/stylex";
import Details from "@/src/components/Details/Details";
import typography from "@/src/styles/typography";

export default function Bugs() {
  const errorMessages = json.errorMessages as Record<string, string[]>;

  return (
    <>
      <header>
        <h1 {...stylex.props(typography.default, typography.h1)}>Bugs</h1>
      </header>

      {Object.entries(errorMessages).map(([url, errors]) => (
        <Details key={url} url={url} errors={errors} />
      ))}
    </>
  );
}
