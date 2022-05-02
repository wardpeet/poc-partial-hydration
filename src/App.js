import { createElement, Suspense, lazy } from "react";
import { Header } from "./Header";
import { Routes, Route } from "react-router-dom";

export function App() {
  return (
    <div className="App">
      <Header />

      <main>
        <Routes>
          <Route
            path="/"
            element={
              <Suspense fallback={<>...</>}>
                {createElement(lazy(() => import("./routes/index")))}
              </Suspense>
            }
          />
          <Route
            path="/page-2/"
            element={
              <Suspense fallback={<>...</>}>
                {createElement(lazy(() => import("./routes/page2")))}
              </Suspense>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
