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
      <div className='table-container'>
        <div className='top-table'>
          <h1 className='title-table'>Solicitudes de Registro Pendientes</h1>
        </div>
        {students.length === 0 ? (
          <div className='empty-state'>
            <i className="fa-solid fa-inbox" style={{fontSize: '3rem', color: '#9ca3af', marginBottom: '1rem'}}></i>
            <p>No hay solicitudes pendientes</p>
          </div>
        ) : (
          <>
            <table className='users-table'>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>RUT</th>
                  <th>Creado</th>
                  <th className='actions-col'>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}>
                    <td className='user-name'>{s.nombreCompleto}</td>
                    <td>{s.email}</td>
                    <td>{s.rut}</td>
                    <td>{s.createdAt ? new Date(s.createdAt).toLocaleDateString('es-CL') : '—'}</td>
                    <td className='actions-cell'>
                      <button className='btn-view' onClick={() => handleView(s.id)}>
                        <i className="fa-solid fa-eye"></i> Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminRequests;
