import axios from "axios";
import { axiosInstance } from "../Lib/axios";
import { Register } from "../Models/Register";

// Login User
export async function getLoggedInUser(): Promise<Register> {
  try {
    const response = await axiosInstance.get("/register", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Error fetching logged-in user:",
        error.response?.data || error.message
      );
    } else {
      console.error("Error fetching logged-in user:", error);
    }
    throw error;
  }
}

// Sign Up User
export interface signUpCredentials {
  name: string;
  mobile_number: number | string;
  email: string;
  password: string;
  role: string;
}
export async function signUp(
  credentials: signUpCredentials
): Promise<Register> {
  try {
    const response = await axiosInstance.post<Register>(
      "/register/signup",
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

// Login user
export interface loginCredentials {
  email: string;
  password: string;
}

export async function login(credentials: loginCredentials): Promise<Register> {
  try {
    const response = await axiosInstance.post<Register>(
      "/register/login",
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

// Logout user
export async function logoutUser(): Promise<void> {
  localStorage.removeItem("token");
}
