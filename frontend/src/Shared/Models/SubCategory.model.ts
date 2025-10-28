interface category{
    _id: string,
    name: string,
    isActive: boolean,
    createdAt: string,
    updatedAt: string,
}

export interface SubCategory {
    category: category;
    _id: string,
    category_id: string,
    name: string,
    isActive: boolean,
    createdAt: string,
    updatedAt: string,
}