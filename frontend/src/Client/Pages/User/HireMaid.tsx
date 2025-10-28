import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";
import { fetchSubCategoryByCategoryId } from "../../../Shared/Store/SubCategoryAuthStore";
import { createBooking } from "../../../Shared/Store/BookingAuthStore";
import Loading from "../../../Shared/Components/Loading";
import { fetchProfileByRegisterId } from "../../../Shared/Store/ProfileAuthStore";

const HireMaid: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [registerId, setRegisterId] = useState("");
  const [subCategoriesList, setSubCategoriesList] = useState([]);
  const [name, setName] = useState("");
  const [gender, setGender] = useState("Any");
  const category = "67907e2f8e1c7c38055f0dc7"; // Category ID
  const [subcategory, setSubcategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const navigate = useNavigate();

  // Fetch categories on component mount
  useEffect(() => {
    const checkLoggedInUser = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if(token)
        {
          const register = await getLoggedInUser();
          if (register) {
            setRegisterId(register._id);
            fetchSubCategory(category);
            // fetchCategory();
          } else {
            navigate("/");
          }
        }
        else{
          navigate("/login");
        }
        
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    checkLoggedInUser();
  }, [category, navigate]);

  // Fetch Subcategories based on selected category
  const fetchSubCategory = async (categoryId: string) => {
    try {
      if (!categoryId) {
        setSubCategoriesList([]);
        return;
      }
      const subCategories = await fetchSubCategoryByCategoryId(categoryId);
      setSubCategoriesList(subCategories);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const checkUserAuthentication = await fetchProfileByRegisterId(
        registerId
      );
      if (checkUserAuthentication.isverified) {
        try {
          const bookingData = {
            name,
            user_id: registerId, // Ensure this is correctly set
            category_id: category,
            sub_category_id: subcategory,
            gender,
            start_date: new Date(startDate),
          };

          await createBooking(bookingData);
          navigate("/mymaidbooking");
        } catch (error) {
          console.error("Booking creation failed:", error);
          if ((error as { status: number }).status === 400) {
            alert("Booking Already Exist");
          } else {
            alert("Booking creation failed. Please try again.");
          }

          navigate("/mymaidbooking");
        }
      } else {
        console.error("Please Wait While We Verify Your Profile.");
        alert("Please Wait While We Verify Your Profile");
        navigate("/profile");
      }
    } catch (error) {
      console.error("Please Complete Profile First.", error);
      navigate("/profile");
    }
  };

  if (loading) {
    return (
      <div>
        <Loading size={50} />
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-32 xl:pt-24 px-6 md:px-14 bg-white rounded shadow pb-6">
      <div className="flex justify-between bg-blue-500 border-2 border-x-black border-t-black border-b-0 rounded-t text-white p-4">
        <h1 className="text-xl font-bold mt-2">Hire Maid</h1>
        <Link to="/" className="px-4 py-2 border rounded">
          Back
        </Link>
      </div>

      <div className="py-5 px-5 border-2 border-x-black rounded-b border-black">
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-4">
            <label className="block text-gray-700">Name:</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Gender */}
          <div className="mb-4">
            <label className="block text-gray-700">Gender:</label>
            <select
            required
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="Any">Any</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </div>

          {/* Subcategory */}
          <div className="mb-4">
            <label className="block text-gray-700">Subcategory:</label>
            <select
            required
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={!category}
            >
              <option value="">Select Subcategory</option>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {subCategoriesList.map((sub: any) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="mb-4">
            <label className="block text-gray-700">Start Date:</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border rounded"
              min={new Date().toISOString().split("T")[0]} // Restricts selection to today or future dates
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HireMaid;
