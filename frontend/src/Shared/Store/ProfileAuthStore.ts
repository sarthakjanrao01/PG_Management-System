import { axiosInstance } from "../Lib/axios";

// Define the Profile type for strong typing
export interface Profile {
  profile_pic: File;
  idproof_pic: File;
  reg_id: string;
  gender: string;
  address: string;
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export const fetchProfiles = async () => {
  const response = await axiosInstance.get("/user");
  return response.data;
};

export const fetchProfileByRegisterId = async (user_id: string) => {
  const response = await axiosInstance.get(`/user/${user_id}`);
  return response.data;
};

export const createProfile = (profile: FormData) => {
  console.log(profile);
  return axiosInstance.post("/user/create", profile, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Function to send the profile data to the backend
export const updateProfile = (profile: FormData) => {
  console.log(profile.getAll);
  return axiosInstance.post("/user/update-profile", profile, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateProfileStatus = async(userId: string) => {
  const response = await axiosInstance.get(`/user/updatestatus/${userId}`);
  return response.data;
}

export const deleteProfile = async (userId: string) => {
  const response = await axiosInstance.delete(`/user/delete/${userId}`);
  return response.data;
};