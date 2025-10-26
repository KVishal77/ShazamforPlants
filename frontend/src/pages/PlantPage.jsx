import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import placeholder from "../assets/placeholder.png";
import { getPlantById } from "../api/plantAPI";

function PlantPage() {
  const { id } = useParams();
  const [plant, setPlant] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPlantById(id); // GET /api/plant/:id
        setPlant(data);
      } catch (e) {
        console.error("Error loading plant:", e);
        setError("Failed to load plant");
      }
    };
    load();
  }, [id]);

  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;
  if (!plant) return <p className="text-center mt-10 text-gray-500">Loading plant info...</p>;

  const img =
    plant.image_url || plant.image || "https://via.placeholder.com/600x300?text=No+Image";

  return (
    <div className="min-h-screen bg-green-50 p-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden mb-24">
        <img
          src={img}
          alt={plant.name}
          className="w-full h-64 object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = placeholder;
          }}
        />
        <div className="p-6">
          <h1 className="text-3xl font-bold text-green-700 mb-2">{plant.name}</h1>
          {plant.scientific_name ? (
            <p className="italic text-gray-600 mb-4">{plant.scientific_name}</p>
          ) : null}

          <div className="space-y-2 text-gray-700 text-base leading-relaxed">
            <p><strong>Sunlight:</strong> {plant.sunlight || "-"}</p>
            <p><strong>Watering:</strong> {plant.watering || "-"}</p>
            <p><strong>Soil:</strong> {plant.soil || "-"}</p>
            <p><strong>Seasonality:</strong> {plant.seasonality || "-"}</p>
            <p><strong>Uses / Notes:</strong> {plant.uses_notes || "-"}</p>
          </div>

          {plant.qr_code && (
            <div className="mt-6 text-center">
              <p className="text-green-600 font-medium mb-2">QR Code for this plant</p>
              <img src={plant.qr_code} alt="QR Code" className="w-32 h-32 mx-auto" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlantPage;