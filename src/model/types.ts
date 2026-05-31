  export type Product = {
    id: string;
    name: string;
    category: Category;
    price: string;
    image: string;
    imagePublicId: string; 
  };

  export type Category = "Figures" | "LightBox" | "ShadowBox";

  export type Review = {
    id: string;
    name: string;
    category: Category;
    review: string;
  };

  export const categories: Category[] = [
    "Figures",
    "LightBox",
    "ShadowBox",
  ];

  export type WebDetails={
    whatsAppNumber: string;
    tikTokLink:string;
    instagramLink:string;
    gmailAddress:string;
  } 