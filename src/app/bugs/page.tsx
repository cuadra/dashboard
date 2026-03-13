import json from "@/src/data/2026-03-12/errors.json";
import * as stylex from "@stylexjs/stylex";
import Details from "@/src/components/Details/Details";
import typography from "@/src/styles/typography";

import Nav from "@/src/components/Nav/Nav";
export default async function Bugs({
  searchParams,
}: {
  searchParams: Promise<{ user?: string; pass?: string }>;
}) {
  const params = await searchParams;
  let isAuthenticated = false;
  if (
    params.user === process.env.USER_NAME &&
    params.pass === process.env.USER_PASSWORD
  ) {
    isAuthenticated = true;
  }

  const errorMessages = json.errorMessages as Record<string, string[]>;

  return (
    <>
      {isAuthenticated && (
        <>
          <Nav user={params.user} pass={params.pass} />
          <div className="container">
            <header>
              <h1 {...stylex.props(typography.default, typography.h1)}>Bugs</h1>
            </header>

            {Object.entries(errorMessages).map(([url, errors]) => (
              <Details key={url} url={url} errors={errors} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
