import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({ name: '', price: '', description: '' });
  const { currentUser, logout, api } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (currentUser) {
      fetchProducts();
    }
  }, [currentUser]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (err) {
      showToast('Could not load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', price: '', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({ name: product.name, price: product.price, description: product.description });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      showToast('Product deleted successfully');
      fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price)
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }

      showToast(`Product ${editingProduct ? 'updated' : 'added'} successfully`);
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save product', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!currentUser) return null;

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">
          <i className="fa-solid fa-microchip"></i>
          <h1>ElectroSync</h1>
        </div>
        <div className="nav-actions">
          <div className="user-info">
            <i className="fa-solid fa-user-circle"></i>
            <span>{currentUser.username}</span>
          </div>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme" title="Toggle Theme">
            <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
          <button className="btn btn-secondary" onClick={handleLogout} title="Logout" style={{ padding: '0.5rem 1rem' }}>
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </header>

      <main className="main-content">
        <section className="hero-section">
          <h2>Manage Products</h2>
          <p>Add, update, or remove electronics products from the global database.</p>
          <button className="btn btn-primary" onClick={openAddModal}>
            <i className="fa-solid fa-plus"></i> Add New Product
          </button>
        </section>

        <section className="products-section">
          <div className="products-grid">
            {loading ? (
              <div className="loading-spinner">
                <i className="fa-solid fa-circle-notch fa-spin"></i>
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <i className="fa-solid fa-box-open"></i>
                <p>No products found. Add some to get started!</p>
              </div>
            ) : (
              products.map((product, index) => (
                <div key={product.id} className="product-card" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="product-header">
                    <h3 className="product-title">{product.name}</h3>
                  </div>
                  <div className="product-price">${product.price.toFixed(2)}</div>
                  <p className="product-desc">{product.description}</p>
                  <div className="product-actions">
                    <button className="icon-btn edit" onClick={() => openEditModal(product)} title="Edit">
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button className="icon-btn delete" onClick={() => handleDelete(product.id)} title="Delete">
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content glass-effect" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Product Name</label>
                <input type="text" id="name" required value={formData.name} onChange={handleInputChange} placeholder="e.g. Quantum Laptop X1" />
              </div>
              <div className="form-group">
                <label htmlFor="price">Price ($)</label>
                <input type="number" id="price" required step="0.01" min="0" value={formData.price} onChange={handleInputChange} placeholder="e.g. 1999.99" />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea id="description" required rows="4" value={formData.description} onChange={handleInputChange} placeholder="Enter product details..."></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast ${toast.type}`}>
          <i className={`fa-solid ${toast.type === 'error' ? 'fa-circle-exclamation' : 'fa-check-circle'} toast-icon`}></i>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
