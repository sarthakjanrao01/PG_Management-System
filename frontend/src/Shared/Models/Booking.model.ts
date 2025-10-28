export interface Category {
  _id: string;
  name: string;
}

export interface SubCategory {
  _id: string;
  category_id: string;
  name: string;
}

export interface userDetail {
    _id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    }

    export interface userProfileDetail
    {
        _id: string;
        reg_id: string;
        gender: string;
        profile_pic: string;
        idproof_pic: string;
        address: string;
        street: string;
        city: string;
        state: string;
        country: string;
        pincode: number;
        isverified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }

    export interface providerProfileDetail
    {
        _id: string;
        reg_id: string;
        gender: string;
        profile_pic: string;
        idproof_pic: string;
        address: string;
        street: string;
        city: string;
        state: string;
        country: string;
        pincode: number;
        isverified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }

export interface Booking {
  _id: string;
  name: string;
  user_id: string;
  userDetail : userDetail[];
  userProfileDetail : userProfileDetail[];
  provider_id: string;
  providerDetail : userDetail[];
  providerProfileDetail : providerProfileDetail[];
  gender: string;
  category_id: string;
  category : Category[];
  sub_category_id: string;
  subcategory : SubCategory[];
  start_date: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
