import React from 'react';
import useGetPendingStudents from '@hooks/users/useGetPendingStudents.jsx';
import '@styles/users.css';

const AdminRequests = () => {
  const { students, loading, error, approveStudent, rejectStudent } = useGetPendingStudents();

  const handleApprove = async (id) => {
    await approveStudent(id);
    alert('Solicitud aprobada');
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Ingrese el motivo de rechazo:');
    if (!reason) return alert('Debe indicar un motivo para rechazar');
    await rejectStudent(id, reason);
    alert('Solicitud rechazada');
  };

  if (loading) return <p>Cargando solicitudes...</p>;
  if (error) return <p>Error al cargar: {error.message || JSON.stringify(error)}</p>;

  return (
    <div className='main-container'>
      <h1>Solicitudes de registro pendientes</h1>
      {students.length === 0 ? (
        <p>No hay solicitudes pendientes</p>
      ) : (
        <table className='table-default'>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>RUT</th>
              <th>Creado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id}>
                <td>{s.nombreCompleto}</td>
                <td>{s.email}</td>
                <td>{s.rut}</td>
                <td>{new Date(s.createdAt).toLocaleString()}</td>
                <td>
                  <button onClick={() => handleApprove(s.id)}>Aprobar</button>
                  <button onClick={() => handleReject(s.id)}>Rechazar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminRequests;
