import React, { useState, useEffect, useCallback } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { assets } from "../../assets/assets";
import { useTranslation } from "react-i18next";

const Cars = () => {
  const { axios } = useAppContext();
  const { t } = useTranslation();
  const [cars, setCars] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    productionYears: "",
  });
  const [loading, setLoading] = useState(false);

  // Fetch cars from server
  const fetchCars = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/car");
      if (data.success) {
        setCars(data.cars);
      } else {
        toast.error(data.message || t("sellerCars.loadError"));
      }
    } catch (error) {
      console.error("Error fetching cars:", error);
      toast.error(t("sellerCars.loadError"));
    } finally {
      setLoading(false);
    }
  }, [axios]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.brand.trim() || !formData.model.trim() || !formData.productionYears.trim()) {
      toast.error(t("sellerCars.fillAllFields"));
      return;
    }

    // Parse production years
    const yearsArray = formData.productionYears
      .split(",")
      .map(year => parseInt(year.trim()))
      .filter(year => !isNaN(year) && year > 1900 && year <= new Date().getFullYear() + 1);

    if (yearsArray.length === 0) {
      toast.error(t("sellerCars.enterValidYears"));
      return;
    }

    const carData = {
      brand: formData.brand.trim(),
      model: formData.model.trim(),
      productionYears: yearsArray,
    };

    try {
      setLoading(true);
      
      if (editingCar) {
        // Update car
        const { data } = await axios.put(`/api/car/${editingCar._id}`, carData);
        if (data.success) {
          toast.success(t("sellerCars.carUpdated"));
          fetchCars();
          resetForm();
        } else {
          toast.error(data.message || t("sellerCars.saveError"));
        }
      } else {
        // Create new car
        const { data } = await axios.post("/api/car", carData);
        if (data.success) {
          toast.success(t("sellerCars.carAdded"));
          fetchCars();
          resetForm();
        } else {
          toast.error(data.message || t("sellerCars.saveError"));
        }
      }
    } catch (error) {
      console.error("Error saving car:", error);
      toast.error(error.response?.data?.message || t("sellerCars.saveError"));
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({ brand: "", model: "", productionYears: "" });
    setEditingCar(null);
    setShowAddForm(false);
  };

  // Handle edit
  const handleEdit = (car) => {
    setEditingCar(car);
    setFormData({
      brand: car.brand,
      model: car.model,
      productionYears: car.productionYears.join(", "),
    });
    setShowAddForm(true);
  };

  // Handle delete
  const handleDelete = async (carId) => {
    if (!confirm(t("sellerCars.deleteConfirm"))) {
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.delete(`/api/car/${carId}`);
      if (data.success) {
        toast.success(t("sellerCars.carDeleted"));
        fetchCars();
      } else {
        toast.error(data.message || t("sellerCars.deleteError"));
      }
    } catch (error) {
      console.error("Error deleting car:", error);
      toast.error(t("sellerCars.deleteError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-10 p-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">{t("sellerCars.title")}</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 flex items-center gap-2"
            disabled={loading}
          >
            <img src={assets.add_icon} alt="Add" className="w-4 h-4 filter invert" />
            {t("sellerCars.addCar")}
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white border border-gray-300 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-medium">
              {editingCar ? t("sellerCars.editCar") : t("sellerCars.newCar")}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("sellerCars.brand")}
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={t("sellerCars.brandPlaceholder")}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("sellerCars.model")}
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={t("sellerCars.modelPlaceholder")}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("sellerCars.productionYears")}
                </label>
                <input
                  type="text"
                  value={formData.productionYears}
                  onChange={(e) => setFormData(prev => ({ ...prev, productionYears: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={t("sellerCars.productionYearsPlaceholder")}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t("sellerCars.productionYearsHelper")}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? t("sellerCars.saving") : (editingCar ? t("sellerCars.update") : t("sellerCars.save"))}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  disabled={loading}
                >
                  {t("sellerCars.cancel")}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Cars List */}
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          {loading && cars.length === 0 ? (
            <div className="p-8 text-center text-gray-500">{t("sellerCars.loading")}</div>
          ) : cars.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {t("sellerCars.noCars")}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("sellerCars.brand")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("sellerCars.model")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("sellerCars.productionYears")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("sellerCars.createdAt")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("sellerCars.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cars.map((car) => (
                  <tr key={car._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {car.brand}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {car.model}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {car.productionYears.sort((a, b) => a - b).join(", ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(car.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(car)}
                        className="text-blue-600 hover:text-blue-900"
                        disabled={loading}
                      >
                        {t("sellerCars.edit")}
                      </button>
                      <button
                        onClick={() => handleDelete(car._id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={loading}
                      >
                        {t("sellerCars.delete")}
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

export default Cars;
