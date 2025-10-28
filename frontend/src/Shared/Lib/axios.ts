import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://management-system-json-web-token-bakend.vercel.app/api",
  withCredentials: true,
});