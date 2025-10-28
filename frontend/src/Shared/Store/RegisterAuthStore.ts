import axios from "axios";
import { axiosInstance } from "../Lib/axios";

export const GetRegisterById = async(reg_id : string) => {
  try {
    const response = await axiosInstance.get(`/register/${reg_id}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      // Handle Axios-specific error
      console.error(
        "Axios error during get register by id:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message ||
          "An error occurred during get register by id."
      );
    } else {
      // Handle non-Axios errors
      console.error("Unexpected error during get register by id:", error);
      throw new Error("An unexpected error occurred.");
    }
  }
};
