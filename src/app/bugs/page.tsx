import json from "@/src/data/2026-03-09/errors.json";
import * as stylex from "@stylexjs/stylex";
import typography from "@/src/styles/typography";

export default function Bugs() {
  const errorMessages = json.errorMessages as Record<string, string[]>;

  return (
    <>
      <header>
        <h1 {...stylex.props(typography.default, typography.h1)}>Bugs</h1>
      </header>

      <ul>
        {Object.entries(errorMessages).map(([url, errors]) => (
          <li key={url}>
            <details open>
              <summary>{url}</summary>

              <ul>
                {errors.map((error, index) => (
                  <li key={`${url}-${index}`}>{error}</li>
                ))}
              </ul>
            </details>
          </li>
        ))}
      </ul>
    </>
  );
}
