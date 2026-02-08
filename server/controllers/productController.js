import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";

// Helper function to extract public_id from Cloudinary URL
const getPublicIdFromUrl = (url) => {
  try {
    // Cloudinary URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/image.jpg
    // or: https://res.cloudinary.com/cloud_name/image/upload/folder/image.jpg
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    
    const pathAfterUpload = parts[1];
    // Remove version if exists (v1234567890/)
    const pathWithoutVersion = pathAfterUpload.replace(/^v\d+\//, '');
    // Remove file extension
    const publicId = pathWithoutVersion.substring(0, pathWithoutVersion.lastIndexOf('.')) || pathWithoutVersion;
    
    return publicId;
  } catch (error) {
    console.error("Error extracting public_id:", error);
    return null;
  }
};

// Add Product : /api/product/add
export const addProduct = async (req, res) => {
  try {
    let productData = JSON.parse(req.body.productData);

    const images = req.files;

    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );

    await Product.create({ ...productData, image: imagesUrl });

    res.json({ success: true, message: "Product Added" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get Product : /api/product/list
export const productList = async (req, res) => {
  try {
    const products = await Product.find({}).populate('car');
    res.json({ success: true, products });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get single Product : /api/product/id
export const productById = async (req, res) => {
  try {
    const { id } = req.body;
    const product = await Product.findById(id).populate('car');
    res.json({ success: true, product });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Change Product inStock : /api/product/stock
export const changeStock = async (req, res) => {
  try {
    const { id, inStock } = req.body;
    await Product.findByIdAndUpdate(id, { inStock });
    res.json({ success: true, message: "Stock Updated" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Update Product : /api/product/update
export const updateProduct = async (req, res) => {
  try {
    const { id, existingImages } = req.body;
    let productData = JSON.parse(req.body.productData);

    // Mevcut ürünü kontrol et
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.json({ success: false, message: "Product not found" });
    }

    // Tutulacak mevcut resimler (frontend'den gelen)
    const imagesToKeep = existingImages ? JSON.parse(existingImages) : [];

    // Silinecek resimleri bul (eski resimlerde olup tutulacaklar listesinde olmayan)
    const imagesToDelete = existingProduct.image.filter(
      (img) => !imagesToKeep.includes(img)
    );

    // Cloudinary'den silinecek resimleri sil
    if (imagesToDelete.length > 0) {
      await Promise.all(
        imagesToDelete.map(async (imageUrl) => {
          const publicId = getPublicIdFromUrl(imageUrl);
          if (publicId) {
            try {
              await cloudinary.uploader.destroy(publicId);
            } catch (error) {
              console.error("Error deleting image from Cloudinary:", error);
            }
          }
        })
      );
    }

    // Yeni resimleri yükle
    let newImagesUrl = [];
    if (req.files && req.files.length > 0) {
      const images = req.files;
      newImagesUrl = await Promise.all(
        images.map(async (item) => {
          let result = await cloudinary.uploader.upload(item.path, {
            resource_type: "image",
          });
          return result.secure_url;
        })
      );
    }

    // Tutulacak eski resimler + yeni resimler
    productData.image = [...imagesToKeep, ...newImagesUrl];

    await Product.findByIdAndUpdate(id, productData);
    res.json({ success: true, message: "Product Updated" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Delete Product : /api/product/delete
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.body;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    // Cloudinary'den resimleri sil
    if (product.image && product.image.length > 0) {
      await Promise.all(
        product.image.map(async (imageUrl) => {
          const publicId = getPublicIdFromUrl(imageUrl);
          if (publicId) {
            try {
              await cloudinary.uploader.destroy(publicId);
            } catch (error) {
              console.error("Error deleting image from Cloudinary:", error);
            }
          }
        })
      );
    }

    await Product.findByIdAndDelete(id);
    res.json({ success: true, message: "Product Deleted" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
