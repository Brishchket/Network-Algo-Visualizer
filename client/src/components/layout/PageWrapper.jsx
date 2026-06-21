import Navbar from "./Navbar";
import "./PageWrapper.css";

export default function PageWrapper({ children }) {
  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content">
        {children}
      </main>
    </div>
  );
}