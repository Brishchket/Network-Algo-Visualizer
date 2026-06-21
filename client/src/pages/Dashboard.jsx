import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { getMyTopologies, deleteTopology } from "../api/topology.api";
import { getMyRuns } from "../api/run.api";
import PageWrapper from "../components/layout/PageWrapper";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import "./Dashboard.css";

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
    try {
      await deleteTopology(id);
      setTopologies(topologies.filter((t) => t._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PageWrapper>
      <div className="dashboard">
        <div className="dashboard-welcome">
          <h2><span className="green">~/</span>{user?.username}</h2>
          <p className="welcome-sub">// your network algorithm workspace</p>
        </div>

        {/* topologies section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3><span className="green">$</span> topologies</h3>
            <Button size="sm" onClick={() => navigate("/topology/new")}>
              + new
            </Button>
          </div>

          {isLoading ? (
            <p className="loading-text">loading...</p>
          ) : topologies.length === 0 ? (
            <div className="empty-state">
              <p>// no topologies yet</p>
              <p>create one to get started</p>
            </div>
          ) : (
            <div className="card-grid">
              {topologies.map((t) => (
                <Card key={t._id}>
                  <div className="card-top">
                    <h4 className="card-title">{t.name}</h4>
                    <span className={`badge ${t.isPublic ? "badge-green" : "badge-gray"}`}>
                      {t.isPublic ? "public" : "private"}
                    </span>
                  </div>
                  <p className="card-desc">{t.description || "// no description"}</p>
                  <p className="card-meta">
                    {t.nodes.length} nodes · {t.edges.length} edges
                  </p>
                  <div className="card-actions">
                    <Button size="sm" variant="secondary" onClick={() => navigate(`/topology/${t._id}`)}>
                      edit
                    </Button>
                    <Button size="sm" onClick={() => navigate(`/visualizer/${t._id}`)}>
                      run
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(t._id)}>
                      del
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* runs section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3><span className="green">$</span> run_history</h3>
            <Button size="sm" variant="secondary" onClick={() => navigate("/compare")}>
              compare
            </Button>
          </div>

          {isLoading ? (
            <p className="loading-text">loading...</p>
          ) : runs.length === 0 ? (
            <div className="empty-state">
              <p>// no runs yet</p>
              <p>run an algorithm on a topology to see history</p>
            </div>
          ) : (
            <div className="card-grid">
              {runs.map((r) => (
                <Card key={r._id}>
                  <div className="card-top">
                    <h4 className="card-title">{r.algorithmType}</h4>
                    <span className="badge badge-blue">completed</span>
                  </div>
                  <p className="card-desc">
                    topology: {r.topology?.name || "unknown"}
                  </p>
                  <p className="card-meta">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                  <div className="card-actions">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => navigate(`/visualizer/${r.topology?._id}`)}
                    >
                      replay
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}