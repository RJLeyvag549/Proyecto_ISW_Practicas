import { useEffect, useState } from "react";
import Table from '@components/Table.jsx';
import api from '@services/root.service.js';
import '@styles/internship.css'; // nuevo archivo CSS para esta página

export default function OfertasPage() {
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(""); // Estado para la búsqueda

  const columns = [
    { title: "ID", field: "id", width: 100 },
    { title: "Título", field: "title", width: 400 },
    { title: "Descripción", field: "description", width: 400 },
    { title: "Cupos", field: "availableSlots", hozAlign: "center", width: 100 },
    { title: "Especialidad", field: "specialtyArea", width: 300 },
  ];

  const fetchOfertas = async () => {
    try {
      setLoading(true);
      const response = await api.get("/internships");
      console.log("Array real de prácticas:", response.data.data);
      setOfertas(response.data.data);
    } catch (error) {
      console.error("Error al obtener ofertas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfertas();
  }, []);

  if (loading) return <p>Cargando ofertas...</p>;

  return (
    <div className="page-container">
      <div className="top-table">
        <h2>Ofertas de Práctica</h2>
        <div className="filter-actions">
          <input
            type="text"
            placeholder="Buscar..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <Table
        data={ofertas}
        columns={columns}
        initialSortName="id"
        filter={filter} 
        dataToFilter={["id", "title", "description", "availableSlots", "specialtyArea"]}
      />
    </div>
  );
}
