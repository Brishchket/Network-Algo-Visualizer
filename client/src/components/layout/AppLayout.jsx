import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function AppLayout({
  children,
  onShare = null,
  showRun = false,
  onRun = null
}) {
  return (
    <div className="flex h-screen bg-[#0d1117] overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar onShare={onShare} showRun={showRun} onRun={onRun} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}