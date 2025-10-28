export interface pgOwnerDetail{
    _id: string;
    name: string;
    email: string;
    mobile_number: number;
    createdAt: string;
    updatedAt: string;
}

export interface pgDetail{
    _id: string;
    name: string;
    price: string;
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
    createdAt: string;
    updatedAt: string;
}

export interface userProfileDetail{
    _id: string;
    name: string;
    profile_pic: string;
}

export interface PgBookingBody{
    _id: string;
    price: string;
    user_id: string;
    provider_id: string;
    userProfileDetail: userProfileDetail[];
    pgDetail: pgDetail[];
    pgOwnerDetail: pgOwnerDetail[];
    name: string;
    gender: string;
    pg_id: string;
    start_date: Date;
    status: string;
    payment_status: string;
    createdAt: string;
    updatedAt: string;
}