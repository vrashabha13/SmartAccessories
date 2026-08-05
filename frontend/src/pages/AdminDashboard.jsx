import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchCategories, fetchProductsByCategory } from '../services/productApi';
import {
  addProduct,
  deleteProduct,
  updateProduct,
  fetchAllUsers,
  updateUser,
  deleteUser,
  fetchDailyAnalytics,
  fetchMonthlyAnalytics,
  fetchYearlyAnalytics,
  fetchOverallAnalytics
} from '../services/adminApi';
import {
  FiBox,
  FiUsers,
  FiBarChart2,
  FiLogOut,
  FiPlus,
  FiTrash2,
  FiEdit,
  FiCalendar,
  FiDollarSign,
  FiShoppingBag,
  FiPercent,
  FiActivity,
  FiTrendingUp,
  FiX
} from 'react-icons/fi';

export default function AdminDashboard() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation
  const [activeTab, setActiveTab] = useState('products');

  // Categories & Products
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    imageUrl: ''
  });
  const [productErrors, setProductErrors] = useState({});
  const [productSuccess, setProductSuccess] = useState('');
  const [productServerError, setProductServerError] = useState('');
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [deletingProductName, setDeletingProductName] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Users
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // holds user object being edited
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'CUSTOMER'
  });
  const [userErrors, setUserErrors] = useState({});
  const [userSuccess, setUserSuccess] = useState('');
  const [userServerError, setUserServerError] = useState('');

  // Analytics
  const [analyticsType, setAnalyticsType] = useState('daily'); // daily, monthly, yearly, overall
  const [filterDate, setFilterDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [filterMonth, setFilterMonth] = useState(() => {
    return new Date().getMonth() + 1; // 1-12
  });
  const [filterYear, setFilterYear] = useState(() => {
    return new Date().getFullYear();
  });
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');

  // Edit Product
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProductForm, setEditProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    imageUrl: ''
  });
  const [editProductErrors, setEditProductErrors] = useState({});
  const [editProductServerError, setEditProductServerError] = useState('');

  // Delete User
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [deletingUsername, setDeletingUsername] = useState('');
  const [deleteUserError, setDeleteUserError] = useState('');

  // --- Initial Data Load ---
  useEffect(() => {
    // Fetch categories
    fetchCategories()
      .then((data) => {
        setCategories(data);
        if (data.length > 0) {
          setSelectedCategory(data[0].categoryId);
          setProductForm((prev) => ({ ...prev, categoryId: data[0].categoryId }));
        }
      })
      .catch(console.error);
  }, []);

  // Fetch products when selectedCategory changes
  useEffect(() => {
    if (selectedCategory && activeTab === 'products') {
      loadProducts(selectedCategory);
    }
  }, [selectedCategory, activeTab]);

  // Load context dependent lists
  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [activeTab]);

  const loadProducts = (catId) => {
    setLoadingProducts(true);
    setDeleteError('');
    fetchProductsByCategory(catId)
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoadingProducts(false));
  };

  const loadUsers = () => {
    setLoadingUsers(true);
    setUserServerError('');
    setUserSuccess('');
    fetchAllUsers(token)
      .then(setUsers)
      .catch((err) => setUserServerError(err.message))
      .finally(() => setLoadingUsers(false));
  };

  const loadAnalytics = () => {
    setLoadingAnalytics(true);
    setAnalyticsError('');
    let fetchPromise;

    if (analyticsType === 'daily') {
      fetchPromise = fetchDailyAnalytics(token, filterDate);
    } else if (analyticsType === 'monthly') {
      fetchPromise = fetchMonthlyAnalytics(token, filterYear, filterMonth);
    } else if (analyticsType === 'yearly') {
      fetchPromise = fetchYearlyAnalytics(token, filterYear);
    } else {
      fetchPromise = fetchOverallAnalytics(token);
    }

    fetchPromise
      .then(setAnalyticsData)
      .catch((err) => setAnalyticsError(err.message))
      .finally(() => setLoadingAnalytics(false));
  };

  // Reload analytics when parameters change
  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [analyticsType, filterDate, filterMonth, filterYear]);

  // --- Product Functions ---
  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
    setProductErrors((prev) => ({ ...prev, [name]: '' }));
    setProductServerError('');
    setProductSuccess('');
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!productForm.name.trim()) errors.name = 'Product name is required';
    if (!productForm.price) errors.price = 'Product price is required';
    else if (parseFloat(productForm.price) < 0) errors.price = 'Price cannot be negative';
    if (!productForm.stock) errors.stock = 'Stock count is required';
    else if (parseInt(productForm.stock) < 0) errors.stock = 'Stock cannot be negative';
    if (!productForm.categoryId) errors.categoryId = 'Category selection is required';

    if (Object.keys(errors).length > 0) {
      setProductErrors(errors);
      return;
    }

    setProductServerError('');
    setProductSuccess('');

    try {
      await addProduct(token, {
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        categoryId: parseInt(productForm.categoryId),
        imageUrl: productForm.imageUrl.trim() || '/placeholder.png'
      });

      setProductSuccess('Product created successfully');
      setProductForm({
        name: '',
        description: '',
        price: '',
        stock: '',
        categoryId: categories[0]?.categoryId || '',
        imageUrl: ''
      });

      // Reload products
      if (selectedCategory) {
        loadProducts(selectedCategory);
      }
    } catch (err) {
      setProductServerError(err.message || 'Failed to create product');
    }
  };

  const triggerDeleteProduct = (id, name) => {
    setDeletingProductId(id);
    setDeletingProductName(name);
    setDeleteError('');
  };

  const confirmDeleteProduct = async () => {
    if (!deletingProductId) return;
    setDeleteError('');
    try {
      await deleteProduct(token, deletingProductId);
      setDeletingProductId(null);
      setDeletingProductName('');
      // Reload products
      if (selectedCategory) {
        loadProducts(selectedCategory);
      }
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete product');
    }
  };

  const triggerEditProduct = (p) => {
    setEditingProduct(p.productId);
    setEditProductForm({
      name: p.name,
      description: p.description || '',
      price: p.price,
      stock: p.stock,
      categoryId: p.categoryId,
      imageUrl: p.imageUrl || ''
    });
    setEditProductErrors({});
    setEditProductServerError('');
  };

  const handleEditProductChange = (e) => {
    const { name, value } = e.target;
    setEditProductForm((prev) => ({ ...prev, [name]: value }));
    setEditProductErrors((prev) => ({ ...prev, [name]: '' }));
    setEditProductServerError('');
  };

  const handleEditProductSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!editProductForm.name.trim()) errors.name = 'Product name is required';
    if (!editProductForm.price) errors.price = 'Product price is required';
    else if (parseFloat(editProductForm.price) < 0) errors.price = 'Price cannot be negative';
    if (!editProductForm.stock) errors.stock = 'Stock count is required';
    else if (parseInt(editProductForm.stock) < 0) errors.stock = 'Stock cannot be negative';
    if (!editProductForm.categoryId) errors.categoryId = 'Category selection is required';

    if (Object.keys(errors).length > 0) {
      setEditProductErrors(errors);
      return;
    }

    setEditProductServerError('');

    try {
      await updateProduct(token, editingProduct, {
        name: editProductForm.name.trim(),
        description: editProductForm.description.trim(),
        price: parseFloat(editProductForm.price),
        stock: parseInt(editProductForm.stock),
        categoryId: parseInt(editProductForm.categoryId),
        imageUrl: editProductForm.imageUrl.trim() || '/placeholder.png'
      });

      setEditingProduct(null);
      if (selectedCategory) {
        loadProducts(selectedCategory);
      }
    } catch (err) {
      setEditProductServerError(err.message || 'Failed to update product');
    }
  };

  const triggerDeleteUser = (id, name) => {
    setDeletingUserId(id);
    setDeletingUsername(name);
    setDeleteUserError('');
  };

  const confirmDeleteUser = async () => {
    if (!deletingUserId) return;
    setDeleteUserError('');
    try {
      await deleteUser(token, deletingUserId);
      setDeletingUserId(null);
      setDeletingUsername('');
      loadUsers();
    } catch (err) {
      setDeleteUserError(err.message || 'Failed to delete user');
    }
  };

  // --- User Functions ---
  const handleEditClick = (usr) => {
    setEditingUser(usr.userId);
    setEditForm({
      username: usr.username,
      email: usr.email,
      password: '',
      role: usr.role
    });
    setUserErrors({});
    setUserServerError('');
    setUserSuccess('');
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    setUserErrors((prev) => ({ ...prev, [name]: '' }));
    setUserServerError('');
    setUserSuccess('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!editForm.username.trim()) errors.username = 'Username is required';
    if (!editForm.email.trim()) errors.email = 'Email address is required';

    if (Object.keys(errors).length > 0) {
      setUserErrors(errors);
      return;
    }

    setUserServerError('');
    setUserSuccess('');

    try {
      await updateUser(token, editingUser, {
        username: editForm.username.trim(),
        email: editForm.email.trim(),
        password: editForm.password ? editForm.password : null,
        role: editForm.role
      });

      setUserSuccess('User updated successfully');
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      setUserServerError(err.message || 'Failed to update user');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  // --- SVG Chart Components ---
  const renderTrendChart = () => {
    if (!analyticsData || !analyticsData.salesTrend || analyticsData.salesTrend.length === 0) {
      return (
        <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
          No sales trend data available for this range.
        </div>
      );
    }

    const trend = analyticsData.salesTrend;
    const maxVal = Math.max(...trend.map(t => t.revenue), 100);

    // Dynamic width mapping
    const chartHeight = 200;
    const chartWidth = 720;
    const padding = 40;
    const graphWidth = chartWidth - padding * 2;
    const graphHeight = chartHeight - padding * 2;

    const colWidth = graphWidth / trend.length;
    const barWidth = Math.max(colWidth * 0.6, 6);

    return (
      <div className="chart-container">
        <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#f1f5f9" strokeWidth="1" />
          <line x1={padding} y1={padding + graphHeight / 2} x2={chartWidth - padding} y2={padding + graphHeight / 2} stroke="#f1f5f9" strokeWidth="1" />
          <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#cbd5e1" strokeWidth="1" />

          {/* Y Axis Labels */}
          <text x={padding - 10} y={padding + 5} textAnchor="end" fontSize="10" fill="#64748b">₹{Math.round(maxVal)}</text>
          <text x={padding - 10} y={padding + graphHeight / 2 + 5} textAnchor="end" fontSize="10" fill="#64748b">₹{Math.round(maxVal / 2)}</text>
          <text x={padding - 10} y={chartHeight - padding + 5} textAnchor="end" fontSize="10" fill="#64748b">₹0</text>

          {/* Bars */}
          {trend.map((item, idx) => {
            const ratio = item.revenue / maxVal;
            const barHeight = ratio * graphHeight;
            const x = padding + idx * colWidth + (colWidth - barWidth) / 2;
            const y = chartHeight - padding - barHeight;

            return (
              <g key={idx} className="chart-bar-group">
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barHeight, 2)}
                  fill="url(#barGrad)"
                  rx="3"
                  className="chart-bar"
                >
                  <title>{`${item.label}: ₹${item.revenue.toFixed(2)}`}</title>
                </rect>
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - padding + 16}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#64748b"
                  transform={trend.length > 15 ? `rotate(-45, ${x + barWidth / 2}, ${chartHeight - padding + 16})` : ''}
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="admin-dashboard-container">
      <style>{`
        .admin-dashboard-container {
          display: flex;
          min-height: 100vh;
          background: #f8fafc;
          font-family: 'Inter', sans-serif;
        }

        /* --- Sidebar --- */
        .admin-sidebar {
          width: 260px;
          background: #0f172a;
          color: #fff;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          border-right: 1px solid #1e293b;
        }

        .sidebar-brand {
          padding: 18px 20px;
          border-bottom: 1px solid #1e293b;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sidebar-brand img {
          width: 48px;
          height: 48px;
          object-fit: contain;
        }

        .sidebar-brand .brand-text {
          font-weight: 800;
          font-size: 1.05rem;
          color: #fff;
          display: inline-flex;
          align-items: center;
          letter-spacing: 0;
        }

        .sidebar-brand .brand-text span {
          color: #a78bfa;
          margin-left: 0;
        }

        .sidebar-user {
          padding: 20px;
          border-bottom: 1px solid #1e293b;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sidebar-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #3b82f6);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
        }

        .sidebar-username {
          font-size: 0.85rem;
          font-weight: 600;
          color: #f1f5f9;
        }

        .sidebar-role {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .sidebar-menu {
          list-style: none;
          padding: 20px 0;
          flex-grow: 1;
        }

        .sidebar-item {
          padding: 2px 14px;
          margin-bottom: 6px;
        }

        .sidebar-link {
          width: 100%;
          background: none;
          border: none;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          text-align: left;
          transition: all 0.2s ease;
        }

        .sidebar-link:hover {
          color: #fff;
          background: #1e293b;
        }

        .sidebar-link.active {
          color: #fff;
          background: #8b5cf6;
        }

        .sidebar-footer {
          padding: 20px;
          border-top: 1px solid #1e293b;
        }

        .logout-btn {
          width: 100%;
          background: none;
          border: 1px solid #e11d48;
          color: #f43f5e;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.2s ease;
        }

        .logout-btn:hover {
          background: #881337;
          color: #fff;
        }

        /* --- Content Right --- */
        .admin-content {
          flex-grow: 1;
          padding: 40px;
          overflow-y: auto;
        }

        .tab-title-row {
          margin-bottom: 30px;
        }

        .tab-title-row h1 {
          font-size: 1.75rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .tab-title-row p {
          color: #64748b;
          font-size: 0.9rem;
        }

        /* --- Cards & Forms --- */
        .dashboard-card {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.02);
          border: 1px solid #e2e8f0;
          margin-bottom: 30px;
        }

        .dashboard-card h2 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        @media (max-width: 900px) {
          .grid-2 {
            grid-template-columns: 1fr;
          }
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .admin-field {
          margin-bottom: 16px;
        }

        .admin-field label {
          display: block;
          margin-bottom: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #334155;
        }

        .admin-field input, .admin-field textarea, .admin-field select {
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          font-size: 14px;
          color: #0f172a;
          background: #fff;
          transition: all 0.2s ease;
        }

        .admin-field input:focus, .admin-field textarea:focus, .admin-field select:focus {
          outline: none;
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
        }

        .field-error-text {
          color: #ef4444;
          font-size: 0.75rem;
          margin-top: 4px;
        }

        .admin-submit-btn {
          background: #8b5cf6;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 12px 20px;
          font-weight: 700;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .admin-submit-btn:hover {
          background: #7c3aed;
        }

        .admin-panel-success {
          background: #f0fdf4;
          color: #16a34a;
          border: 1px solid #bbf7d0;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 0.85rem;
        }

        .admin-panel-alert {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 0.85rem;
        }

        /* --- Category & Listings --- */
        .category-select-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 16px;
        }

        .category-select-row select {
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          font-size: 14px;
          background: #fff;
          width: 220px;
        }

        .data-table-wrapper {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .data-table th {
          padding: 12px 16px;
          border-bottom: 2px solid #e2e8f0;
          font-weight: 700;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: #64748b;
          background: #f8fafc;
        }

        .data-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 0.85rem;
          color: #334155;
          vertical-align: middle;
        }

        .data-table tr:hover td {
          background: #f8fafc;
        }

        .action-icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .action-icon-btn.edit {
          color: #3b82f6;
        }

        .action-icon-btn.edit:hover {
          background: #eff6ff;
        }

        .action-icon-btn.delete {
          color: #ef4444;
        }

        .action-icon-btn.delete:hover {
          background: #fef2f2;
        }

        .table-product-thumb {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: #f1f5f9;
          object-fit: contain;
          border: 1px solid #e2e8f0;
        }

        .user-role-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 700;
        }

        .user-role-badge.admin {
          background: #f3e8ff;
          color: #7e22ce;
        }

        .user-role-badge.customer {
          background: #e0f2fe;
          color: #0369a1;
        }

        /* --- Modal Dialogs --- */
        .admin-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          animation: overlayFade 0.2s ease forwards;
        }

        @keyframes overlayFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .admin-modal {
          background: #fff;
          border-radius: 16px;
          width: 100%;
          max-width: 500px;
          padding: 30px;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
          border: 1px solid #e2e8f0;
          position: relative;
          animation: modalScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes modalScale {
          from { transform: scale(0.9) translateY(10px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }

        .modal-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          padding: 4px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .modal-close:hover {
          background: #f1f5f9;
          color: #475569;
        }

        .modal-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 20px;
        }

        /* --- Analytics Styling --- */
        .analytics-filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          background: #fff;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          margin-bottom: 30px;
        }

        .report-toggle-group {
          display: flex;
          border-radius: 8px;
          background: #f1f5f9;
          padding: 4px;
        }

        .report-toggle-btn {
          border: none;
          background: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .report-toggle-btn.active {
          background: #fff;
          color: #0f172a;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }

        .filter-inputs-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .filter-inputs-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #475569;
        }

        .filter-inputs-group input, .filter-inputs-group select {
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          font-size: 13px;
          background: #fff;
          color: #0f172a;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }

        @media (max-width: 768px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }
        }

        .metric-card {
          background: #fff;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        .metric-icon-circle {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .metric-icon-circle.revenue { background: #f0fdf4; color: #16a34a; }
        .metric-icon-circle.transactions { background: #eff6ff; color: #3b82f6; }
        .metric-icon-circle.aov { background: #faf5ff; color: #8b5cf6; }

        .metric-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .metric-value {
          font-size: 1.4rem;
          font-weight: 800;
          color: #0f172a;
        }

        .chart-container {
          width: 100%;
          height: 240px;
          margin-top: 10px;
        }

        .chart-bar-group:hover .chart-bar {
          fill: #7c3aed;
          cursor: pointer;
        }
      `}</style>

      {/* --- Sidebar Left --- */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <img src="/logo.png" alt="SmartAccessories" height="70" />
          <span className="brand-text">Smart<span>Accessories</span></span>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div>
            <div className="sidebar-username">{user?.username || 'Administrator'}</div>
            <div className="sidebar-role">{user?.role || 'ADMIN'}</div>
          </div>
        </div>

        <ul className="sidebar-menu">
          <li className="sidebar-item">
            <button
              className={`sidebar-link ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <FiBox size={18} />
              Products Management
            </button>
          </li>
          <li className="sidebar-item">
            <button
              className={`sidebar-link ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <FiUsers size={18} />
              Users Management
            </button>
          </li>
          <li className="sidebar-item">
            <button
              className={`sidebar-link ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <FiBarChart2 size={18} />
              Business Analytics
            </button>
          </li>
        </ul>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut size={16} />
            Secure Logout
          </button>
        </div>
      </aside>

      {/* --- Content Area Right --- */}
      <main className="admin-content">
        {/* TAB TITLE */}
        <div className="tab-title-row">
          {activeTab === 'products' && (
            <>
              <h1>Product Catalog Management</h1>
              <p>Add new products to the inventory and manage the available listings.</p>
            </>
          )}
          {activeTab === 'users' && (
            <>
              <h1>Platform Users & Permissions</h1>
              <p>Modify user details, assign administrative roles, and secure accesses.</p>
            </>
          )}
          {activeTab === 'analytics' && (
            <>
              <h1>Business Revenue Dashboard</h1>
              <p>Review daily, monthly, yearly, and overall commercial metrics.</p>
            </>
          )}
        </div>

        {/* --- PRODUCTS TAB --- */}
        {activeTab === 'products' && (
          <div className="grid-2">
            {/* ADD PRODUCT CARD */}
            <section className="dashboard-card">
              <h2><FiPlus /> Add New Product</h2>
              {productSuccess && <div className="admin-panel-success">{productSuccess}</div>}
              {productServerError && <div className="admin-panel-alert">{productServerError}</div>}

              <form onSubmit={handleProductSubmit}>
                <div className="admin-field">
                  <label htmlFor="p-name">Product Title</label>
                  <input
                    id="p-name"
                    name="name"
                    type="text"
                    placeholder="e.g. Type-C Fast Charger"
                    value={productForm.name}
                    onChange={handleProductChange}
                  />
                  {productErrors.name && <p className="field-error-text">{productErrors.name}</p>}
                </div>

                <div className="admin-field">
                  <label htmlFor="p-desc">Description</label>
                  <textarea
                    id="p-desc"
                    name="description"
                    rows="3"
                    placeholder="Provide details about the accessory..."
                    value={productForm.description}
                    onChange={handleProductChange}
                  />
                </div>

                <div className="form-row">
                  <div className="admin-field">
                    <label htmlFor="p-price">Price (INR)</label>
                    <input
                      id="p-price"
                      name="price"
                      type="number"
                      step="0.01"
                      placeholder="e.g. 899.00"
                      value={productForm.price}
                      onChange={handleProductChange}
                    />
                    {productErrors.price && <p className="field-error-text">{productErrors.price}</p>}
                  </div>

                  <div className="admin-field">
                    <label htmlFor="p-stock">Stock Quantity</label>
                    <input
                      id="p-stock"
                      name="stock"
                      type="number"
                      placeholder="e.g. 50"
                      value={productForm.stock}
                      onChange={handleProductChange}
                    />
                    {productErrors.stock && <p className="field-error-text">{productErrors.stock}</p>}
                  </div>
                </div>

                <div className="admin-field">
                  <label htmlFor="p-cat">Category</label>
                  <select
                    id="p-cat"
                    name="categoryId"
                    value={productForm.categoryId}
                    onChange={handleProductChange}
                  >
                    <option value="" disabled>Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.categoryId} value={cat.categoryId}>
                        {cat.categoryName}
                      </option>
                    ))}
                  </select>
                  {productErrors.categoryId && <p className="field-error-text">{productErrors.categoryId}</p>}
                </div>

                <div className="admin-field">
                  <label htmlFor="p-img">Image URL (Optional)</label>
                  <input
                    id="p-img"
                    name="imageUrl"
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={productForm.imageUrl}
                    onChange={handleProductChange}
                  />
                </div>

                <button type="submit" className="admin-submit-btn">
                  Publish to Catalog
                </button>
              </form>
            </section>

            {/* PRODUCT LISTINGS CARD */}
            <section className="dashboard-card" style={{ flexGrow: 1 }}>
              <h2><FiBox /> Catalog Listings</h2>
              {deleteError && <div className="admin-panel-alert">{deleteError}</div>}

              <div className="category-select-row">
                <span>View Products in:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              {loadingProducts ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Querying database...</div>
              ) : products.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>No products found in this category.</div>
              ) : (
                <div className="data-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.productId}>
                          <td>
                            <img
                              src={p.imageUrl || '/placeholder.png'}
                              alt=""
                              className="table-product-thumb"
                            />
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{p.name}</div>
                          </td>
                          <td>₹{p.price}</td>
                          <td>
                            <span style={{ color: p.stock === 0 ? '#ef4444' : p.stock <= 5 ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
                              {p.stock}
                            </span>
                          </td>
                          <td style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="action-icon-btn edit"
                              onClick={() => triggerEditProduct(p)}
                              title="Edit Product"
                            >
                              <FiEdit size={16} />
                            </button>
                            <button
                              className="action-icon-btn delete"
                              onClick={() => triggerDeleteProduct(p.productId, p.name)}
                              title="Delete Product"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}

        {/* --- USERS TAB --- */}
        {activeTab === 'users' && (
          <section className="dashboard-card">
            <h2><FiUsers /> Registered Accounts</h2>
            {userSuccess && <div className="admin-panel-success">{userSuccess}</div>}
            {userServerError && <div className="admin-panel-alert">{userServerError}</div>}

            {loadingUsers ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Scanning security database...</div>
            ) : (
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Username</th>
                      <th>Email Address</th>
                      <th>Role</th>
                      <th>Registered</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.userId}>
                        <td>#{u.userId}</td>
                        <td style={{ fontWeight: 600 }}>{u.username}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`user-role-badge ${u.role === 'ADMIN' ? 'admin' : 'customer'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="action-icon-btn edit"
                            onClick={() => handleEditClick(u)}
                            title="Edit Permissions & Details"
                          >
                            <FiEdit size={16} />
                          </button>
                          {u.role?.toUpperCase() === 'CUSTOMER' && (
                            <button
                              className="action-icon-btn delete"
                              onClick={() => triggerDeleteUser(u.userId, u.username)}
                              title="Delete Customer Account"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* --- ANALYTICS TAB --- */}
        {activeTab === 'analytics' && (
          <div>
            {/* Filter Bar */}
            <div className="analytics-filter-bar">
              <div className="report-toggle-group">
                <button
                  className={`report-toggle-btn ${analyticsType === 'daily' ? 'active' : ''}`}
                  onClick={() => setAnalyticsType('daily')}
                >
                  Daily Analysis
                </button>
                <button
                  className={`report-toggle-btn ${analyticsType === 'monthly' ? 'active' : ''}`}
                  onClick={() => setAnalyticsType('monthly')}
                >
                  Monthly Analysis
                </button>
                <button
                  className={`report-toggle-btn ${analyticsType === 'yearly' ? 'active' : ''}`}
                  onClick={() => setAnalyticsType('yearly')}
                >
                  Yearly Analysis
                </button>
                <button
                  className={`report-toggle-btn ${analyticsType === 'overall' ? 'active' : ''}`}
                  onClick={() => setAnalyticsType('overall')}
                >
                  Overall Analysis
                </button>
              </div>

              {/* Filter inputs */}
              <div className="filter-inputs-group">
                {analyticsType === 'daily' && (
                  <>
                    <label htmlFor="f-date">Select Date:</label>
                    <input
                      id="f-date"
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                    />
                  </>
                )}

                {analyticsType === 'monthly' && (
                  <>
                    <label htmlFor="f-month">Month:</label>
                    <select
                      id="f-month"
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(parseInt(e.target.value))}
                    >
                      <option value="1">January</option>
                      <option value="2">February</option>
                      <option value="3">March</option>
                      <option value="4">April</option>
                      <option value="5">May</option>
                      <option value="6">June</option>
                      <option value="7">July</option>
                      <option value="8">August</option>
                      <option value="9">September</option>
                      <option value="10">October</option>
                      <option value="11">November</option>
                      <option value="12">December</option>
                    </select>

                    <label htmlFor="f-myear">Year:</label>
                    <input
                      id="f-myear"
                      type="number"
                      style={{ width: 80 }}
                      value={filterYear}
                      onChange={(e) => setFilterYear(parseInt(e.target.value))}
                    />
                  </>
                )}

                {analyticsType === 'yearly' && (
                  <>
                    <label htmlFor="f-year">Select Year:</label>
                    <input
                      id="f-year"
                      type="number"
                      style={{ width: 100 }}
                      value={filterYear}
                      onChange={(e) => setFilterYear(parseInt(e.target.value))}
                    />
                  </>
                )}

                {analyticsType === 'overall' && (
                  <span style={{ color: '#64748b', fontSize: 13, fontWeight: 500 }}>Showing Life-time Summary</span>
                )}
              </div>
            </div>

            {analyticsError && <div className="admin-panel-alert">{analyticsError}</div>}

            {loadingAnalytics ? (
              <div style={{ padding: 80, textAlign: 'center', color: '#64748b' }}>Compiling financial ledgers...</div>
            ) : analyticsData ? (
              <div>
                {/* METRICS ROW */}
                <div className="metrics-grid">
                  <div className="metric-card">
                    <div className="metric-icon-circle revenue">
                      <FiDollarSign size={20} />
                    </div>
                    <div>
                      <div className="metric-label">Total Revenue</div>
                      <div className="metric-value">₹{analyticsData.totalRevenue?.toFixed(2) || '0.00'}</div>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-icon-circle transactions">
                      <FiShoppingBag size={20} />
                    </div>
                    <div>
                      <div className="metric-label">Completed Orders</div>
                      <div className="metric-value">{analyticsData.transactionCount}</div>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-icon-circle aov">
                      <FiPercent size={20} />
                    </div>
                    <div>
                      <div className="metric-label">Avg. Order Value</div>
                      <div className="metric-value">₹{analyticsData.averageOrderValue?.toFixed(2) || '0.00'}</div>
                    </div>
                  </div>
                </div>

                {/* CHART & TOP PRODUCTS */}
                <div className="grid-2">
                  <div className="dashboard-card">
                    <h2><FiTrendingUp /> Sales Trend</h2>
                    {renderTrendChart()}
                  </div>

                  <div className="dashboard-card">
                    <h2><FiBox /> Top Selling Products</h2>
                    {analyticsData.topSellingProducts?.length === 0 ? (
                      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                        No items sold during this period.
                      </div>
                    ) : (
                      <div className="data-table-wrapper">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Product Name</th>
                              <th>Qty Sold</th>
                              <th>Revenue</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analyticsData.topSellingProducts?.map((p, index) => (
                              <tr key={index}>
                                <td style={{ fontWeight: 600 }}>{p.name}</td>
                                <td>{p.quantitySold} units</td>
                                <td style={{ fontWeight: 600, color: '#16a34a' }}>₹{p.revenue?.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* TRANSACTIONS LOG */}
                <div className="dashboard-card">
                  <h2><FiShoppingBag /> Transaction Log</h2>
                  {analyticsData.transactions?.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>No successful payments in this scope.</div>
                  ) : (
                    <div className="data-table-wrapper">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Customer Name</th>
                            <th>Amount Paid</th>
                            <th>Timestamp</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analyticsData.transactions?.map((t, index) => (
                            <tr key={index}>
                              <td style={{ fontFamily: 'monospace' }}>#{t.orderId}</td>
                              <td style={{ fontWeight: 600 }}>{t.username}</td>
                              <td style={{ fontWeight: 600 }}>₹{t.totalAmount?.toFixed(2)}</td>
                              <td>{new Date(t.date).toLocaleString()}</td>
                              <td>
                                <span style={{ color: '#16a34a', background: '#f0fdf4', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                                  {t.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </main>

      {/* --- EDIT USER MODAL --- */}
      {editingUser !== null && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <button className="modal-close" onClick={() => setEditingUser(null)}>
              <FiX size={18} />
            </button>
            <h3 className="modal-title">Edit User Profile</h3>

            {userServerError && <div className="admin-panel-alert">{userServerError}</div>}

            <form onSubmit={handleEditSubmit}>
              <div className="admin-field">
                <label htmlFor="e-username">Username</label>
                <input
                  id="e-username"
                  name="username"
                  type="text"
                  value={editForm.username}
                  onChange={handleEditChange}
                />
                {userErrors.username && <p className="field-error-text">{userErrors.username}</p>}
              </div>

              <div className="admin-field">
                <label htmlFor="e-email">Email Address</label>
                <input
                  id="e-email"
                  name="email"
                  type="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                />
                {userErrors.email && <p className="field-error-text">{userErrors.email}</p>}
              </div>

              <div className="admin-field">
                <label htmlFor="e-pass">Security Password (leave blank to keep unchanged)</label>
                <input
                  id="e-pass"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={editForm.password}
                  onChange={handleEditChange}
                />
              </div>

              <div className="admin-field">
                <label htmlFor="e-role">Role / Permission</label>
                <select
                  id="e-role"
                  name="role"
                  value={editForm.role}
                  onChange={handleEditChange}
                >
                  <option value="CUSTOMER">CUSTOMER (Standard Access)</option>
                  <option value="ADMIN">ADMIN (Full Access)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 30 }}>
                <button
                  type="button"
                  className="admin-submit-btn"
                  style={{ background: '#e2e8f0', color: '#475569' }}
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-submit-btn">
                  Save Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CONFIRM DELETE PRODUCT MODAL --- */}
      {deletingProductId !== null && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <button className="modal-close" onClick={() => { setDeletingProductId(null); setDeletingProductName(''); }}>
              <FiX size={18} />
            </button>
            <h3 className="modal-title">Confirm Deletion</h3>
            <p style={{ color: '#475569', fontSize: 14, marginBottom: 20 }}>
              Are you sure you want to delete <strong>{deletingProductName}</strong>? This action cannot be undone.
            </p>

            {deleteError && <div className="admin-panel-alert">{deleteError}</div>}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 30 }}>
              <button
                type="button"
                className="admin-submit-btn"
                style={{ background: '#e2e8f0', color: '#475569' }}
                onClick={() => { setDeletingProductId(null); setDeletingProductName(''); }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-submit-btn"
                style={{ background: '#ef4444' }}
                onClick={confirmDeleteProduct}
              >
                Delete Listing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT PRODUCT MODAL --- */}
      {editingProduct !== null && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: 600 }}>
            <button className="modal-close" onClick={() => setEditingProduct(null)}>
              <FiX size={18} />
            </button>
            <h3 className="modal-title">Edit Product Details</h3>
            <form onSubmit={handleEditProductSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={editProductForm.name}
                    onChange={handleEditProductChange}
                    className={`admin-input ${editProductErrors.name ? 'error' : ''}`}
                    placeholder="e.g. fast wireless charger"
                  />
                  {editProductErrors.name && <span className="input-err">{editProductErrors.name}</span>}
                </div>
                <div className="form-group">
                  <label>Category <span style={{ color: '#ef4444' }}>*</span></label>
                  <select
                    name="categoryId"
                    value={editProductForm.categoryId}
                    onChange={handleEditProductChange}
                    className={`admin-input ${editProductErrors.categoryId ? 'error' : ''}`}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.categoryId} value={c.categoryId}>
                        {c.categoryName}
                      </option>
                    ))}
                  </select>
                  {editProductErrors.categoryId && <span className="input-err">{editProductErrors.categoryId}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (INR) <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={editProductForm.price}
                    onChange={handleEditProductChange}
                    className={`admin-input ${editProductErrors.price ? 'error' : ''}`}
                    placeholder="0.00"
                  />
                  {editProductErrors.price && <span className="input-err">{editProductErrors.price}</span>}
                </div>
                <div className="form-group">
                  <label>Stock Quantity <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="number"
                    name="stock"
                    value={editProductForm.stock}
                    onChange={handleEditProductChange}
                    className={`admin-input ${editProductErrors.stock ? 'error' : ''}`}
                    placeholder="0"
                  />
                  {editProductErrors.stock && <span className="input-err">{editProductErrors.stock}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={editProductForm.description}
                  onChange={handleEditProductChange}
                  className="admin-input textarea"
                  placeholder="Provide deep product specifications..."
                />
              </div>

              <div className="form-group">
                <label>Product Image URL</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={editProductForm.imageUrl}
                  onChange={handleEditProductChange}
                  className="admin-input"
                  placeholder="https://example.com/product.jpg"
                />
              </div>

              {editProductServerError && <div className="admin-panel-alert">{editProductServerError}</div>}

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 30 }}>
                <button
                  type="button"
                  className="admin-submit-btn"
                  style={{ background: '#e2e8f0', color: '#475569' }}
                  onClick={() => setEditingProduct(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-submit-btn">
                  Update Catalog Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CONFIRM DELETE USER MODAL --- */}
      {deletingUserId !== null && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <button className="modal-close" onClick={() => { setDeletingUserId(null); setDeletingUsername(''); }}>
              <FiX size={18} />
            </button>
            <h3 className="modal-title" style={{ color: '#ef4444' }}>Delete Customer Account</h3>
            <p style={{ color: '#475569', fontSize: 14, marginBottom: 20 }}>
              Are you sure you want to delete the user account for <strong>{deletingUsername}</strong>? This will clear their cart contents and active sessions. This action cannot be undone.
            </p>

            {deleteUserError && <div className="admin-panel-alert">{deleteUserError}</div>}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 30 }}>
              <button
                type="button"
                className="admin-submit-btn"
                style={{ background: '#e2e8f0', color: '#475569' }}
                onClick={() => { setDeletingUserId(null); setDeletingUsername(''); }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-submit-btn"
                style={{ background: '#ef4444' }}
                onClick={confirmDeleteUser}
              >
                Delete Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}