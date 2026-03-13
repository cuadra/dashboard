"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AppWindow, Settings, Bug, House } from "lucide-react";
import * as stylex from "@stylexjs/stylex";
import { nav } from "./Nav.stylex";
export default ({
  user,
  pass,
}: {
  user: string | undefined;
  pass: string | undefined;
}) => {
  const pathname = usePathname();

  const activeNavStyle = new Map();
  activeNavStyle.set("/", nav.navigation1);
  activeNavStyle.set("/components", nav.navigation2);
  activeNavStyle.set("/websites", nav.navigation3);
  activeNavStyle.set("/bugs", nav.navigation4);

  return (
    <nav {...stylex.props(nav.navigation, activeNavStyle.get(pathname))}>
      <div {...stylex.props(nav.container)}>
        <Link
          {...stylex.props(nav.link)}
          href={`/?user=${user}&pass=${pass}`}
          aria-label="Overview"
        >
          <House />
        </Link>
        <Link
          {...stylex.props(nav.link)}
          href={`/components?user=${user}&pass=${pass}`}
          aria-label="Components"
        >
          <Settings />
        </Link>
        <Link
          {...stylex.props(nav.link)}
          href={`/websites?user=${user}&pass=${pass}`}
          aria-label="Websites"
        >
          <AppWindow />
        </Link>
        <Link
          {...stylex.props(nav.link)}
          href={`/bugs?user=${user}&pass=${pass}`}
          aria-label="Errors"
        >
          <Bug />
        </Link>
      </div>
    </nav>
  );
};
