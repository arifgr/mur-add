import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../context/AppContext";

export const Categories = () => {
  const { navigate, axios } = useAppContext();
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/api/category");
        if (data.success) {
          setCategories(data.categories);
        } else {
          console.error("Failed to fetch categories:", data.message);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [axios]);

  if (loading) {
    return (
      <div className="mt-16">
        <p className="text-2xl md:text-3xl font-medium">{t("categories")}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 mt-6 gap-6">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="py-5 px-3 gap-2 rounded-lg flex flex-col justify-center items-center bg-gray-100 animate-pulse"
            >
              <div className="w-28 h-20 bg-gray-200 rounded"></div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16">
      <p className="text-2xl md:text-3xl font-medium">{t("categories")}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 mt-6 gap-6">
        {categories.map((category) => (
          <div
            key={category._id}
            className="group cursor-pointer py-5 px-3 gap-2 rounded-lg flex flex-col justify-center items-center bg-gray-50 hover:bg-gray-100 transition-colors"
            onClick={() => {
              navigate(`/products/${category.path.toLowerCase()}`);
              window.scrollTo(0, 0);
            }}
          >
            {/* Placeholder icon for now - you can add category icons later */}
            <div className="w-20 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="text-primary font-semibold text-lg">
                {category.text.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-sm font-medium text-center">{category.text}</p>
          </div>
        ))}
      </div>
      {categories.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">Henüz kategori bulunmuyor.</p>
        </div>
      )}
    </div>
  );
};
