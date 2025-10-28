export interface userDetail {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface subcategory {
  _id: string;
  name: string;
}

export interface pgtype {
  _id: string;
  name: string;
}

export interface Pg {
  _id: string;
  pgId: string;
  name: string;
  reg_id: string;
  userDetail: userDetail[];
  price: number;
  subcategory_id: string;
  subCategory: subcategory[];
  type: string;
  pgtype: pgtype[];
  address: string;
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: number;
  image1: string;
  image2: string;
  image3: string;
  image4: string;
  image5: string;
  status: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
