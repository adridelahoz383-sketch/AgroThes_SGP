import { BrowserRouter } from "react-router-dom";
import AppShell from "./components/layout/AppShell.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
