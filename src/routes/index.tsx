import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Upload,
  Trash2,
  Pencil,
  Save,
  Star,
  Settings,
  Package,
  Image as ImageIcon,
} from "lucide-react";
import { Category, Product, Review, WebDetails, categories } from "@/model/types";
import { uploadToCloudinary } from "@/util/cloudinary";
import { useEffect } from "react";
import { updateProduct, deleteProduct, createProduct, getProducts } from "@/service/productService";
import { getWebDetails, loginAdmin, saveWebDetails } from "@/service/userService";
export const Route = createFileRoute("/")({
  component: AdminPortal,
});
import { auth } from "@/service/firebase";
import { onAuthStateChanged } from "firebase/auth";

function AdminPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState<Category>("Figures");
  const [productPrice, setProductPrice] = useState("");
  const [previewImage, setPreviewImage] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>("Figures");
  const [reviewCategory, setReviewCategory] = useState<Category>("Figures");
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    image: "",
    file: null as File | null,
  });
  const [webDetails, setWebDetails] = useState<WebDetails>({
    whatsAppNumber: "",
    tikTokLink: "",
    instagramLink: "",
    gmailAddress: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      const data = await getProducts();
      setProducts(data);

      const details = await getWebDetails();

      if (details) {
        setWebDetails(details);
      }
    };

    loadProducts();
  }, []);

  const handleLogin = async () => {
    try {
      await loginAdmin(email, password);
    } catch (err) {
      console.error(err);
      alert("Invalid email or password");
    }
  };


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSaveProduct = async () => {
    try {
      if (!productName || !productPrice || !productCategory || !imageFile) {
        alert("Please fill all fields and upload image");
        return;
      }

      const uploaded = await uploadToCloudinary(imageFile);

      const productId = await createProduct({
        name: productName,
        category: productCategory,
        price: productPrice,
        imageUrl: uploaded.url,
        imagePublicId: uploaded.publicId,
      });

      const newProduct: Product = {
        id: productId,
        name: productName,
        category: productCategory,
        price: productPrice,
        image: uploaded.url,
        imagePublicId: uploaded.publicId,
      };

      setProducts((prev) => [...prev, newProduct]);

      setProductName("");
      setProductPrice("");
      setProductCategory("Figures");
      setPreviewImage("");
      setImageFile(null);

      alert("Product saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save product");
    }
  };

  const handleSaveWebDetails = async () => {
    try {
      let formattedNumber = webDetails.whatsAppNumber.trim();

      if (formattedNumber.startsWith("0")) {
        formattedNumber = `+94${formattedNumber.substring(1)}`;
      }

      await saveWebDetails({
        ...webDetails,
        whatsAppNumber: formattedNumber,
      });

      setWebDetails((prev) => ({
        ...prev,
        whatsAppNumber: formattedNumber,
      }));
      alert("Business details saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save business details");
    }
  };
  const handleUpdateProduct = async () => {
    if (!editingProductId) return;

    try {
      let imageUrl = editForm.image;
      let newPublicId: string | undefined = undefined;

      if (editForm.file) {
        const uploaded = await uploadToCloudinary(editForm.file);

        imageUrl = uploaded.url;
        newPublicId = uploaded.publicId;
      }

      const oldProduct = products.find((p) => p.id === editingProductId);

      await updateProduct(editingProductId, {
        name: editForm.name,
        price: editForm.price,
        imageUrl,
        imagePublicId: newPublicId,

        oldPublicId: editForm.file ? oldProduct?.imagePublicId : undefined,
      });

      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProductId
            ? {
                ...p,
                name: editForm.name,
                price: editForm.price,
                image: imageUrl,
                imagePublicId: newPublicId ?? p.imagePublicId,
              }
            : p,
        ),
      );

      setEditingProductId(null);
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  const handleRemoveProduct = async (id: string) => {
    try {
      const product = products.find((p) => p.id === id);

      if (!product) return;

      await deleteProduct(id, product.imagePublicId);

      // update UI
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    }
  };

  const handleRemoveReview = (id: string) => {
    setReviews((prev) => prev.filter((review) => review.id !== id));
  };

  const filteredProducts = products.filter((product) => product.category === selectedCategory);

  const filteredReviews = reviews.filter((review) => review.category === reviewCategory);

  const handleEditChange = (key: string, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleEditImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEditForm((prev) => ({
      ...prev,
      file,
      image: URL.createObjectURL(file),
    }));
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-full max-w-md rounded-3xl bg-zinc-900 p-8">
          <h1 className="text-3xl font-bold text-white mb-6">Admin Login</h1>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 rounded-xl bg-zinc-800 p-4 text-white"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 rounded-xl bg-zinc-800 p-4 text-white"
          />

          <button
            onClick={handleLogin}
            className="w-full rounded-xl bg-white py-4 font-semibold text-black"
          >
            Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="border-b border-zinc-800 bg-zinc-900 px-8 py-6">
        <h1 className="text-3xl font-bold">FiguraLK Admin Portal</h1>

        <p className="mt-2 text-sm text-zinc-400">
          Manage products, customer reviews and business details
        </p>
      </div>

      <div className="space-y-8 p-8">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();

              const form = e.currentTarget;

              if (!form.checkValidity()) {
                form.reportValidity();
                return;
              }

              handleSaveProduct();
            }}
          >
            <div className="mb-8 flex items-center gap-3">
              <Upload className="text-white" />

              <h2 className="text-2xl font-semibold">Upload Product</h2>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* IMAGE UPLOAD */}
              <div>
                <label className="mb-3 block text-sm text-zinc-400">Product Image</label>

                <input
                  type="file"
                  id="productImage"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute opacity-0 w-0 h-0"
                  required
                />

                <label
                  htmlFor="productImage"
                  className="flex h-[320px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-zinc-700 bg-zinc-950 transition hover:border-white"
                >
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <>
                      <ImageIcon size={50} className="text-zinc-500" />

                      <p className="mt-4 text-zinc-400">Click here to upload image</p>
                    </>
                  )}
                </label>
              </div>

              {/* FORM */}
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm text-zinc-400">Product Name</label>

                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                    placeholder="Enter product name"
                    className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-4 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">Select Category</label>

                  <select
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value as Category)}
                    required
                    className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-4 outline-none"
                  >
                    {categories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">Price</label>

                  <input
                    type="text"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    required
                    placeholder="Rs. 5000"
                    className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-4 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-4 font-semibold text-black transition hover:opacity-90"
                >
                  <Save size={18} />
                  Save Product
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* PRODUCT MANAGE */}

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Package />

              <h2 className="text-2xl font-semibold">Manage Products</h2>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category)}
              className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
            >
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950"
              >
                {/* ================= EDIT MODE ================= */}
                {editingProductId === product.id ? (
                  <div className="p-5 space-y-4">
                    {/* HIDDEN FILE INPUT */}
                    <input
                      id={`edit-image-${product.id}`}
                      type="file"
                      accept="image/*"
                      onChange={handleEditImage}
                      className="hidden"
                    />

                    {/* IMAGE PREVIEW */}
                    {editForm.image && (
                      <img
                        src={editForm.image}
                        className="h-[240px] w-full object-cover rounded-xl"
                      />
                    )}

                    {/* CUSTOM BUTTON */}
                    <label
                      htmlFor={`edit-image-${product.id}`}
                      className="inline-block cursor-pointer bg-zinc-800 text-white px-4 py-2 rounded-xl hover:bg-zinc-700"
                    >
                      Change Image
                    </label>

                    {/* NAME EDIT */}
                    <input
                      value={editForm.name}
                      onChange={(e) => handleEditChange("name", e.target.value)}
                      className="w-full p-3 rounded-xl bg-zinc-900"
                      placeholder="Product Name"
                    />

                    {/* PRICE EDIT */}
                    <input
                      value={editForm.price}
                      onChange={(e) => handleEditChange("price", e.target.value)}
                      className="w-full p-3 rounded-xl bg-zinc-900"
                      placeholder="Price"
                    />

                    {/* ACTIONS */}
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateProduct}
                        className="flex-1 bg-white text-black py-2 rounded-xl font-medium"
                      >
                        Save
                      </button>

                      <button
                        onClick={() => setEditingProductId(null)}
                        className="flex-1 border border-zinc-600 py-2 rounded-xl"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ================= VIEW MODE ================= */
                  <>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-[260px] w-full object-cover"
                    />

                    <div className="p-5">
                      <h3 className="text-xl font-semibold">{product.name}</h3>

                      <p className="mt-2 text-zinc-400">{product.price}</p>

                      <p className="mt-1 text-sm text-zinc-500">{product.category}</p>

                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={() => {
                            setEditingProductId(product.id);
                            setEditForm({
                              name: product.name,
                              price: product.price,
                              image: product.image,
                              file: null,
                            });
                          }}
                          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 font-medium text-black"
                        >
                          <Pencil size={16} />
                          Update
                        </button>

                        <button
                          onClick={() => handleRemoveProduct(product.id)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-red-500 px-4 py-3 font-medium text-red-500"
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ACCOUNT DETAILS */}

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <div className="mb-8 flex items-center gap-3">
            <Settings />

            <h2 className="text-2xl font-semibold">Business Account Details</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-zinc-400">WhatsApp Number</label>

              <input
                type="text"
                value={webDetails.whatsAppNumber}
                onChange={(e) =>
                  setWebDetails((prev) => ({
                    ...prev,
                    whatsAppNumber: e.target.value,
                  }))
                }
                placeholder="+94 77 123 4567"
                className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-4 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">TikTok Link</label>

              <input
                type="text"
                value={webDetails.tikTokLink}
                onChange={(e) =>
                  setWebDetails((prev) => ({
                    ...prev,
                    tikTokLink: e.target.value,
                  }))
                }
                placeholder="https://facebook.com/..."
                className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-4 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">Instagram Link</label>

              <input
                type="text"
                value={webDetails.instagramLink}
                onChange={(e) =>
                  setWebDetails((prev) => ({
                    ...prev,
                    instagramLink: e.target.value,
                  }))
                }
                placeholder="https://instagram.com/..."
                className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-4 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">Gmail Address</label>

              <input
                type="email"
                value={webDetails.gmailAddress}
                onChange={(e) =>
                  setWebDetails((prev) => ({
                    ...prev,
                    gmailAddress: e.target.value,
                  }))
                }
                placeholder="business@gmail.com"
                className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-4 outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleSaveWebDetails}
            className="mt-6 rounded-2xl bg-white px-6 py-4 font-semibold text-black"
          >
            Save Changes
          </button>
        </section>

        {/* CUSTOMER REVIEWS */}

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Star />

              <h2 className="text-2xl font-semibold">Customer Reviews</h2>
            </div>

            <select
              value={reviewCategory}
              onChange={(e) => setReviewCategory(e.target.value as Category)}
              className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
            >
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="space-y-5">
            {filteredReviews.map((review) => (
              <div key={review.id} className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{review.name}</h3>

                    <p className="mt-1 text-sm text-zinc-500">{review.category}</p>
                  </div>

                  <button
                    onClick={() => handleRemoveReview(review.id)}
                    className="rounded-xl border border-red-500 px-4 py-2 text-red-500"
                  >
                    Remove
                  </button>
                </div>

                <p className="mt-4 text-zinc-300">{review.review}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
