import React, { useEffect, useState } from "react";
import {
  createProfile,
  fetchProfileByRegisterId,
  updateProfile,
} from "../../../Shared/Store/ProfileAuthStore";
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";
import { NavLink, useNavigate } from "react-router-dom";
import Loading from "../../../Shared/Components/Loading";

const Profile: React.FC = () => {
  const [registerId, setRegisterId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [profilePic, setProfilePic] = useState<string | File | null>(null);
  const [idProofPic, setIdProofPic] = useState<string | File | null>(null);

  const [formData, setFormData] = useState({
    gender: "",
    address: "",
    street: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const checkUserAuthentication = async () => {
      setLoading(true);
      try {
        const register = await getLoggedInUser();
        setRegisterId(register._id);
        setLoading(false);
        const profileData = await fetchProfileByRegisterId(register._id);
        if (profileData && profileData.profile_pic && profileData.idproof_pic) {
          setEditProfile(true);
          setProfilePic(profileData.profile_pic);
          setIdProofPic(profileData.idproof_pic);
          setFormData({
            gender: profileData.gender,
            address: profileData.address,
            street: profileData.street,
            city: profileData.city,
            state: profileData.state,
            country: profileData.country,
            pincode: profileData.pincode,
          });
        } else {
          console.log("No Profile Data Found or Data is Incomplete");
        }
      } catch (error) {
        console.log(error);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (error instanceof Error && (error as any).status !== 404) {
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };

    checkUserAuthentication();
  }, [navigate]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<string | File | null>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        // 2MB size limit
        alert("File size exceeds 2MB limit.");
        return;
      }
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        alert("Only JPG and PNG files are allowed.");
        return;
      }
      setFile(file);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profilePic || !idProofPic) {
      alert("Please upload both Profile Picture and ID Proof.");
      return;
    }

    const form = new FormData();
    form.append("reg_id", registerId);
    form.append("profile_pic", profilePic);
    form.append("idproof_pic", idProofPic);
    Object.keys(formData).forEach((key) => {
      form.append(key, formData[key as keyof typeof formData]);
    });

    try {
      setLoading(true); // Start loading when submitting form
      if (editProfile) {
        await updateProfile(form);
      } else {
        await createProfile(form);
      }
      setLoading(false); // Stop loading once response is received
      setEditProfile(true);
      alert("Profile updated successfully!");
    } catch (error) {
      setLoading(false); // Stop loading in case of an error
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  return (
    <div className="pt-20 flex flex-col items-center justify-center min-h-screen p-4">
      {loading ? (
        <Loading size={50} />
      ) : (
        <>
          <div className="flex flex-col items-center mb-4">
            <h1 className="text-2xl mb-4 text-blue-500 font-bold">Profile</h1>
            <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden">
              {profilePic ? (
                <img
                  src={
                    profilePic instanceof File
                      ? URL.createObjectURL(profilePic)
                      : profilePic // Use the URL directly if it's a string
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-500">
                  No Photo
                </div>
              )}
            </div>

            <label className="mt-4 hidden">
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600">
                Change Profile Pic
              </button>
            </label>
          </div>
          <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="w-full max-w-md space-y-4"
          >
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Profile Picture
              </label>
              <input
                required
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, setProfilePic)}
              />
            </div>

            {editProfile && (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  ID Proof
                </label>
                <img
                  height={200}
                  width={200}
                  src={
                    idProofPic
                      ? idProofPic instanceof File
                        ? URL.createObjectURL(idProofPic)
                        : idProofPic
                      : undefined
                  }
                  alt=""
                />
              </div>
            )}

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                ID Proof
              </label>
              <input
                required
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, setIdProofPic)}
              />
            </div>

            {/* Gender Dropdown */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                required
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-2 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Address */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea
                required
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter Address"
                className="w-full px-2 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              ></textarea>
            </div>

            {/* Street */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Street
              </label>
              <input
                required
                type="text"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                className="w-full px-2 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Street"
              />
            </div>

            {/* City Dropdown */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                City
              </label>
              <select
                required
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-2 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select City</option>
                <option value="Ahmedabad">Ahmedabad</option>
                <option value="Himatnagar">Himatnagar</option>
              </select>
            </div>

            {/* State Dropdown */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                State
              </label>
              <select
                required
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-2 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select State</option>
                <option value="Gujarat">Gujarat</option>
              </select>
            </div>

            {/* Country Dropdown */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Country
              </label>
              <select
                required
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-2 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Country</option>
                <option value="India">India</option>
              </select>
            </div>

            {/* Pincode */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Pincode
              </label>
              <input
                required
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                className="w-full px-2 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Pincode"
              />
            </div>

            <div className="flex justify-center gap-4">
              <NavLink
                className="px-4 py-2 text-white bg-gray-500 rounded hover:bg-gray-600"
                to={"/"}
              >
                Cancel
              </NavLink>
              <button
                type="submit"
                className="px-5 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
              >
                {editProfile ? "Update" : "Save"}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default Profile;
