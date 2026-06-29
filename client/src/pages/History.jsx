import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Trash2, Share2, Clock } from "lucide-react";
import { getMyRuns, deleteRun } from "../api/run.api";
import { generateShareLink } from "../api/share.api";
import AppLayout from "../components/layout/AppLayout";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

export default function History() {
  const navigate = useNavigate();
  const [runs, setRuns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shareToken, setShareToken] = useState(null);
  const [shareRunId, setShareRunId] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getMyRuns()
      .then((res) => setRuns(res.data.data))
      .finally(() => setIsLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this run?")) return;
    try {
      await deleteRun(id);
      setRuns(runs.filter((r) => r._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async (runId) => {
    try {
      const res = await generateShareLink({ resourceType: "Run", resourceId: runId });
      setShareToken(res.data.data.shareToken);
      setShareRunId(runId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/share/${shareToken}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categoryColor = {
    bfs: "blue", dfs: "blue", dijkstra: "blue", bellmanFord: "blue",
    prim: "green", kruskal: "green",
    distanceVector: "cyan", linkState: "cyan"
  };

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#e6edf3]">Run History</h2>
          <p className="text-[#8b949e] text-sm mt-1">All your past algorithm executions</p>
        </div>

        {isLoading ? (
          <p className="text-[#8b949e] text-sm">Loading...</p>
        ) : runs.length === 0 ? (
          <div className="bg-[#161b22] border border-dashed border-[#30363d] rounded-lg p-12 text-center">
            <Clock size={32} className="text-[#30363d] mx-auto mb-3" />
            <p className="text-[#8b949e] text-sm">No runs yet</p>
            <p className="text-[#8b949e] text-xs mt-1 mb-4">
              Run an algorithm on a topology to see history here
            </p>
            <Button size="sm" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#30363d]">
                  <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase tracking-wide">Algorithm</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase tracking-wide">Topology</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase tracking-wide">Start Node</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase tracking-wide">Steps</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase tracking-wide">Date</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r._id} className="border-b border-[#30363d] last:border-0 hover:bg-[#1c2128] transition-colors">
                    <td className="px-5 py-3">
                      <Badge variant={categoryColor[r.algorithmType] || "gray"}>
                        {r.algorithmType}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-sm text-[#e6edf3]">
                      {r.topology?.name || "Unknown"}
                    </td>
                    <td className="px-5 py-3 text-sm text-[#8b949e]">
                      {r.startNode || "—"}
                    </td>
                    <td className="px-5 py-3 text-sm text-[#8b949e]">
                      {r.steps?.length || 0}
                    </td>
                    <td className="px-5 py-3 text-xs text-[#8b949e]">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={Play}
                          onClick={() => navigate(`/run/${r.topology?._id}`)}
                        >
                          Replay
                        </Button>
                        <button
                          onClick={() => handleShare(r._id)}
                          className="p-1.5 text-[#8b949e] hover:text-[#00bcd4] transition-colors rounded"
                        >
                          <Share2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(r._id)}
                          className="p-1.5 text-[#8b949e] hover:text-[#da3633] transition-colors rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* share modal */}
        {shareToken && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShareToken(null)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="relative w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-xl p-6 flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-base font-semibold text-[#e6edf3]">Share this run</h3>
              <p className="text-xs text-[#8b949e]">Anyone with this link can replay this run read-only.</p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={`${window.location.origin}/share/${shareToken}`}
                  onFocus={(e) => e.target.select()}
                  className="flex-1 px-3 py-2 text-xs bg-[#1c2128] border border-[#30363d] text-[#00bcd4] rounded-md outline-none font-mono"
                />
                <Button size="sm" onClick={handleCopy}>
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShareToken(null)} className="self-end">
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}