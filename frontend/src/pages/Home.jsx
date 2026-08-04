import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchCategories, fetchProductsByCategory } from '../services/productApi';
import { fetchCartCount, addToCart } from '../services/cartApi';
import { FiShoppingCart, FiUser, FiChevronDown, FiLogOut, FiPlus, FiCheck, FiShoppingBag } from 'react-icons/fi';

export default function Home() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState({});
  const [showCartNotification, setShowCartNotification] = useState(null);

  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchCategories()
      .then((data) => {
        setCategories(data);
        if (data.length > 0) {
          setSelectedCategory(data[0].categoryId);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (token) {
      fetchCartCount(token)
        .then((data) => setCartCount(data.count))
        .catch(console.error);
    }
  }, [token]);

  useEffect(() => {
    function handleCartUpdated(e) {
      setCartCount(e.detail);
    }
    window.addEventListener('cart-updated', handleCartUpdated);
    return () => window.removeEventListener('cart-updated', handleCartUpdated);
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchProductsByCategory(selectedCategory)
        .then(setProducts)
        .catch(console.error);
    }
  }, [selectedCategory]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleAddToCart = async (productId) => {
    setAddingToCart((prev) => ({ ...prev, [productId]: true }));
    try {
      await addToCart(token, productId);
      const data = await fetchCartCount(token);
      setCartCount(data.count);
      setShowCartNotification(productId);
      setTimeout(() => setShowCartNotification(null), 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingToCart((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const displayName = user?.username || 'User';

  return (
    <div className="home-page">
      <header className="top-navbar">
        <div className="nav-left">
          <div className="logo-placeholder">
            <img src="/logo.png" alt="SmartAccessories" height="70" />
          </div>
          <span className="brand-text">Smart<span>Accessories</span></span>
        </div>

        <div className="nav-right">
          <button className="cart-btn" onClick={() => navigate('/cart')}>
            <FiShoppingCart size={22} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          <div className="user-dropdown" ref={dropdownRef}>
            <button
              className="user-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="avatar-circle">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="user-name">{displayName}</span>
              <FiChevronDown size={16} className={`chevron ${dropdownOpen ? 'open' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <span className="dropdown-username">{displayName}</span>
                  <span className="dropdown-email">{user?.email}</span>
                </div>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={() => { setDropdownOpen(false); navigate('/profile'); }}>
                  <FiUser size={16} />
                  Profile
                </button>
                <button className="dropdown-item" onClick={() => { setDropdownOpen(false); navigate('/orders'); }}>
                  <FiShoppingBag size={16} />
                  Orders
                </button>
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <FiLogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <nav className="category-bar">
        <div className="category-list">
          {categories.map((cat) => (
            <button
              key={cat.categoryId}
              className={`category-btn ${selectedCategory === cat.categoryId ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.categoryId)}
            >
              {cat.categoryName}
            </button>
          ))}
        </div>
      </nav>

      <main className="product-grid-container">
        {products.length === 0 ? (
          <div className="no-products">
            <p>No products available in this category.</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <div key={product.productId} className="product-card">
                <div className="product-image-wrapper">
                  <img
                    src={product.imageUrl || '/placeholder.png'}
                    alt={product.name}
                    className="product-image"
                    loading="lazy"
                  />
                  {product.stock <= 5 && product.stock > 0 && (
                    <span className="stock-warning">Only {product.stock} left</span>
                  )}
                  {product.stock === 0 && (
                    <span className="out-of-stock">Out of Stock</span>
                  )}
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  {product.description && (
                    <p className="product-desc">{product.description}</p>
                  )}
                  <div className="product-price-row">
                    <span className="product-price">₹{product.price}</span>
                    <button
                      className={`add-to-cart-btn ${showCartNotification === product.productId ? 'added' : ''}`}
                      onClick={() => handleAddToCart(product.productId)}
                      disabled={addingToCart[product.productId] || product.stock === 0}
                    >
                      {showCartNotification === product.productId ? (
                        <><FiCheck size={16} /> Added</>
                      ) : addingToCart[product.productId] ? (
                        'Adding...'
                      ) : (
                        <><FiPlus size={16} /> Add to Cart</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
