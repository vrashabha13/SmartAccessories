import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchCart,
  fetchCartCount,
  updateCartItem,
  removeFromCart,
  createOrder,
  verifyPayment,
} from '../services/cartApi';
import {
  FiShoppingCart,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiArrowLeft,
  FiCheckCircle,
  FiX,
  FiCreditCard,
} from 'react-icons/fi';

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load Razorpay. Check your internet connection.'));
    document.body.appendChild(script);
  });
}

export default function Cart() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const lastKnownCount = useRef(0);

  const loadCart = async () => {
    try {
      const data = await fetchCart(token);
      setItems(data.items || []);
      setGrandTotal(data.grandTotal || 0);
      if (data.totalItems !== lastKnownCount.current) {
        lastKnownCount.current = data.totalItems;
        const countData = await fetchCartCount(token);
        window.dispatchEvent(new CustomEvent('cart-updated', { detail: countData.count }));
      }
    } catch (err) {
      setError(err.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [token]);

  const notifyCartUpdated = () => {
    fetchCartCount(token).then((data) => {
      window.dispatchEvent(new CustomEvent('cart-updated', { detail: data.count }));
    }).catch(() => {});
  };

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 0) return;
    setUpdatingId(cartItemId);
    setError('');
    try {
      const result = await updateCartItem(token, cartItemId, newQuantity);
      if (!result) {
        setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
      } else {
        setItems((prev) => prev.map((item) => (item.cartItemId === cartItemId ? result : item)));
      }
      setGrandTotal(
        items
          .map((item) => (item.cartItemId === cartItemId
            ? (result ? result.lineTotal : 0)
            : item.lineTotal))
          .reduce((a, b) => a + Number(b), 0)
      );
      notifyCartUpdated();
    } catch (err) {
      setError(err.message || 'Failed to update quantity');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (cartItemId) => {
    setUpdatingId(cartItemId);
    setError('');
    try {
      await removeFromCart(token, cartItemId);
      setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
      setGrandTotal((prev) => prev - items.find((i) => i.cartItemId === cartItemId)?.lineTotal);
      notifyCartUpdated();
    } catch (err) {
      setError(err.message || 'Failed to remove item');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setError('');
    try {
      await loadRazorpayScript();
      const order = await createOrder(token);

      const options = {
        key: order.razorpayKeyId,
        amount: Math.round(order.amount * 100),
        currency: order.currency,
        name: 'SmartAccessories',
        description: `Order ${order.orderId}`,
        order_id: order.razorpayOrderId,
        handler: async (response) => {
          try {
            const verification = await verifyPayment(token, {
              orderId: order.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setPaymentSuccess(true);
            setSuccessOrderId(verification.orderId);
            setShowSuccessPopup(true);
            setItems([]);
            setGrandTotal(0);
            notifyCartUpdated();
          } catch (err) {
            setError(err.message || 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => setCheckoutLoading(false),
        },
        theme: {
          color: '#2563eb',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setError(response.error?.description || 'Payment failed. Please try again.');
        setCheckoutLoading(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.message || 'Failed to start checkout');
      setCheckoutLoading(false);
    }
  };

  const closeSuccessPopup = () => {
    setShowSuccessPopup(false);
    navigate('/home');
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-loading">Loading your cart...</div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <button className="back-btn" onClick={() => navigate('/home')}>
          <FiArrowLeft size={18} /> Continue Shopping
        </button>
        <h1 className="cart-title">
          <FiShoppingCart size={24} /> Your Cart
        </h1>
        <span className="cart-count-text">
          {items.reduce((sum, item) => sum + item.quantity, 0)} item(s)
        </span>
      </div>

      {error && <div className="alert cart-alert">{error}</div>}

      {items.length === 0 && !paymentSuccess ? (
        <div className="empty-cart">
          <FiShoppingCart size={64} />
          <h2>Your cart is empty</h2>
          <p>Browse products and add items to your cart.</p>
          <button className="btn-cart-primary" onClick={() => navigate('/home')}>
            Start Shopping
          </button>
        </div>
      ) : items.length === 0 && paymentSuccess ? null : (
        <>
          <div className="cart-table">
            <div className="cart-table-head">
              <span>Product</span>
              <span>Price</span>
              <span>Quantity</span>
              <span>Total</span>
              <span>Action</span>
            </div>

            {items.map((item) => (
              <div className="cart-table-row" key={item.cartItemId}>
                <div className="cart-product-cell">
                  <div className="cart-product-image">
                    <img src={item.imageUrl || '/placeholder.png'} alt={item.productName} />
                  </div>
                  <div className="cart-product-details">
                    <h3>{item.productName}</h3>
                    {item.description && <p>{item.description}</p>}
                  </div>
                </div>
                <div className="cart-cell" data-label="Price">₹{item.price}</div>
                <div className="cart-cell" data-label="Quantity">
                  <div className="qty-control">
                    <button
                      className="qty-btn"
                      onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity - 1)}
                      disabled={updatingId === item.cartItemId || item.quantity <= 1}
                    >
                      <FiMinus size={14} />
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity + 1)}
                      disabled={updatingId === item.cartItemId || item.quantity >= item.stock}
                      title={item.quantity >= item.stock ? 'Stock limit reached' : 'Increase'}
                    >
                      <FiPlus size={14} />
                    </button>
                  </div>
                  {item.quantity >= item.stock && (
                    <div className="stock-limit-hint">Max {item.stock} in stock</div>
                  )}
                </div>
                <div className="cart-cell cart-line-total" data-label="Total">₹{item.lineTotal}</div>
                <div className="cart-cell" data-label="Action">
                  <button
                    className="remove-btn"
                    onClick={() => handleRemove(item.cartItemId)}
                    disabled={updatingId === item.cartItemId}
                  >
                    <FiTrash2 size={16} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-details">
              <div className="summary-row">
                <span>Items:</span>
                <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div className="summary-row grand">
                <span>Grand Total:</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>
            <button
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={checkoutLoading || items.length === 0}
            >
              {checkoutLoading ? (
                'Processing...'
              ) : (
                <>
                  <FiCreditCard size={18} /> Proceed to Checkout
                </>
              )}
            </button>
          </div>
        </>
      )}

      {showSuccessPopup && (
        <div className="modal-overlay">
          <div className="success-modal">
            <button className="modal-close" onClick={closeSuccessPopup}>
              <FiX size={20} />
            </button>
            <div className="success-icon">
              <FiCheckCircle size={56} />
            </div>
            <h2>Payment Verified Successfully</h2>
            <p>
              Your order <strong>{successOrderId}</strong> has been placed successfully.
            </p>
            <p>Thank you for shopping with SmartAccessories!</p>
            <button className="btn-cart-primary" onClick={closeSuccessPopup}>
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
