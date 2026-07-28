import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="page">
      <div className="card home-content">
        <div className="brand" aria-label="SmartAccessories">
          Smart<span>Accessories</span>
        </div>
        <h1>Welcome User</h1>
        <button type="button" className="btn btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
