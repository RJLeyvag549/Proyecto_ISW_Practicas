import { Outlet } from 'react-router-dom';
import NavbarSuperior from '@components/NavbarSuperior';
import Navbar from '@components/NavbarInferior';
import { AuthProvider } from '@context/AuthContext';

function Root() {
  return (
    <AuthProvider>
      <PageRoot />
    </AuthProvider>
  );
}

function PageRoot() {
  return (
    <>
      <NavbarSuperior />
      <Navbar />
      <Outlet />
    </>
  );
}

export default Root;
