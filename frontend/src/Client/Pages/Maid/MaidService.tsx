import React, { useEffect, useState } from "react";
import Table from "../../../Shared/Components/Table";
import {
  deleteService,
  fetchServices,
} from "../../../Shared/Store/ServiceAuthStore";
import { Service as ServiceModel } from "../../../Shared/Models/Service.model";
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";
import { NavLink, useNavigate } from "react-router-dom";
import Loading from "../../../Shared/Components/Loading"; // Import the Loading component

const MaidService: React.FC = () => {
  const [services, setServices] = useState<ServiceModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const getServices = async () => {
    try {
      const token = localStorage.getItem("token");
      if(token)
      {
        const loggedInUser = await getLoggedInUser();
        if (loggedInUser.role === "maid") {
          const response = await fetchServices();
  
          // Ensure response.services exists and is an array
          const servicesArray = Array.isArray(response.services)
            ? response.services
            : [];
  
          // Filter services by provider_id and registerId
          const filteredServices = servicesArray.filter(
            (service: ServiceModel) => service.provider_id === loggedInUser._id // Adjust this filter if needed
          );
  
          setServices(filteredServices);
        }
        else{
          navigate("/login");
        }
      }
      else{
        navigate("/");
      }
      
    } catch (error) {
      setError("Error fetching services"+ error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getServices();
  }, []);

  const handleDelete = async (serviceId: string) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        await deleteService(serviceId);
        setServices((prevServices) =>
          prevServices.filter((service) => service._id !== serviceId)
        );
      } catch (error) {
        console.error("Error deleting service:", error);
      }
    }
  };

  if (loading) {
    return <div className="pt-24"><Loading size={50} /></div>; // Use the Loading component here
  }

  if (error) {
    return <div className="pt-24 text-center text-red-500">{error}</div>;
  }

  const columns = [
    "Sr No.",
    "Service ID",
    "Name",
    "Price",
    "Note",
    "Category",
    "Sub Category",
    "Status",
  ];

  const data = services.map((service, index) => ({
    No: index + 1,
    _id: service._id,
    name: service.serviceprovider?.[0]?.name || "N/A",
    price: service.price || "N/A",
    note: service.note || "N/A",
    category: service.category?.[0]?.name || "N/A",
    sub_category: service.subcategory?.[0]?.name || "N/A",
    isActive: service.isActive ? "Active" : "Inactive",
  }));

  return (
    <div className="pt-20 mb-12 flex justify-center items-center">
      <div className="w-full max-w-6xl px-6 sm:px-6 md:px-8 lg:px-16 xl:px-0">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-2xl font-bold text-blue-500">Service</h2>
          <NavLink
            to="/addmaidservice"
            className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-400"
          >
            Add Service
          </NavLink>
        </div>

        <Table
          columns={columns}
          data={data}
          editName="Action"
          editStatus={false}
          deleteStatus={true}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default MaidService;
