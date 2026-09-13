import React, { useState, useEffect } from 'react';
import AdminNav from '../components/AdminNav';
import { API_URL as BASE_URL } from '../config';
import { getImageUrl } from '../utils/imageUrl';

const API_URL = `${BASE_URL}/api/products`;
const UPLOAD_URL = `${BASE_URL}/api/upload`;
const CATEGORY_URL = `${BASE_URL}/api/categories`;
const defaultCategories = ['School Bag', 'College Bag', 'Handbag', 'Lunch Bag', 'Travel Bag'];

function Admin() {
  const [authenticated] = useState(localStorage.getItem('isAdmin') === 'true');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(defaultCategories);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: '', category: 'School Bag', price: '', stock: '',
    length: '', width: '', height: '', material: '', color: '', warranty: '',
  });

  useEffect(() => {
    if (authenticated) {
      fetchProducts();
      fetchCategories();
    }
  }, [authenticated]);

  function fetchProducts() {
    setLoading(true);
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }

  function fetchCategories() {
    fetch(CATEGORY_URL)
      .then((res) => res.json())
      .then((data) => {
        const fetched = data.map((c) => c.name);
        setCategories([...new Set([...defaultCategories, ...fetched])]);
      })
      .catch(() => setCategories(defaultCategories));
  }

  function handleFormChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleImageSelect(e) {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  }

  async function uploadImages() {
    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append('images', file));

    const res = await fetch(UPLOAD_URL, { method: 'POST', body: formData });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Image upload failed.');
    }
    const data = await res.json();
    return data.urls;
  }

  function startEdit(product) {
    setEditingId(product._id);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      length: product.dimensions.length,
      width: product.dimensions.width,
      height: product.dimensions.height,
      material: product.material,
      color: product.color,
      warranty: product.warranty,
    });
    setExistingImages(product.images);
    setSelectedFiles([]);
    setImagePreviews([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({
      name: '', category: 'School Bag', price: '', stock: '',
      length: '', width: '', height: '', material: '', color: '', warranty: '',
    });
    setExistingImages([]);
    setSelectedFiles([]);
    setImagePreviews([]);
    setNewCategoryInput('');
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!editingId && selectedFiles.length === 0) {
      alert('Please select at least one photo.');
      return;
    }

    let finalCategory = form.category;

    if (form.category === '__new__') {
      if (!newCategoryInput.trim()) {
        alert('Type a name for the new category.');
        return;
      }
      finalCategory = newCategoryInput.trim();
      try {
        await fetch(CATEGORY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: finalCategory }),
        });
      } catch (err) {
        // If it already exists or fails silently, we still proceed using the typed name.
      }
    }

    try {
      setUploading(true);

      let imageUrls = existingImages;
      if (selectedFiles.length > 0) {
        imageUrls = await uploadImages();
      }

      const productData = {
        name: form.name,
        category: finalCategory,
        price: Number(form.price),
        stock: Number(form.stock),
        dimensions: {
          length: Number(form.length),
          width: Number(form.width),
          height: Number(form.height),
        },
        material: form.material,
        color: form.color,
        warranty: form.warranty,
        images: imageUrls,
      };

      const url = editingId ? `${API_URL}/${editingId}` : API_URL;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (!res.ok) throw new Error(editingId ? 'Failed to update product.' : 'Failed to add product.');

      alert(editingId ? 'Product updated.' : 'Product added.');
      cancelEdit();
      fetchProducts();
      fetchCategories();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setUploading(false);
    }
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this product?')) return;

    fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      .then((res) => res.json())
      .then(() => fetchProducts())
      .catch((err) => alert('Error deleting product: ' + err.message));
  }

  if (!authenticated) {
    return <div className="admin-login"><p>Access denied. Please log in as admin.</p></div>;
  }

  return (
    <div className="admin-page">
      <AdminNav />
      <h2>Admin — Manage Bags</h2>

      <form className="admin-form" onSubmit={handleSubmit}>
        <h3>{editingId ? 'Edit Bag' : 'Add New Bag'}</h3>

        <div className="form-group">
          <label>Name</label>
          <input type="text" name="name" value={form.name} onChange={handleFormChange} required />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select name="category" value={form.category} onChange={handleFormChange}>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            <option value="__new__">+ Add new category</option>
          </select>
          {form.category === '__new__' && (
            <input
              type="text"
              placeholder="New category name"
              value={newCategoryInput}
              onChange={(e) => setNewCategoryInput(e.target.value)}
              style={{ marginTop: '8px' }}
            />
          )}
        </div>

        <div className="form-group">
          <label>Price (₹)</label>
          <input type="number" name="price" value={form.price} onChange={handleFormChange} required />
        </div>

        <div className="form-group">
          <label>Stock</label>
          <input type="number" name="stock" value={form.stock} onChange={handleFormChange} required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Length (cm)</label>
            <input type="number" name="length" value={form.length} onChange={handleFormChange} required />
          </div>
          <div className="form-group">
            <label>Width (cm)</label>
            <input type="number" name="width" value={form.width} onChange={handleFormChange} required />
          </div>
          <div className="form-group">
            <label>Height (cm)</label>
            <input type="number" name="height" value={form.height} onChange={handleFormChange} required />
          </div>
        </div>

        <div className="form-group">
          <label>Material</label>
          <input type="text" name="material" value={form.material} onChange={handleFormChange} required />
        </div>

        <div className="form-group">
          <label>Color</label>
          <input type="text" name="color" value={form.color} onChange={handleFormChange} required />
        </div>

        <div className="form-group">
          <label>Warranty</label>
          <input type="text" name="warranty" value={form.warranty} onChange={handleFormChange} required />
        </div>

        <div className="form-group">
          <label>Product Photos {editingId ? '(leave empty to keep current photos)' : '(up to 6, multiple angles)'}</label>
          <input type="file" accept="image/*" multiple onChange={handleImageSelect} />

          {editingId && existingImages.length > 0 && selectedFiles.length === 0 && (
            <div className="image-preview-row">
              {existingImages.map((src, index) => (
                <img key={index} src={getImageUrl(src)} alt={`current-${index}`} className="admin-thumb" />
              ))}
            </div>
          )}

          {imagePreviews.length > 0 && (
            <div className="image-preview-row">
              {imagePreviews.map((src, index) => (
                <img key={index} src={src} alt={`preview-${index}`} className="admin-thumb" />
              ))}
            </div>
          )}

          {uploading && <p className="uploading-text">Saving...</p>}
        </div>

        <div className="admin-form-buttons">
          <button type="submit" className="admin-submit-btn" disabled={uploading}>
            {uploading ? 'Saving...' : editingId ? 'Save Changes' : 'Add Bag'}
          </button>
          {editingId && (
            <button type="button" className="admin-cancel-btn" onClick={cancelEdit}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <h3>Current Bags ({products.length})</h3>

      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p>No bags added yet.</p>
      ) : (
        <div className="admin-product-list">
          {products.map((p) => (
            <div className="admin-product-card" key={p._id}>
              <img src={getImageUrl(p.images[0])} alt={p.name} className="admin-thumb" />
              <div className="admin-product-info">
                <p className="admin-product-name">{p.name}</p>
                <p className="admin-product-meta">{p.category} · {p.color} · ₹{p.price} · Stock: {p.stock}</p>
                <p className="admin-product-meta">
                  {p.dimensions.length}×{p.dimensions.width}×{p.dimensions.height} cm · {p.material} · {p.warranty}
                </p>
              </div>
              <div className="admin-product-buttons">
                <button onClick={() => startEdit(p)} className="admin-edit-btn">Edit</button>
                <button onClick={() => handleDelete(p._id)} className="admin-delete-btn">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Admin;