import { createElement, lazy, Suspense, useRef, memo, useId } from "react";

export default function noHydrate(lazyImport) {
  return memo(function NoHydrationBoundary({ fallback = <></>, ...props }) {
    const id = useId();
    const lazyRef = useRef(
      lazy(() => {
        if (typeof window === "undefined") {
          return lazyImport;
        }

        return import("./attributes").then(({ possibleStandardNames }) => {
          const script = document.getElementById(`hydration-${id}`);
          const prevElement = script.previousSibling;

          let attributes = {};
          for (let i = 0; i < prevElement.attributes.length; i++) {
            const { name, value } = prevElement.attributes[i];
            if (name === "style") {
              const styleMap = {};
              prevElement
                .getAttribute("style")
                .split(";")
                .forEach((rule) => {
                  const [key, value] = rule.split(":");
                  styleMap[
                    key.replace(/-([a-z])/g, function (g) {
                      return g[1].toUpperCase();
                    })
                  ] = value;
                });

              attributes.style = styleMap;
            } else {
              if (possibleStandardNames[name]) {
                attributes[possibleStandardNames[name]] = value;
              } else {
                attributes[name] = value;
              }
            }
          }

          console.log({ attributes });

          return {
            default: () =>
              createElement(script.previousSibling.tagName.toLowerCase(), {
                dangerouslySetInnerHTML: {
                  __html: script.previousSibling.innerHTML,
                },
                ...attributes,
              }),
          };
        });
      })
    );

    return (
      <Suspense fallback={fallback}>
        {createElement(lazyRef.current, props)}
        <script
          type="text/gatsby"
          id={`hydration-${id}`}
          dangerouslySetInnerHTML={{ __html: "" }}
        />
      </Suspense>
    );
  });
}
