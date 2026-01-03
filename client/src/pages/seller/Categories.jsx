import React, { useState, useEffect, useCallback } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { assets } from "../../assets/assets";

const Categories = () => {
  const { axios } = useAppContext();
  const [categories, setCategories] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    text: "",
    path: "",
  });
  const [loading, setLoading] = useState(false);

  // Fetch categories from server
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/category");
      if (data.success) {
        setCategories(data.categories);
      } else {
        toast.error(data.message || "Kategoriler yüklenemedi");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Kategoriler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  }, [axios]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.text.trim() || !formData.path.trim()) {
      toast.error("Lütfen tüm alanları doldurun");
      return;
    }

    try {
      setLoading(true);
      
      if (editingCategory) {
        // Update category
        const { data } = await axios.put(`/api/category/${editingCategory._id}`, formData);
        if (data.success) {
          toast.success("Kategori güncellendi");
          fetchCategories();
          resetForm();
        } else {
          toast.error(data.message || "Kategori güncellenirken hata oluştu");
        }
      } else {
        // Create new category
        const { data } = await axios.post("/api/category", formData);
        if (data.success) {
          toast.success("Kategori eklendi");
          fetchCategories();
          resetForm();
        } else {
          toast.error(data.message || "Kategori eklenirken hata oluştu");
        }
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Kategori kaydedilirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({ text: "", path: "" });
    setEditingCategory(null);
    setShowAddForm(false);
  };

  // Handle edit
  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      text: category.text,
      path: category.path,
    });
    setShowAddForm(true);
  };

  // Handle delete
  const handleDelete = async (categoryId) => {
    if (!confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.delete(`/api/category/${categoryId}`);
      if (data.success) {
        toast.success("Kategori silindi");
        fetchCategories();
      } else {
        toast.error(data.message || "Kategori silinirken hata oluştu");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Kategori silinirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Generate path from text
  const generatePath = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  // Handle text change and auto-generate path
  const handleTextChange = (e) => {
    const text = e.target.value;
    setFormData(prev => ({
      ...prev,
      text,
      path: generatePath(text)
    }));
  };

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-10 p-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Kategoriler</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 flex items-center gap-2"
            disabled={loading}
          >
            <img src={assets.add_icon} alt="Add" className="w-4 h-4 filter invert" />
            Kategori Ekle
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white border border-gray-300 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-medium">
              {editingCategory ? "Kategori Düzenle" : "Yeni Kategori Ekle"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori Adı
                </label>
                <input
                  type="text"
                  value={formData.text}
                  onChange={handleTextChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Kategori adını girin"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Yolu
                </label>
                <input
                  type="text"
                  value={formData.path}
                  onChange={(e) => setFormData(prev => ({ ...prev, path: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="URL yolu (örn: elektronik)"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? "Kaydediliyor..." : (editingCategory ? "Güncelle" : "Kaydet")}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  disabled={loading}
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories List */}
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          {loading && categories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Kategoriler yükleniyor...</div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Henüz kategori bulunmuyor. Yeni kategori ekleyebilirsiniz.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori Adı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL Yolu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Oluşturulma Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {category.text}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.path}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        category.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(category.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-900"
                        disabled={loading}
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={loading}
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
