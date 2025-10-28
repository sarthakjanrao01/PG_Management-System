import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";
import { createService } from "../../../Shared/Store/ServiceAuthStore";
import { fetchSubCategoryByCategoryId } from "../../../Shared/Store/SubCategoryAuthStore";
import { SubCategory } from "../../../Shared/Models/SubCategory.model";
import Loading from "../../../Shared/Components/Loading";

const AddMaidService: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [providerId, setProviderId] = useState("");
  const [category] = useState("67907e2f8e1c7c38055f0dc7"); // Fixed category
  const [subcategory, setSubcategory] = useState("");
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const registerId = await getLoggedInUser();
        if (!registerId || registerId.role !== "maid") {
          navigate("/");
          return;
        }

        setProviderId(registerId._id);

        // Fetch subcategories for the fixed category
        const fetchedSubCategories = await fetchSubCategoryByCategoryId(category);
        setSubcategories(fetchedSubCategories || []);
        setSubcategory("");

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
        navigate("/");
      }
    };

    initializeData();
  }, [navigate, category]); // Run when `category` changes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subcategory.trim()) {
      alert("Subcategory is required");
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      alert("Price should be a positive number");
      return;
    }

    try {
      await createService({
        provider_id: providerId,
        category_id: category,
        sub_category_id: subcategory,
        price: parseInt(price),
        note,
      });
      navigate("/services");
    } catch (error) {
      console.error("Error saving service:", error);
      alert("Failed to save the service. Please try again.");
    }
  };

  if (loading) {
    return <Loading size={50} />;
  }

  return (
    <div className="pt-24 px-14 bg-white p-1 pb-4">
      <div className="flex justify-between bg-blue-500 border-2 border-x-black border-t-black border-b-0 rounded-t text-white p-4 ">
        <h1 className="text-xl font-bold mt-2">Add Service</h1>
        <Link to="/services" className="px-4 py-2 border rounded">
          Back
        </Link>
      </div>

      <div className="pt-5 px-5 border-2 pb-6 mb-5 rounded-b border-black">
        <form onSubmit={handleSubmit}>
          {/* Subcategory */}
          <div className="mb-4">
            <label htmlFor="subcategory" className="block text-gray-700">
              Subcategory:
            </label>
            <select
              id="subcategory"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="" disabled>
                Select a subcategory
              </option>
              {subcategories.map((subcat) => (
                <option key={subcat._id} value={subcat._id}>
                  {subcat.name}
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
              type="number"
              name="price"
              id="price"
              placeholder="Enter price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Note */}
          <div className="mb-4">
            <label htmlFor="note" className="block text-gray-700">
              Note:
            </label>
            <textarea
              name="note"
              id="note"
              placeholder="Enter any additional notes"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2 border rounded"
              rows={4}
            />
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
              to="/services"
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

export default AddMaidService;