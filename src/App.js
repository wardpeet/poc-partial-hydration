import { createElement, Suspense, lazy } from "react";
import { Header } from "./Header";
import { Routes, Route, Link } from "react-router-dom";

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

      <footer>
        <p>with hydration</p>
        <nav>
          <ul>
            <li>
              <Link to="/">Page 1</Link>
            </li>
            <li>
              <Link to="/page-2/">Page 2</Link>
            </li>
          </ul>
        </nav>
      </footer>
    </div>
  );
}
