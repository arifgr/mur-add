import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useTranslation } from "react-i18next";

const ProductCategory = () => {
  const { products, axios } = useAppContext();
  const { category } = useParams();
  const { t } = useTranslation();
  const [currentCategory, setCurrentCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch category details
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/category/${category}`);
        if (data.success) {
          setCurrentCategory(data.category);
        } else {
          console.error("Category not found:", data.message);
          setCurrentCategory(null);
        }
      } catch (error) {
        console.error("Error fetching category:", error);
        setCurrentCategory(null);
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchCategory();
    }
  }, [category, axios]);

  const filteredProducts = products.filter(
    (product) => product.category.toLowerCase() === category
  );

  if (loading) {
    return (
      <div className="mt-16">
        <div className="flex flex-col items-end w-max">
          <div className="w-48 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-16 h-0.5 bg-gray-200 rounded-full mt-2"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 mt-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16">
      {currentCategory && (
        <div className="flex flex-col items-end w-max">
          <p className="text-2xl font-medium">
            {currentCategory.text.toUpperCase()}
          </p>
          <div className="w-16 h-0.5 bg-primary rounded-full"></div>
        </div>
      )}
      {!currentCategory && !loading && (
        <div className="flex flex-col items-end w-max">
          <p className="text-2xl font-medium">
            {category.toUpperCase()}
          </p>
          <div className="w-16 h-0.5 bg-primary rounded-full"></div>
        </div>
      )}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 mt-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-2xl font-medium text-primary">
            {t("No products found in this category.")}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductCategory;
