import { axiosInstance } from "../Lib/axios";

export const fetchPgs = async () => {
  try {
    const response = await axiosInstance.get("/pg");
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchPgsById = async (pg_id : string) => {
  try {
    const response = await axiosInstance.get(`/pg/pgdetail/${pg_id}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};


export const fetchPgsByRegisterId = async (registerId : string) => {
  try {
    const response = await axiosInstance.get(`/pg/${registerId}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const changePgStatus = async (pgId : string) => {
  try {
    await axiosInstance.patch(`/pg/updatestatus/${pgId}`);
  } catch (error) {
    console.log(error);
  }
};

export interface PgFormData{
  reg_id: string,
  name: string,
  price: number,
  sub_category_id: string,
  type_id: string,
  address: string,
  street: string,
  city: string,
  state: string,
  country: string,
  pincode: string,
  image1: File | null,
  image2: File | null,
  image3: File | null,
  image4: File | null,
  image5: File | null,
}

export const createPg = (pg: PgFormData) => {
  return axiosInstance.post("/pg/create", pg, {
    headers: {
      "Content-Type": "multipart/form-data", // Important to tell the server you're sending files
    },
  });
};


export const deletePg = async (pgId: string) => {
  try {
    await axiosInstance.delete(`/pg/delete/${pgId}`);
  } catch (error) {
    console.log(error);
  }
};