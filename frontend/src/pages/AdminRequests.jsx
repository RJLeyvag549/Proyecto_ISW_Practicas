import React from 'react';
import useGetPendingStudents from '@hooks/users/useGetPendingStudents.jsx';
import '@styles/users.css';
import Swal from 'sweetalert2';
import { showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert.js';

const AdminRequests = () => {
  const { students, loading, error, approveStudent, rejectStudent } = useGetPendingStudents();

  const handleApprove = async (id) => {
    await approveStudent(id);
    showSuccessAlert('Aprobado', 'La solicitud fue aprobada correctamente');
  };

  const handleReject = async (id) => {
    const { value: reason } = await Swal.fire({
      title: 'Rechazar solicitud',
      input: 'textarea',
      inputPlaceholder: 'Ingrese el motivo de rechazo...',
      showCancelButton: true,
      confirmButtonText: 'Rechazar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) return 'Debes indicar un motivo';
        return null;
      }
    });

    if (!reason) return;

    await rejectStudent(id, reason);
    showErrorAlert('Rechazado', 'La solicitud fue rechazada');
  };

  if (loading) return <p>Cargando solicitudes...</p>;
  if (error) return <p>Error al cargar: {error.message || JSON.stringify(error)}</p>;

  return (
    <div className='main-container'>
      <div className='top-table' style={{width: '100%', maxWidth: '1200px'}}>
        <h1 className='title-table'>Solicitudes de registro pendientes</h1>
      </div>
      {students.length === 0 ? (
        <p>No hay solicitudes pendientes</p>
      ) : (
        <div className='table-container'>
          <table className='table-default'>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>RUT</th>
                <th>Creado</th>
                <th style={{width: '160px'}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id}>
                    <td className='user-name' style={{cursor: 'pointer'}}>{s.nombreCompleto}</td>
                  <td>{s.email}</td>
                  <td>{s.rut}</td>
                  <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className='btn-approve' onClick={() => handleApprove(s.id)}>Aprobar</button>
                    <button className='btn-reject' onClick={() => handleReject(s.id)}>Rechazar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className='table-footer'>
            <div className='pagination'>
              <button className='page-btn'>Primero</button>
              <button className='page-btn'>Anterior</button>
              <button className='page-number active'>1</button>
              <button className='page-number'>2</button>
              <button className='page-btn'>Siguiente</button>
              <button className='page-btn'>Último</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRequests;
