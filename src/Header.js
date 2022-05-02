import noHydrate from "./noHydration";

export const Header = noHydrate(
  import("./components/Header.server").then((mod) => ({
    default: mod.Header,
  }))
);

// export { Header } from "./Header.server";
