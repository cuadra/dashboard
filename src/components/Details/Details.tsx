import * as stylex from "@stylexjs/stylex";
import { details } from "./Details.stylex";

export default ({ url, errors }: { url: string; errors: string[] }) => {
  return (
    <details key={url} open {...stylex.props(details.details)}>
      <summary {...stylex.props(details.summary)}>{url}</summary>
      <ul {...stylex.props(details.list)}>
        {errors.map((error, index) => (
          <li key={`${url}-${index}`}>{error}</li>
        ))}
      </ul>
    </details>
  );
};
