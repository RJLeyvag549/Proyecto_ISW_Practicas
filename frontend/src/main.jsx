import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from '@pages/Login';
import Home from '@pages/Home';
import Users from '@pages/Users';
import AdminRequests from '@pages/AdminRequests';
import InternshipPage from '@pages/InternshipPage';
import PracticeApplicationsPage from '@pages/PracticeApplicationsPage';
import MyApplicationsPage from '@pages/MyApplicationsPage';
import StudentDocumentsPage from '@pages/StudentDocumentsPage';
import MyDocuments from '@pages/MyDocuments';
import Register from '@pages/Register';
import Terminos from '@pages/Terminos';
import Error404 from '@pages/Error404';
import Root from '@pages/Root';
import ProtectedRoute from '@components/ProtectedRoute';
import Perfil from '@pages/Perfil';
import ConsultasPage from '@pages/ConsultasPage';
import '@styles/styles.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <Error404 />,
    children: [
      {
        path: '/home',
        element: <Home />
      },
      {
        path: '/users',
        element: (
          <ProtectedRoute allowedRoles={['administrador']}>
            <Users />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/requests',
        element: (
          <ProtectedRoute allowedRoles={['administrador']}>
            <AdminRequests />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/internships',
        element: (
          <ProtectedRoute allowedRoles={['administrador', 'estudiante', 'usuario']}>
            <InternshipPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/applications',
        element: (
          <ProtectedRoute allowedRoles={['administrador']}>
            <PracticeApplicationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/documents',
        element: (
          <ProtectedRoute allowedRoles={['administrador']}>
            <StudentDocumentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/my-applications',
        element: (
          <ProtectedRoute allowedRoles={['estudiante']}>
            <MyApplicationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/my-documents',
        element: (
          <ProtectedRoute allowedRoles={['estudiante', 'usuario']}>
            <MyDocuments />
          </ProtectedRoute>
        ),
      },
      {
        path: '/consultas',
        element: (
          <ProtectedRoute allowedRoles={['administrador', 'estudiante', 'usuario']}>
            <ConsultasPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/perfil',
        element: (
          <ProtectedRoute>
            <Perfil />
          </ProtectedRoute>
        ),
      },
    ]
  },
  {
    path: '/auth',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/terminos',
    element: <Terminos />
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
);
