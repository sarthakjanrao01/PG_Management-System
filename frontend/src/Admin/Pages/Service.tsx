import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../Shared/Components/Table";
import { changeStatus, deleteService, fetchServices } from "../../Shared/Store/ServiceAuthStore";
import { Service as ServiceModel } from "../../Shared/Models/Service.model";
import Loading from "../../Shared/Components/Loading"; // Assuming you have a reusable Loading component

const Service: React.FC = () => {
  const [services, setServices] = useState<ServiceModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false); // To track delete action loading state
  const navigate = useNavigate();

  const getServices = async () => {
    try {
      const response = await fetchServices();
      const servicesData = response.services || [];
      setServices(servicesData);
    } catch (err) {
      setError("Failed to fetch Services");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getServices();
  }, [navigate]);

  const handleEdit = async (serviceId: string) => {
    const service = services.find((service) => service._id === serviceId);
    if (!service) {
      alert("Service not found.");
      return;
    }

    const newStatus = service.isActive ? "Inactive" : "Active";

    if (
      window.confirm(
        `Are you sure you want to change the status of this service to ${newStatus}?`
      )
    ) {
      try {
        await changeStatus(serviceId);
        getServices();
        alert(`Service status changed to ${newStatus}`);
      } catch (error) {
        console.error("Error updating service status:", error);
        alert("Failed to update service status.");
      }
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      setDeleting(true); // Start deleting state
      try {
        await deleteService(serviceId);
        setServices((prevServices) =>
          prevServices.filter((service) => service._id !== serviceId)
        );
        alert("Service deleted successfully");
      } catch (error) {
        console.error("Error deleting service:", error);
        alert("Failed to delete service. Please try again.");
      } finally {
        setDeleting(false); // Stop deleting state
      }
    }
  };

  if (loading || deleting) {
    return <div className="m-6 text-center"><Loading size={50} color="#3b82f6" /></div>; // Show loading spinner
  }

  if (error) {
    return <div className="m-6 text-center text-red-500">{error}</div>;
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
    "Reg Date",
    "Update Date",
  ];

  const data = services.map((service, index) => ({
    No: index + 1,
    _id: service._id,
    name: service.serviceprovider?.[0]?.name || "N/A",
    price: service.price,
    note: service.note || "",
    category: service.category?.[0]?.name || "N/A",
    sub_category: service.subcategory?.[0]?.name || "N/A",
    isActive: service.isActive ? "Active" : "Inactive",
    createdAt: new Date(service.createdAt).toLocaleDateString(),
    updatedAt: new Date(service.updatedAt).toLocaleDateString(),
  }));

  return (
    <div className="m-6 bg-white">
      {/* Header Section */}
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold text-blue-500">Service</h2>
      </div>

      {/* Table Section */}
      <Table
        columns={columns}
        data={data}
        editStatus={true}
        editName="Action"
        onEdit={handleEdit}
        deleteStatus={true}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Service;