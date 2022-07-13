import { createFromFetch } from "react-server-dom-webpack";
import { Suspense, lazy, unstable_getCacheForType } from "react";

function createResponseCache() {
  return new Map();
}

const cache = createResponseCache();
function useServerResponse(key) {
  let response = cache.get(key);
  if (response) {
    return response;
  }
  response = createFromFetch(fetch("/page-data" + key));
  cache.set(key, response);
  return response;
}

const HeaderServer = lazy(() =>
  import("./components/Header.server").then((mod) => ({
    default: mod.Header,
  }))
);

const HeaderClient = function HeaderClient() {
  const response = useServerResponse("/");

  console.log(response.readRoot());
  return response.readRoot();
};

export const Header = function Header() {
  if (typeof window === "undefined") {
    return (
      <Suspense fallback={null}>
        <HeaderServer />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={null}>
      <HeaderClient />
    </Suspense>
  );
};

// export { Header } from "./Header.server";
