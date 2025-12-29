import useUsers from '@hooks/users/useGetUsers.jsx';
import Search from '../components/Search';
import Popup from '../components/Popup';
import { useCallback, useMemo, useState } from 'react';
import '@styles/users.css';
import useEditUser from '@hooks/users/useEditUser';

const Users = () => {
  const { users, setUsers } = useUsers();
  const [filterRut, setFilterRut] = useState('');

  const {
    handleClickUpdate,
    handleUpdate,
    isPopupOpen,
    setIsPopupOpen,
    dataUser,
    setDataUser
  } = useEditUser(setUsers);

  const handleRutFilterChange = (e) => {
    setFilterRut(e.target.value);
  };

  const filteredUsers = useMemo(() => {
    const term = filterRut.trim().toLowerCase();
    if (!term) return users || [];
    return (users || []).filter((u) => (u.rut || '').toLowerCase().includes(term));
  }, [filterRut, users]);

  const handleSelectUser = useCallback((user) => {
    setDataUser(user ? [user] : []);
  }, [setDataUser]);

  return (
    <div className='main-container'>
      <div className='table-container'>
        <div className='top-table'>
          <h1 className='title-table'>Usuarios Registrados</h1>
          <div className='filter-actions'>
            <Search value={filterRut} onChange={handleRutFilterChange} placeholder={'Filtrar por rut'} />
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className='empty-state'>
            <i className="fa-solid fa-inbox" style={{fontSize: '3rem', color: '#9ca3af', marginBottom: '1rem'}}></i>
            <p>No hay usuarios registrados</p>
          </div>
        ) : (
          <table className='users-table'>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>RUT</th>
                <th>Rol</th>
                <th>Creado</th>
                <th className='actions-col'>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const created = u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-CL') : '—';
                const isSelected = dataUser[0]?.id === u.id;
                return (
                  <tr key={u.id} className={isSelected ? 'row-selected' : ''} onClick={() => handleSelectUser(u)}>
                    <td className='user-name'>{u.nombreCompleto}</td>
                    <td>{u.email}</td>
                    <td>{u.rut}</td>
                    <td>{u.rol}</td>
                    <td>{created}</td>
                    <td className='actions-cell'>
                      <button className='btn-view' onClick={(e) => { e.stopPropagation(); handleSelectUser(u); handleClickUpdate(); }}>
                        <i className="fa-solid fa-eye"></i> Ver
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <Popup show={isPopupOpen} setShow={setIsPopupOpen} data={dataUser} action={handleUpdate} />
    </div>
  );
};

export default Users;