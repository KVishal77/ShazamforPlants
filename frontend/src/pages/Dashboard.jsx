// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import placeholder from "../assets/placeholder.png";
import { getPlants, deletePlant } from "../api/plantAPI"; // ✅ use API layer

const Dashboard = () => {
  const navigate = useNavigate();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        setLoading(true);
        const list = await getPlants(); // GET /api/plants
        setPlants(Array.isArray(list) ? list : []);
        setErr("");
      } catch (e) {
        console.error("Fetch plants error:", e);
        setErr("Failed to fetch plants");
      } finally {
        setLoading(false);
      }
    };
    fetchPlants();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!id) return;
    if (!window.confirm("Delete this plant?")) return;
    try {
      await deletePlant(id); // DELETE /api/plant/:id
      // refresh list without full page reload
      setPlants((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-800">Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/new")}
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded"
          >
            + Add Plant
          </button>
          <button
            onClick={() => window.location.reload()}
            className="border border-gray-300 px-3 py-2 rounded"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading plants...</div>
      ) : err ? (
        <div className="text-center py-12 text-red-600">{err}</div>
      ) : plants.length === 0 ? (
        <div className="text-center py-12 text-gray-600">No plants yet. Add one!</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {plants.map((p) => {
            // ✅ backend may return image_url or image
            const img = p.image_url || p.image || placeholder;
            // ✅ backend has created_at (timestamp) — show nicely if present
            const created = p.created_at
              ? new Date(p.created_at).toLocaleString()
              : "";

            return (
              <div
                key={p.id || p.createdAt || Math.random()}
                className="bg-white rounded-xl shadow p-4 hover:shadow-lg transition cursor-pointer"
                onClick={() => navigate(`/plant/${p.id || ""}`)}
              >
                <div className="w-full h-48 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                  <img
                    src={img}
                    alt={p.name || "Plant"}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = placeholder;
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="mt-3">
                  <h2 className="text-lg font-semibold text-green-700">
                    {p.name || "Unnamed"}
                  </h2>
                  {p.scientific_name ? (
                    <p className="italic text-sm text-gray-600">{p.scientific_name}</p>
                  ) : null}

                  <div className="mt-2 text-sm text-gray-700">
                    <p>
                      <strong>Watering:</strong> {p.watering || "-"}
                    </p>
                    <p>
                      <strong>Sunlight:</strong> {p.sunlight || "-"}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <small className="text-xs text-gray-500">{created}</small>
                    <button
                      onClick={(e) => handleDelete(e, p.id)}
                      className="text-xs text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;