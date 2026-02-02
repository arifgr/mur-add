import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import ProductCard from "../components/ProductCard";
import toast from "react-hot-toast";

const AllProducts = () => {
  const { products, searchQuery, axios } = useAppContext();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  // Car filters
  const [selectedCarBrand, setSelectedCarBrand] = useState("");
  const [selectedCarModel, setSelectedCarModel] = useState("");
  const [selectedCarYear, setSelectedCarYear] = useState("");
  const [showCarFilters, setShowCarFilters] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const { data } = await axios.get("/api/category");
        if (data.success) {
          setCategories(data.categories);
        } else {
          console.error("Failed to fetch categories:", data.message);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [axios]);

  useEffect(() => {
    let filtered = products;

    // Filter by search query
    if (searchQuery.length > 0) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }

    // Filter by car brand
    if (selectedCarBrand) {
      filtered = filtered.filter((product) => product.car && product.car.brand === selectedCarBrand);
    }

    // Filter by car model
    if (selectedCarModel) {
      filtered = filtered.filter((product) => product.car && product.car.model === selectedCarModel);
    }

    // Filter by car year
    if (selectedCarYear) {
      filtered = filtered.filter((product) => 
        product.car && product.car.productionYears && 
        product.car.productionYears.includes(parseInt(selectedCarYear))
      );
    }

    setFilteredProducts(filtered);

    // Check if filtered products have car info
    const hasCars = filtered.some(product => product.car);
    setShowCarFilters(hasCars && selectedCategory);
  }, [products, searchQuery, selectedCategory, selectedCarBrand, selectedCarModel, selectedCarYear]);

  // Reset car filters when category changes
  useEffect(() => {
    setSelectedCarBrand("");
    setSelectedCarModel("");
    setSelectedCarYear("");
  }, [selectedCategory]);

  // Get unique car brands from filtered products
  const availableBrands = [...new Set(
    filteredProducts
      .filter(p => p.car && p.car.brand)
      .map(p => p.car.brand)
  )].sort();

  // Get unique car models for selected brand
  const availableModels = selectedCarBrand
    ? [...new Set(
        filteredProducts
          .filter(p => p.car && p.car.brand === selectedCarBrand && p.car.model)
          .map(p => p.car.model)
      )].sort()
    : [];

  // Get unique years for selected brand and model
  const availableYears = (selectedCarBrand && selectedCarModel)
    ? Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i)
    : [];

  return (
    <div className="mt-16 flex flex-col">
      <div className="flex flex-col items-end w-max">
        <p className="text-2xl font-medium uppercase">All products</p>
        <div className="w-16 h-0.5 bg-primary rounded-full"></div>
      </div>

      <div className="flex gap-6 mt-6">
        {/* Category Filter Sidebar */}
        <div className="hidden md:flex flex-col gap-2 min-w-[200px]">
          <h3 className="text-lg font-medium mb-2">Kategoriler</h3>
          <button
            onClick={() => setSelectedCategory("")}
            className={`text-left px-4 py-2 rounded-md transition-colors ${
              selectedCategory === ""
                ? "bg-primary text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            Tümü
          </button>
          {loadingCategories ? (
            <div className="px-4 py-2 text-gray-500 text-sm">Yükleniyor...</div>
          ) : (
            categories.map((category) => (
              <button
                key={category._id}
                onClick={() => setSelectedCategory(category.path)}
                className={`text-left px-4 py-2 rounded-md transition-colors ${
                  selectedCategory === category.path
                    ? "bg-primary text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {category.text}
              </button>
            ))
          )}

          {/* Car Filters */}
          {showCarFilters && (
            <>
              <div className="mt-6 pt-6 border-t border-gray-300">
                <h3 className="text-lg font-medium mb-2">Araç Filtresi</h3>
                
                {/* Brand Filter */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marka
                  </label>
                  <select
                    value={selectedCarBrand}
                    onChange={(e) => {
                      setSelectedCarBrand(e.target.value);
                      setSelectedCarModel("");
                      setSelectedCarYear("");
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="">Tüm Markalar</option>
                    {availableBrands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Model Filter */}
                {selectedCarBrand && (
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model
                    </label>
                    <select
                      value={selectedCarModel}
                      onChange={(e) => {
                        setSelectedCarModel(e.target.value);
                        setSelectedCarYear("");
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    >
                      <option value="">Tüm Modeller</option>
                      {availableModels.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Year Filter */}
                {selectedCarModel && (
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Üretim Yılı
                    </label>
                    <select
                      value={selectedCarYear}
                      onChange={(e) => setSelectedCarYear(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    >
                      <option value="">Tüm Yıllar</option>
                      {availableYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Clear Car Filters */}
                {(selectedCarBrand || selectedCarModel || selectedCarYear) && (
                  <button
                    onClick={() => {
                      setSelectedCarBrand("");
                      setSelectedCarModel("");
                      setSelectedCarYear("");
                    }}
                    className="w-full mt-2 px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                  >
                    Filtreleri Temizle
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile Category Filter */}
        <div className="md:hidden w-full mb-4 space-y-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Tüm Kategoriler</option>
            {categories.map((category) => (
              <option key={category._id} value={category.path}>
                {category.text}
              </option>
            ))}
          </select>

          {/* Mobile Car Filters */}
          {showCarFilters && (
            <>
              <select
                value={selectedCarBrand}
                onChange={(e) => {
                  setSelectedCarBrand(e.target.value);
                  setSelectedCarModel("");
                  setSelectedCarYear("");
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Tüm Markalar</option>
                {availableBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>

              {selectedCarBrand && (
                <select
                  value={selectedCarModel}
                  onChange={(e) => {
                    setSelectedCarModel(e.target.value);
                    setSelectedCarYear("");
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Tüm Modeller</option>
                  {availableModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              )}

              {selectedCarModel && (
                <select
                  value={selectedCarYear}
                  onChange={(e) => setSelectedCarYear(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Tüm Yıllar</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              )}

              {(selectedCarBrand || selectedCarModel || selectedCarYear) && (
                <button
                  onClick={() => {
                    setSelectedCarBrand("");
                    setSelectedCarModel("");
                    setSelectedCarYear("");
                  }}
                  className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                >
                  Araç Filtrelerini Temizle
                </button>
              )}
            </>
          )}
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {filteredProducts
              .filter((product) => product.inStock)
              .map((product, index) => (
                <ProductCard key={index} product={product} />
              ))}
          </div>
          {filteredProducts.filter((product) => product.inStock).length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Bu kategoride ürün bulunamadı
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllProducts;
