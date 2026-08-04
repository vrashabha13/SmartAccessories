import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchOrderHistory } from '../services/orderApi';
import { FiArrowLeft, FiShoppingBag, FiCalendar, FiFileText, FiTag, FiHash, FiCheckCircle, FiBox } from 'react-icons/fi';

export default function Orders() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      fetchOrderHistory(token)
        .then((data) => {
          setProducts(data.orders?.products || []);
        })
        .catch((err) => {
          setError(err.message || 'Failed to fetch order history');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [token]);

  // Group items by orderId
  const groupedOrders = products.reduce((acc, product) => {
    const key = product.orderId;
    if (!acc[key]) {
      acc[key] = {
        orderId: product.orderId,
        orderDate: product.orderDate,
        orderStatus: product.orderStatus,
        items: [],
        grandTotal: 0,
      };
    }
    acc[key].items.push(product);
    acc[key].grandTotal += Number(product.totalPrice);
    return acc;
  }, {});

  // Sort orders by date descending
  const ordersList = Object.values(groupedOrders).sort(
    (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
  );

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="orders-page loading">
        <div className="loader"></div>
        <p>Retrieving your order history...</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-header-nav">
        <button className="back-btn" onClick={() => navigate('/home')}>
          <FiArrowLeft size={18} /> Back to Shop
        </button>
        <h1 className="orders-title">
          <FiShoppingBag size={24} /> Order History
        </h1>
        <span className="orders-subtitle">
          Logged in as <strong>{user?.username || 'Customer'}</strong> ({products.length} item(s) ordered)
        </span>
      </div>

      {error && (
        <div className="orders-error-card">
          <p className="error-message">{error}</p>
          <button className="btn-retry" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      )}

      {!error && ordersList.length === 0 ? (
        <div className="empty-orders-card">
          <FiBox size={64} className="empty-icon" />
          <h2>No Orders Found</h2>
          <p>You haven't successfully completed any orders yet.</p>
          <button className="btn-shop" onClick={() => navigate('/home')}>
            Browse Products
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {ordersList.map((order) => (
            <div key={order.orderId} className="order-group-card">
              <div className="order-group-header">
                <div className="header-left">
                  <div className="order-meta-item">
                    <span className="meta-label"><FiHash size={14} /> Order ID</span>
                    <span className="meta-value highlight">{order.orderId}</span>
                  </div>
                  <div className="order-meta-item">
                    <span className="meta-label"><FiCalendar size={14} /> Placed On</span>
                    <span className="meta-value">{formatDate(order.orderDate)}</span>
                  </div>
                </div>

                <div className="header-right">
                  <span className={`status-badge ${order.orderStatus.toLowerCase()}`}>
                    <FiCheckCircle size={14} /> {order.orderStatus}
                  </span>
                  <div className="order-total-badge">
                    <span className="total-label">Grand Total</span>
                    <span className="total-value">₹{order.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="order-items-container">
                {order.items.map((item) => (
                  <div key={`${order.orderId}-${item.productId}`} className="order-item-row">
                    <div className="item-image-wrapper">
                      <img
                        src={item.productImage || '/placeholder.png'}
                        alt={item.productName}
                        onError={(e) => {
                          e.target.src = '/placeholder.png';
                        }}
                      />
                    </div>

                    <div className="item-details-wrapper">
                      <div className="item-main-info">
                        <h3 className="item-name">{item.productName}</h3>
                        {item.category && (
                          <span className="item-category-tag">
                            <FiTag size={12} /> {item.category}
                          </span>
                        )}
                        {item.productDescription && (
                          <p className="item-description">{item.productDescription}</p>
                        )}
                      </div>

                      <div className="item-pricing-details">
                        <div className="price-col">
                          <span className="pricing-label">Price Per Unit</span>
                          <span className="pricing-val">₹{Number(item.pricePerUnit).toFixed(2)}</span>
                        </div>
                        <div className="qty-col">
                          <span className="pricing-label">Quantity</span>
                          <span className="pricing-val highlight-qty">x {item.quantityPurchased}</span>
                        </div>
                        <div className="total-col">
                          <span className="pricing-label">Subtotal</span>
                          <span className="pricing-val highlight-total">₹{Number(item.totalPrice).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
