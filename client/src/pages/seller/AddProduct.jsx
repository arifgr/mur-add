import React, { useState, useEffect } from "react";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

const AddProduct = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const editProduct = location.state?.editProduct;
  const isEditMode = !!editProduct;
  
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]); // Tutulacak mevcut resimler
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  // Car selection states
  const [cars, setCars] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedCarId, setSelectedCarId] = useState("");
  const [loadingCars, setLoadingCars] = useState(true);

  const { axios, navigate } = useAppContext();

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const { data } = await axios.get("/api/category");
        if (data.success) {
          setCategories(data.categories);
        } else {
          toast.error("Kategoriler yüklenemedi");
          console.error("Failed to fetch categories:", data.message);
        }
      } catch (error) {
        toast.error("Kategoriler yüklenirken hata oluştu");
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [axios]);

  // Fetch cars from API
  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoadingCars(true);
        const { data } = await axios.get("/api/car");
        if (data.success) {
          setCars(data.cars);
        } else {
          console.error("Failed to fetch cars:", data.message);
        }
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setLoadingCars(false);
      }
    };

    fetchCars();
  }, [axios]);

  // Load edit product data
  useEffect(() => {
    if (isEditMode && editProduct) {
      setName(editProduct.name);
      setDescription(editProduct.description.join("\n"));
      setCategory(editProduct.category);
      setPrice(editProduct.price.toString());
      setOfferPrice(editProduct.offerPrice.toString());
      
      // Set existing images
      if (editProduct.image) {
        setExistingImages(editProduct.image);
      }
      
      // Set car data if exists
      if (editProduct.car) {
        setSelectedCarId(editProduct.car._id);
        setSelectedBrand(editProduct.car.brand);
        setSelectedModel(editProduct.car.model);
        setSelectedYear(editProduct.car.productionYears.join(", "));
      }
    }
  }, [isEditMode, editProduct]);

  // Get unique brands
  const brands = [...new Set(cars.map(car => car.brand))].sort();

  // Get models for selected brand
  const models = selectedBrand
    ? [...new Set(cars.filter(car => car.brand === selectedBrand).map(car => car.model))].sort()
    : [];

  // Get cars (with production years sets) for selected brand and model
  const availableCars = selectedBrand && selectedModel
    ? cars
        .filter(car => car.brand === selectedBrand && car.model === selectedModel)
        .sort((a, b) => Math.min(...a.productionYears) - Math.min(...b.productionYears))
    : [];

  // Handle brand change
  const handleBrandChange = (e) => {
    setSelectedBrand(e.target.value);
    setSelectedModel("");
    setSelectedYear("");
    setSelectedCarId("");
  };

  // Handle model change
  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
    setSelectedYear("");
    setSelectedCarId("");
  };

  // Handle car selection (production years set)
  const handleCarChange = (e) => {
    const carId = e.target.value;
    setSelectedCarId(carId);
    if (carId) {
      const car = cars.find(c => c._id === carId);
      if (car) {
        setSelectedYear(car.productionYears.join(", "));
      }
    } else {
      setSelectedYear("");
    }
  };

  const removeExistingImage = (index) => {
    const updated = existingImages.filter((_, i) => i !== index);
    setExistingImages(updated);
  };

  const removeNewImage = (index) => {
    const updated = [...files];
    updated[index] = null;
    setFiles(updated);
  };

  const onSubmitHandler = async (event) => {
    try {
      event.preventDefault();

      const productData = {
        name,
        description: description.split("\n"),
        category,
        price,
        offerPrice,
        ...(selectedCarId && { car: selectedCarId }),
      };

      const formData = new FormData();
      formData.append("productData", JSON.stringify(productData));
      
      if (isEditMode) {
        formData.append("id", editProduct._id);
        // Tutulacak mevcut resimleri gönder
        formData.append("existingImages", JSON.stringify(existingImages));
      }
      
      // Yeni resimleri ekle (null olmayanlar)
      for (let i = 0; i < files.length; i++) {
        if (files[i]) {
          formData.append("images", files[i]);
        }
      }

      const endpoint = isEditMode ? "/api/product/update" : "/api/product/add";
      const { data } = await axios.post(endpoint, formData);

      if (data.success) {
        toast.success(data.message);
        if (isEditMode) {
          navigate("/seller/product-list");
        } else {
          setName("");
          setDescription("");
          setCategory("");
          setPrice("");
          setOfferPrice("");
          setFiles([]);
          setSelectedBrand("");
          setSelectedModel("");
          setSelectedYear("");
          setSelectedCarId("");
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
      <form
        onSubmit={onSubmitHandler}
        className="md:p-10 p-4 space-y-5 max-w-lg"
      >
        <div>
          <p className="text-base font-medium">{t("addProduct.image")}</p>
          
          {/* Mevcut Resimler */}
          {isEditMode && existingImages.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">{t("addProduct.currentImages")}</p>
              <div className="flex flex-wrap items-center gap-3">
                {existingImages.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={img}
                      alt={`Product ${idx + 1}`}
                      className="max-w-24 h-24 object-cover border rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Yeni Resim Ekleme */}
          <div className="mt-3">
            {isEditMode && <p className="text-sm text-gray-600 mb-2">{t("addProduct.addNewImages")}</p>}
            <div className="flex flex-wrap items-center gap-3">
              {Array(4)
                .fill("")
                .map((_, index) => (
                  <div key={index} className="relative">
                    <label htmlFor={`image${index}`}>
                      <input
                        onChange={(e) => {
                          const updatedFiles = [...files];
                          updatedFiles[index] = e.target.files[0];
                          setFiles(updatedFiles);
                        }}
                        type="file"
                        id={`image${index}`}
                        hidden
                      />

                      <img
                        className="max-w-24 cursor-pointer"
                        src={
                          files[index]
                            ? URL.createObjectURL(files[index])
                            : assets.upload_area
                        }
                        alt="uploadArea"
                        width={100}
                        height={100}
                      />
                    </label>
                    {files[index] && (
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="product-name">
            {t("addProduct.productName")}
          </label>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            id="product-name"
            type="text"
            placeholder={t("addProduct.typeHere")}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            required
          />
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label
            className="text-base font-medium"
            htmlFor="product-description"
          >
            {t("addProduct.description")}
          </label>
          <textarea
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            id="product-description"
            rows={4}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
            placeholder={t("addProduct.typeHere")}
          ></textarea>
        </div>
        <div className="w-full flex flex-col gap-1">
          <label className="text-base font-medium" htmlFor="category">
            {t("addProduct.category")}
          </label>
          <select
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            id="category"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            disabled={loadingCategories}
          >
            <option value="">
              {loadingCategories ? "Kategoriler yükleniyor..." : t("addProduct.selectCategory")}
            </option>
            {categories.map((item) => (
              <option key={item._id} value={item.path}>
                {item.text}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full flex flex-col gap-1">
          <label className="text-base font-medium" htmlFor="brand">
            Araç Markası (Opsiyonel)
          </label>
          <select
            onChange={handleBrandChange}
            value={selectedBrand}
            id="brand"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            disabled={loadingCars}
          >
            <option value="">
              {loadingCars ? "Markalar yükleniyor..." : "Marka Seçin"}
            </option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>
        {selectedBrand && (
          <div className="w-full flex flex-col gap-1">
            <label className="text-base font-medium" htmlFor="model">
              Araç Modeli
            </label>
            <select
              onChange={handleModelChange}
              value={selectedModel}
              id="model"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            >
              <option value="">Model Seçin</option>
              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
        )}
        {selectedModel && (
          <div className="w-full flex flex-col gap-1">
            <label className="text-base font-medium" htmlFor="car">
              Üretim Yılları
            </label>
            <select
              onChange={handleCarChange}
              value={selectedCarId}
              id="car"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            >
              <option value="">Üretim Yılları Seçin</option>
              {availableCars.map((car) => (
                <option key={car._id} value={car._id}>
                  {car.productionYears.sort((a, b) => a - b).join(", ")}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex-1 flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="product-price">
              {t("addProduct.price")}
            </label>
            <input
              onChange={(e) => setPrice(e.target.value)}
              value={price}
              id="product-price"
              type="number"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              required
            />
          </div>
          <div className="flex-1 flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="offer-price">
              {t("addProduct.offerPrice")}
            </label>
            <input
              onChange={(e) => setOfferPrice(e.target.value)}
              value={offerPrice}
              id="offer-price"
              type="number"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              required
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            type="submit"
            className="px-8 py-2.5 bg-primary text-white font-medium rounded cursor-pointer"
          >
            {isEditMode ? t("addProduct.update") : t("addProduct.add")}
          </button>
          {isEditMode && (
            <button 
              type="button"
              onClick={() => navigate("/seller/product-list")}
              className="px-8 py-2.5 bg-gray-500 text-white font-medium rounded cursor-pointer"
            >
              {t("addProduct.cancel")}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
