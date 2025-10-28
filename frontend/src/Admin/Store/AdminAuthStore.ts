import axios from "axios";
import { axiosInstance } from "../../Shared/Lib/axios";
import { Admin } from "../Models/Admin.model";


// Checking Admin is LoggeIn or Not
export async function getLoggedInAdmin(): Promise<Admin> {
  const response = await axiosInstance.get("/admin",{
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    withCredentials: true,
  });
  console.log("Logged in admin:", response.data);
  return response.data;
}

export interface signUpAdminCredentials {
  name: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
}

export async function signUpAdmin(
  credentials: signUpAdminCredentials
): Promise<Admin> {
  try {
    const response = await axiosInstance.post<Admin>(
      "/admin/create",
      credentials
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      // Handle Axios-specific error
      console.error(
        "Axios error during sign-up:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "An error occurred during sign-up."
      );
    } else {
      // Handle non-Axios errors
      console.error("Unexpected error during sign-up:", error);
      throw new Error("An unexpected error occurred.");
    }
  }
}

// Login Admin
export interface loginAdminCredentials {
  email: string;
  password: string;
}

export async function loginAdmin(
  credentials: loginAdminCredentials
): Promise<Admin> {
  try {
    const response = await axiosInstance.post<Admin>(
      "/admin/login",
      credentials
    );
    localStorage.setItem("token", response.data.token);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      // Handle Axios-specific error
      console.error(
        "Axios error during login:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "An error occurred during login."
      );
    } else {
      // Handle non-Axios errors
      console.error("Unexpected error during login:", error);
      throw new Error("An unexpected error occurred.");
    }
  }
}

// Logout Admin
export async function logoutAdmin(): Promise<void> {
  localStorage.removeItem("token");
}



// Get All Admins
export async function fetchAdmins(): Promise<Admin[]> {
  const response = await axiosInstance.get("/admin/getall");
  return response.data;
}


export async function checkSuperAdmin(adminId: string): Promise<Admin> {
  const response = await axiosInstance.get("/admin/checksuperadmin/"+adminId);
  return response.data;
}


export async function fetchAdminById(adminId: string): Promise<Admin> {
  const response = await axiosInstance.get("/admin/"+adminId);
  return response.data;
}


export interface AdminBody
{
  name: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
}
export async function createAdmin(data: AdminBody): Promise<AdminBody> {
  const response = await axiosInstance.post("/admin/create", data);
  return response.data;
}


export interface updateBody
{
  status : string;
}

export async function updateAdmin(adminId: string) {
  const response = await axiosInstance.patch(`/admin/update/${adminId}`);
  return response.data;
}


export const deleteAdmin = async (adminId: string) => {
  try {
    await axiosInstance.delete(`/admin/delete/${adminId}`);
  } catch (error) {
    console.log("Failed to delete Admin:", error);
    throw error;
  }
};