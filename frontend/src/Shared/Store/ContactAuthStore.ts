import { axiosInstance } from "../Lib/axios";

interface ContactUsBody {
  name: string;
  email: string;
  message: string;
}

export const fetchAllContactUs = async () => {
  try {
    const response = await axiosInstance.get("/contactus");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch all contact us:", error);
    throw error;
  }
};

export const createContactUs = async (data: ContactUsBody) => {
  try {
    const response = await axiosInstance.post("/contactus/create", data);
    return response.data;
  } catch (error) {
    console.error("Failed to create contact us:", error);
    throw error;
  }
};

export const deleteContactUs = async (contactId: string) => {
  try {
    await axiosInstance.delete(`/contactus/delete/${contactId}`);
  } catch (error) {
    console.error("Failed to delete contact us:", error);
    throw error;
  }
};
