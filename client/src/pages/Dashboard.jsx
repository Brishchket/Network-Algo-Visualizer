import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Play, Pencil, Trash2, Clock, Network } from "lucide-react";
import useAuthStore from "../store/authStore";
import { getMyTopologies, deleteTopology } from "../api/topology.api";
import { getMyRuns } from "../api/run.api";
import AppLayout from "../components/layout/AppLayout";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [topologies, setTopologies] = useState([]);
  const [runs, setRuns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topoRes, runRes] = await Promise.all([
          getMyTopologies(),
          getMyRuns()
        ]);
        setTopologies(topoRes.data.data);
        setRuns(runRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this topology?")) return;
    try {
      await deleteTopology(id);
      setTopologies(topologies.filter((t) => t._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">

        {/* welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#e6edf3]">
            Welcome back, <span className="text-[#00bcd4]">{user?.username}</span>
          </h2>
          <p className="text-[#8b949e] text-sm mt-1">
            Your network algorithm workspace
          </p>
        </div>

        {/* stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Topologies", value: topologies.length, icon: Network, color: "text-[#00bcd4]" },
            { label: "Algorithm Runs", value: runs.length, icon: Play, color: "text-[#3b82f6]" },
            { label: "Public Topologies", value: topologies.filter(t => t.isPublic).length, icon: Clock, color: "text-[#238636]" }
          ].map((stat) => (
            <div key={stat.label} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex items-center gap-4">
              <div className={`${stat.color} bg-current/10 p-2 rounded-md`}>
                <stat.icon size={18} className={stat.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#e6edf3]">{stat.value}</p>
                <p className="text-xs text-[#8b949e]">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* topologies */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[#e6edf3]">My Topologies</h3>
            <Button size="sm" icon={Plus} onClick={() => navigate("/topology/new")}>
              New Topology
            </Button>
          </div>

          {isLoading ? (
            <div className="text-[#8b949e] text-sm">Loading...</div>
          ) : topologies.length === 0 ? (
            <div className="bg-[#161b22] border border-dashed border-[#30363d] rounded-lg p-12 text-center">
              <Network size={32} className="text-[#30363d] mx-auto mb-3" />
              <p className="text-[#8b949e] text-sm">No topologies yet</p>
              <p className="text-[#8b949e] text-xs mt-1 mb-4">Create one to get started</p>
              <Button size="sm" icon={Plus} onClick={() => navigate("/topology/new")}>
                Create Topology
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {topologies.map((t) => (
                <div
                  key={t._id}
                  className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex flex-col gap-3 hover:border-[#00bcd4]/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-semibold text-[#e6edf3] truncate flex-1">{t.name}</h4>
                    <Badge variant={t.isPublic ? "cyan" : "gray"} className="ml-2 flex-shrink-0">
                      {t.isPublic ? "public" : "private"}
                    </Badge>
                  </div>

                  {t.description && (
                    <p className="text-xs text-[#8b949e] line-clamp-2">{t.description}</p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-[#8b949e]">
                    <span>{t.nodes.length} nodes</span>
                    <span>·</span>
                    <span>{t.edges.length} edges</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-[#30363d]">
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Pencil}
                      onClick={() => navigate(`/topology/${t._id}`)}
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      icon={Play}
                      onClick={() => navigate(`/run/${t._id}`)}
                      className="flex-1"
                    >
                      Run
                    </Button>
                    <button
                      onClick={() => handleDelete(t._id)}
                      className="p-1.5 text-[#8b949e] hover:text-[#da3633] transition-colors rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* run history */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[#e6edf3]">Run History</h3>
            <Button size="sm" variant="outline" onClick={() => navigate("/race")}>
              Compare Algorithms
            </Button>
          </div>

          {isLoading ? (
            <div className="text-[#8b949e] text-sm">Loading...</div>
          ) : runs.length === 0 ? (
            <div className="bg-[#161b22] border border-dashed border-[#30363d] rounded-lg p-8 text-center">
              <p className="text-[#8b949e] text-sm">No runs yet</p>
              <p className="text-[#8b949e] text-xs mt-1">Run an algorithm on a topology to see history</p>
            </div>
          ) : (
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#30363d]">
                    <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase tracking-wide">Algorithm</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase tracking-wide">Topology</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase tracking-wide">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase tracking-wide">Steps</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((r, i) => (
                    <tr
                      key={r._id}
                      className={`border-b border-[#30363d] last:border-0 hover:bg-[#1c2128] transition-colors`}
                    >
                      <td className="px-5 py-3">
                        <Badge variant="blue">{r.algorithmType}</Badge>
                      </td>
                      <td className="px-5 py-3 text-sm text-[#e6edf3]">
                        {r.topology?.name || "Unknown"}
                      </td>
                      <td className="px-5 py-3 text-xs text-[#8b949e]">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 text-xs text-[#8b949e]">
                        {r.steps?.length || 0} steps
                      </td>
                      <td className="px-5 py-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={Play}
                          onClick={() => navigate(`/run/${r._id}`)}
                        >
                          Replay
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}