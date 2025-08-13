import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'Admin - ParkPass',
  description: 'ParkPass Admin Dashboard',
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      {children}
    </div>
  );
}