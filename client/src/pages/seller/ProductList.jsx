import React, { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const ProductList = () => {
  const { t } = useTranslation();
  const { products, currency, axios, fetchProducts } = useAppContext();
  const [editModal, setEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: [],
    price: "",
    offerPrice: "",
    category: "",
  });

  const toggleStock = async (id, inStock) => {
    try {
      const { data } = await axios.post("/api/product/stock", { id, inStock });
      if (data.success) {
        fetchProducts();
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm(t("sellerProductList.confirmDelete") || "Bu ürünü silmek istediğinize emin misiniz?")) {
      return;
    }
    try {
      const { data } = await axios.post("/api/product/delete", { id });
      if (data.success) {
        fetchProducts();
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      offerPrice: product.offerPrice,
      category: product.category,
    });
    setEditModal(true);
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("id", editingProduct._id);
      formDataToSend.append("productData", JSON.stringify(formData));

      const { data } = await axios.post("/api/product/update", formDataToSend);
      if (data.success) {
        fetchProducts();
        toast.success(data.message);
        setEditModal(false);
        setEditingProduct(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
      <div className="w-full md:p-10 p-4">
        <h2 className="pb-4 text-lg font-medium">
          {t("sellerProductList.allProducts")}
        </h2>
        <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className="md:table-auto table-fixed w-full overflow-hidden">
            <thead className="text-gray-900 text-sm text-left">
              <tr>
                <th className="px-4 py-3 font-semibold truncate">
                  {t("sellerProductList.product")}
                </th>
                <th className="px-4 py-3 font-semibold truncate">
                  {t("sellerProductList.category")}
                </th>
                <th className="px-4 py-3 font-semibold truncate hidden md:table-cell">
                  Araç
                </th>
                <th className="px-4 py-3 font-semibold truncate hidden lg:table-cell">
                  {t("sellerProductList.sellingPrice")}
                </th>
                <th className="px-4 py-3 font-semibold truncate">
                  {t("sellerProductList.inStock")}
                </th>
                <th className="px-4 py-3 font-semibold truncate">
                  {t("sellerProductList.actions") || "İşlemler"}
                </th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {products.map((product) => (
                <tr key={product._id} className="border-t border-gray-500/20">
                  <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                    <div className="border border-gray-300 rounded p-2">
                      <img
                        src={product.image[0]}
                        alt="Product"
                        className="w-16"
                      />
                    </div>
                    <span className="truncate max-sm:hidden w-full">
                      {product.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">{product.category}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {product.car ? (
                      <div className="text-xs">
                        <div className="font-medium text-gray-900">{product.car.brand} {product.car.model}</div>
                        <div className="text-gray-500">{product.car.productionYears?.sort((a, b) => a - b).join(", ")}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {currency}
                    {product.offerPrice}
                  </td>
                  <td className="px-4 py-3">
                    <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                      <input
                        onClick={() =>
                          toggleStock(product._id, !product.inStock)
                        }
                        checked={product.inStock}
                        type="checkbox"
                        className="sr-only peer"
                      />
                      <div className="w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-200"></div>
                      <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                    </label>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition"
                      >
                        {t("sellerProductList.edit") || "Düzenle"}
                      </button>
                      <button
                        onClick={() => deleteProduct(product._id)}
                        className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
                      >
                        {t("sellerProductList.delete") || "Sil"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {t("sellerProductList.editProduct") || "Ürünü Düzenle"}
                </h2>
                <button
                  onClick={() => setEditModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <form onSubmit={updateProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("addProduct.productName") || "Ürün Adı"}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("addProduct.category") || "Kategori"}
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t("addProduct.price") || "Fiyat"}
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t("addProduct.offerPrice") || "İndirimli Fiyat"}
                    </label>
                    <input
                      type="number"
                      value={formData.offerPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, offerPrice: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("addProduct.description") || "Açıklama"}
                  </label>
                  <textarea
                    value={formData.description.join("\n")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value.split("\n"),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows="4"
                    placeholder="Her satıra bir özellik yazın"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setEditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {t("sellerProductList.cancel") || "İptal"}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    {t("sellerProductList.save") || "Kaydet"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
