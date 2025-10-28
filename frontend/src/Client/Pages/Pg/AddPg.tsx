import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";
import { fetchPgTypes } from "../../../Shared/Store/PgTypeAuthStore";
import { PgType } from "../../../Shared/Models/PgType.model";
import Loading from "../../../Shared/Components/Loading";
import { createPg } from "../../../Shared/Store/PgAuthStore";
import { SubCategory as SubCategoryModel } from "../../../Shared/Models/SubCategory.model";
import { fetchSubCategoryByCategoryId } from "../../../Shared/Store/SubCategoryAuthStore";
import { fetchProfileByRegisterId } from "../../../Shared/Store/ProfileAuthStore";

const AddPg: React.FC = () => {
  const [name, setName] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [address, setAddress] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [pincode, setPincode] = useState<number | string>("");
  const [images, setImages] = useState<{ [key: string]: File | null }>({
    image1: null,
    image2: null,
    image3: null,
    image4: null,
    image5: null,
  });
  const [error, setError] = useState("");
  const [subCategories, setSubCategories] = useState<SubCategoryModel[]>([]);
  const [pgTypes, setPgTypes] = useState<PgType[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [registerId, setRegisterId] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Dropdown Options
  const cities = ["Ahmedabad", "Himatnagar", "Vadodara", "Surat"];
  const states = ["Gujarat"];
  const countries = ["India"];

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      setImages((prevImages) => ({
        ...prevImages,
        [key]: e.target.files![0],
      }));
      setError(""); // Clear any error if a file is selected
    }
  };

  const checkUserAuthentication = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const register = await getLoggedInUser();
        if (!register) {
          navigate("/login");
        }
        if (register.role === "pgOwner") {
          setRegisterId(register._id);
          try {
            const checkUserProfile = await fetchProfileByRegisterId(
              register._id
            );
            console.log("User Profile:", checkUserProfile.status);
            if (checkUserProfile.status === 404) {
              alert("User not found. Please complete your profile.");
              navigate("/profile"); // Navigate to the profile page
              return;
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (error) {
            alert("Please Complete Profile First");
            navigate("/profile"); // Navigate to the profile page
            return;
          }
        } else {
          navigate("/");
        }
      } else {
        navigate("/");
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      navigate("/login");
      return;
    }
  };

  const fetchSubCategories = async () => {
    try {
      const response = await fetchSubCategoryByCategoryId(
        "679470c8a1f974072a4d2cd4"
      );
      setSubCategories(response); // Ensure setPgTypes is properly defined in the component's state
    } catch (error) {
      console.error("Error fetching pgtype", error);
    }
  };

  const getPgType = async () => {
    try {
      const response = await fetchPgTypes();
      setPgTypes(response); // Ensure setPgTypes is properly defined in the component's state
    } catch (error) {
      console.error("Error fetching pgtype", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Start loading
      await checkUserAuthentication();
      await getPgType();
      await fetchSubCategories();
      setLoading(false); // Stop loading
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Check if the first image is provided, as it's required
    if (!images.image1) {
      setError("The First Image is Required.");
      setLoading(false);
      return;
    }

    try {
      const pgData = {
        reg_id: registerId,
        name,
        price: Number(price),
        sub_category_id: subCategory,
        type_id: type,
        address,
        street,
        city,
        state,
        country,
        pincode: pincode.toString(),
        image1: images.image1,
        image2: images.image2,
        image3: images.image3,
        image4: images.image4,
        image5: images.image5,
      };

      const response = await createPg(pgData);
      setLoading(false);
      if (response) {
        alert("Pg Added Successfully");
        navigate("/pgservices");
      } else {
        alert("Pg Not Added");
      }
    } catch (error) {
      if ((error as { status?: number }).status === 409) {
        alert("This Pg already exists");
      } else {
        alert("Error in Adding Pg");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading size={50} />
      </div>
    );
  }

  return (
    <div className="px-14 pt-24 bg-white rounded shadow pb-4">
      <div className="flex justify-between bg-blue-500 text-white p-4 rounded">
        <h1 className="text-xl font-bold mt-2">Add PG</h1>
        <NavLink to="/pgservices" className="px-4 py-2 border rounded">
          Back
        </NavLink>
      </div>

      <div className="mt-5 px-5">
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700">
              Name:
            </label>
            <input
              required
              type="text"
              name="name"
              id="name"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Type Dropdown */}
          <div className="mb-4">
            <label htmlFor="type" className="block text-gray-700 font-medium">
              Sub Category:
            </label>
            <select
              required
              name="subCategory"
              id="subCategory"
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              className="w-full p-2 border border-gray-300"
              aria-label="Select type"
            >
              <option value="" disabled>
                Select a Sub Category
              </option>
              {subCategories.map((subcat) => (
                <option key={subcat._id} value={subcat._id}>
                  {subcat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Dropdown */}
          <div className="mb-4">
            <label htmlFor="type" className="block text-gray-700 font-medium">
              Type:
            </label>
            <select
              required
              name="type"
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 border border-gray-300"
              aria-label="Select type"
            >
              <option value="" disabled>
                Select a type
              </option>
              {pgTypes.map((pgType) => (
                <option key={pgType._id} value={pgType._id}>
                  {pgType.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div className="mb-4">
            <label htmlFor="price" className="block text-gray-700">
              Price:
            </label>
            <input
              required
              type="number"
              name="price"
              id="price"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Address */}
          <div className="mb-4">
            <label htmlFor="address" className="block text-gray-700">
              Address:
            </label>
            <input
              required
              type="text"
              name="address"
              id="address"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Street */}
          <div className="mb-4">
            <label htmlFor="street" className="block text-gray-700">
              Street:
            </label>
            <input
              required
              type="text"
              name="street"
              id="street"
              placeholder="Street"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Dropdowns for City, State, Country */}
          <div className="mb-4">
            <label htmlFor="city" className="block text-gray-700">
              City:
            </label>
            <select
              required
              name="city"
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select City</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="state" className="block text-gray-700">
              State:
            </label>
            <select
              required
              name="state"
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select State</option>
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="country" className="block text-gray-700">
              Country:
            </label>
            <select
              required
              name="country"
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Country</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Pincode */}
          <div className="mb-4">
            <label htmlFor="pincode" className="block text-gray-700">
              Pincode:
            </label>
            <input
              required
              type="number"
              name="pincode"
              id="pincode"
              placeholder="Pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Images */}
          <div className="mb-4">
            <label className="block text-gray-700">Upload Images:</label>
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className="mb-2">
                <label htmlFor={`image${num}`} className="block text-gray-700">
                  Image {num}:
                </label>
                <input
                  type="file"
                  id={`image${num}`}
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, `image${num}`)}
                  className="w-full p-2 border rounded"
                />
              </div>
            ))}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          {/* Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600"
            >
              Save
            </button>
            <NavLink
              to="/allavailablepg"
              className="px-4 py-2 bg-gray-500 text-white rounded shadow hover:bg-gray-600"
            >
              Cancel
            </NavLink>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPg;
