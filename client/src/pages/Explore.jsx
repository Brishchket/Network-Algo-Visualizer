import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Network, Play } from "lucide-react";
import { getPublicTopologies } from "../api/topology.api";
import AppLayout from "../components/layout/AppLayout";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

export default function Explore() {
  const navigate = useNavigate();
  const [topologies, setTopologies] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getPublicTopologies()
      .then((res) => {
        setTopologies(res.data.data);
        setFiltered(res.data.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(topologies);
    } else {
      setFiltered(
        topologies.filter((t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.description?.toLowerCase().includes(search.toLowerCase()) ||
          t.owner?.username?.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, topologies]);

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#e6edf3]">Explore</h2>
          <p className="text-[#8b949e] text-sm mt-1">
            Discover public topologies shared by the community
          </p>
        </div>

        {/* search */}
        <div className="relative mb-6 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]" />
          <input
            type="text"
            placeholder="Search topologies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-[#161b22] border border-[#30363d] text-[#e6edf3] placeholder-[#8b949e] rounded-md outline-none focus:border-[#00bcd4] transition-colors"
          />
        </div>

        {isLoading ? (
          <p className="text-[#8b949e] text-sm">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="bg-[#161b22] border border-dashed border-[#30363d] rounded-lg p-12 text-center">
            <Network size={32} className="text-[#30363d] mx-auto mb-3" />
            <p className="text-[#8b949e] text-sm">
              {search ? "No topologies match your search" : "No public topologies yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((t) => (
              <div
                key={t._id}
                className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex flex-col gap-3 hover:border-[#00bcd4]/50 transition-colors"
              >
                {/* mini graph preview */}
                <div className="h-24 bg-[#0d1117] rounded-md overflow-hidden">
                  <svg width="100%" height="100%" viewBox="0 0 200 96">
                    {t.edges?.map((e) => {
                      const from = t.nodes?.find((n) => n.id === e.from);
                      const to = t.nodes?.find((n) => n.id === e.to);
                      if (!from || !to) return null;
                      const scaleX = (x) => (x / 600) * 180 + 10;
                      const scaleY = (y) => (y / 400) * 76 + 10;
                      return (
                        <line
                          key={`${e.from}-${e.to}`}
                          x1={scaleX(from.x)} y1={scaleY(from.y)}
                          x2={scaleX(to.x)} y2={scaleY(to.y)}
                          stroke="#30363d" strokeWidth="1.5"
                        />
                      );
                    })}
                    {t.nodes?.map((n) => {
                      const scaleX = (x) => (x / 600) * 180 + 10;
                      const scaleY = (y) => (y / 400) * 76 + 10;
                      return (
                        <circle
                          key={n.id}
                          cx={scaleX(n.x)} cy={scaleY(n.y)}
                          r="8" fill="#1c2128" stroke="#00bcd4" strokeWidth="1.5"
                        />
                      );
                    })}
                  </svg>
                </div>

                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-semibold text-[#e6edf3] truncate flex-1">{t.name}</h4>
                  <Badge variant="cyan" className="ml-2 flex-shrink-0">public</Badge>
                </div>

                {t.description && (
                  <p className="text-xs text-[#8b949e] line-clamp-2">{t.description}</p>
                )}

                <div className="flex items-center justify-between text-xs text-[#8b949e]">
                  <span>{t.nodes?.length} nodes · {t.edges?.length} edges</span>
                  <span>by {t.owner?.username}</span>
                </div>

                <Button
                  size="sm"
                  icon={Play}
                  fullWidth
                  onClick={() => navigate(`/run/${t._id}`)}
                >
                  Run Algorithm
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}