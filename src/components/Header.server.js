import { Link } from "react-router-dom";

export function Header() {
  return (
    <header
      data-x="test"
      accessKey="test"
      style={{
        backgroundColor: "rgb(239, 239, 239)",
        padding: 10,
        marginBottom: 50,
        borderBottom: "1px solid rgb(0, 0, 0)",
      }}
    >
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
    </header>
  );
}
