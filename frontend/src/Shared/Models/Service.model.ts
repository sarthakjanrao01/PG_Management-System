// ServiceProvider Interface - Represents the provider of the service
export interface ServiceProvider {
    _id: string;
    name: string;
  }
  
  // Category Interface - Represents the category to which the service belongs
  export interface Category {
    _id: string;
    name: string;
  }
  
  // SubCategory Interface - Represents the subcategory of the service
  export interface SubCategory {
    _id: string;
    name: string;
  }
  
  // Service Interface - Main service structure
  export interface Service {
    _id: string;
    name: string;
    provider_id: string;
    serviceprovider: ServiceProvider[];  // Array of ServiceProvider if innerjoin returns multiple providers
    category_id: string;
    category: Category[];  // Array of Categories if innerjoin returns multiple categories
    sub_category_id: string;
    subcategory: SubCategory[];  // Array of SubCategories if innerjoin returns multiple subcategories
    price: number;
    note?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  