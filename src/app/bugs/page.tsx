import json from "@/src/data/2026-03-09/errors.json";
import * as stylex from "@stylexjs/stylex";
import typography from "@/src/styles/typography";
export default function Bugs() {
  return (
    <>
      <header>
        <h1 {...stylex.props(typography.default, typography.h1)}>Bugs</h1>
      </header>

      <ul>
        {Object.keys(json.errorMessages).map((url, errors) => (
          <details key={url} open>
            <summary>{url}</summary>

            <ul>
              {json.errorMessages[url].map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </details>
        ))}
      </ul>
    </>
  );
}
