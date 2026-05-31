import { db } from "./firebase";
import { collection, addDoc, getDocs, updateDoc,doc,deleteDoc } from "firebase/firestore";

export type ProductPayload = {
  name: string;
  category: string;
  price: string;
  imageUrl: string;
  imagePublicId: string; 
};
export const createProduct = async (payload: ProductPayload) => {
  const docRef = await addDoc(collection(db, "products"), {
    ...payload,
    createdAt: new Date(),
  });

  return docRef.id;
};

export const getProducts = async () => {
  const snapshot = await getDocs(collection(db, "products"));

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    console.log("data", data);

    return {
      id: doc.id,
      name: data.name,
      category: data.category,
      price: data.price,
      image: data.imageUrl,
      imagePublicId: data.imagePublicId, 
    };
  });
};

export const updateProduct = async (
  id: string,
  data: Partial<ProductPayload> & {
    oldPublicId?: string;
  }
) => {
  const productRef = doc(db, "products", id);

  const updateData: any = {
    name: data.name,
    price: data.price,
    imageUrl: data.imageUrl,
    updatedAt: new Date(),
  };

  // ✅ only add if defined
  if (data.imagePublicId !== undefined) {
    updateData.imagePublicId = data.imagePublicId;
  }

  await updateDoc(productRef, updateData);

  if (data.oldPublicId) {
    await deleteFromCloudinary(data.oldPublicId);
  }

  return id;
};


export const deleteFromCloudinary = async (publicId: string) => {
  await fetch("/api/delete-image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ publicId }),
  });
};  

export const deleteProduct = async (id: string, publicId: string) => {
  const productRef = doc(db, "products", id);

  if (publicId) {
    await deleteFromCloudinary(publicId);
  }

  await deleteDoc(productRef);

  return id;
};