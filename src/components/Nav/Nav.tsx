"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AppWindow, Settings, Bug, House } from "lucide-react";
import * as stylex from "@stylexjs/stylex";
import { nav } from "./Nav.stylex";
export default () => {
  const pathname = usePathname();

  const activeHomeLink = pathname === "/" ? nav.homeActive : null;

  const activeWebsitesLink =
    pathname === "/websites" ? nav.websitesActive : null;

  const activeComponentsLink =
    pathname === "/components" ? nav.componentsActive : null;

  const activeBugsLink = pathname === "/bugs" ? nav.bugsActive : null;

  const activeNavStyle = new Map();
  activeNavStyle.set("/", nav.navigation1);
  activeNavStyle.set("/components", nav.navigation2);
  activeNavStyle.set("/websites", nav.navigation3);

  return (
    <nav {...stylex.props(nav.navigation, activeNavStyle.get(pathname))}>
      <Link
        {...stylex.props(nav.link, activeHomeLink)}
        href="/"
        aria-label="Overview"
      >
        <House />
      </Link>
      <Link
        {...stylex.props(nav.link, activeComponentsLink)}
        href="/components"
        aria-label="Components"
      >
        <Settings />
      </Link>
      <Link
        {...stylex.props(nav.link, activeWebsitesLink)}
        href="/websites"
        aria-label="Websites"
      >
        <AppWindow />
      </Link>
      <Link
        {...stylex.props(nav.link, activeBugsLink)}
        href="#"
        aria-label="Errors"
      >
        <Bug />
      </Link>
    </nav>
  );
};
