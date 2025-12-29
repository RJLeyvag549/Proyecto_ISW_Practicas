import React from 'react';
import useGetPendingStudents from '@hooks/users/useGetPendingStudents.jsx';
import '@styles/users.css';
import Swal from 'sweetalert2';
import { showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert.js';

const AdminRequests = () => {
  const { students, loading, error, approveStudent, rejectStudent, getStudentDetail } = useGetPendingStudents();

  const handleApprove = async (id) => {
    const res = await approveStudent(id);
    if (res && res.status !== 'Error') showSuccessAlert('Aprobado', 'La solicitud fue aprobada correctamente');
    else showErrorAlert('Error', res?.message || 'No se pudo aprobar');
  };

  const handleReject = async (id, reason) => {
    const res = await rejectStudent(id, reason);
    if (res && res.status !== 'Error') showErrorAlert('Rechazado', 'La solicitud fue rechazada');
    else showErrorAlert('Error', res?.message || 'No se pudo rechazar');
  };

  const handleView = async (id) => {
    const student = await getStudentDetail(id);
    if (!student || student.status === 'Error') {
      showErrorAlert('Error', 'No se pudieron obtener los datos del estudiante');
      return;
    }

    const created = student.createdAt ? (new Date(student.createdAt).toLocaleString()) : '-';

    const html = `
      <div style="text-align:left">
        <p><strong>Nombre:</strong> ${student.nombreCompleto || '-'}</p>
        <p><strong>Correo:</strong> ${student.email || '-'}</p>
        <p><strong>RUT:</strong> ${student.rut || '-'}</p>
        <p><strong>Carrera:</strong> ${student.carrera || '-'}</p>
        <p><strong>Creado:</strong> ${created}</p>
        <p><strong>Perfil / Observaciones:</strong> ${student.profile?.bio || '-'}</p>
      </div>
    `;

    const result = await Swal.fire({
      title: 'Datos del usuario',
      html,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Aprobar',
      denyButtonText: 'Rechazar',
      cancelButtonText: 'Cerrar',
      width: '600px'
    });

    if (result.isConfirmed) {
      await handleApprove(id);
    } else if (result.isDenied) {
      const { value: reason } = await Swal.fire({
        title: 'Motivo de rechazo',
        input: 'textarea',
        inputPlaceholder: 'Indica el motivo del rechazo...',
        showCancelButton: true,
        confirmButtonText: 'Rechazar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
          if (!value) return 'Debes indicar un motivo';
          return null;
        }
      });

      if (reason) await handleReject(id, reason);
    }
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
                    <td>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}</td>
                    <td>
                      <button className='btn-view' onClick={() => handleView(s.id)}>Ver</button>
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
