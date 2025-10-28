interface userDetail{
    _id: string;
    name: string;
    email: string;
    mobile_number: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}


export interface User{
    _id: string;
    userDetail: userDetail[];
    gender: string;
    profile_pic: string;
    idproof_pic: string;
    address: string;
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    isverified: boolean;
    createdAt: string;
    updatedAt: string;
}