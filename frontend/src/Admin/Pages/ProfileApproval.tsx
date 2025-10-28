import React, { useEffect, useState } from "react";
import Loading from "../../Shared/Components/Loading"; // Import the Loading component
import { User as UserModel } from "../../Shared/Models/User.model";
import {
    deleteProfile,
  fetchProfiles,
  updateProfileStatus,
} from "../../Shared/Store/ProfileAuthStore";
import UserProfileTable from "../Components/UserProfileTable";

const ProfileApproval: React.FC = () => {
  const [users, setUsers] = useState<UserModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getProfiles = async () => {
      setLoading(true); // Start loading
      try {
        const data = await fetchProfiles();
        setUsers(data);
      } catch (err) {
        setError("Failed to fetch Profiles");
        console.error(err);
      } finally {
        setLoading(false); // End loading
      }
    };

    getProfiles();
  }, []);

  const handleEdit = async (profileId: string) => {
    try {
      const response = await updateProfileStatus(profileId);
      if (response) {
        alert("User Profile Status Updated Successfully");

        // Update the user's isVerified status in state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === profileId
              ? { ...user, isverified: !user.isverified }
              : user
          )
        );
      } else {
        alert("User Profile Status Update Failed");
      }
    } catch (error) {
      console.error("Error updating profile status:", error);
      alert("Error updating profile status. Please try again.");
    }
  };

  const handleDelete = async (profileId: string) => {
    if (window.confirm("Are you sure you want to delete this User?")) {
      setLoading(true);
      try {
        await deleteProfile(profileId); // Corrected function name
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user._id !== profileId)
        );
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Error deleting user. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="m-6 text-center">
        {/* Pass size and color to the loader */}
        <Loading size={50} />
      </div>
    );
  }

  if (error) {
    return <div className="m-6 text-center text-red-500">{error}</div>;
  }

  const columns = [
    "Sr No.",
    "Profile ID",
    "Name",
    "Email",
    "Mobile Number",
    "Gender",
    "Profile pic",
    "Id Proof",
    "Address",
    "Status",
    "Reg Date",
    "Update Date",
  ];

  // Prepare data in the format that Table expects
  const data = users.map((user, index) => ({
    No: index + 1,
    _id: user._id,
    name: user.userDetail[0].name,
    email: user.userDetail[0].email,
    mobileNumber: user.userDetail[0].mobile_number,
    gender: user.gender,
    profilePic: user.profile_pic,
    idProof: user.idproof_pic,
    address: `${user.address}, ${user.street}, ${user.city}, ${user.state}, ${user.country}, ${user.pincode}`,
    isVerified: user.isverified ? "Active" : "Inactive",
    createdAt: new Date(user.createdAt).toLocaleDateString(),
    updatedAt: new Date(user.updatedAt).toLocaleDateString(),
  }));

  return (
    <div className="bg-white">
      {/* Header Section */}
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold text-blue-500">User</h2>
      </div>

      {/* Table Section */}
      <UserProfileTable
        columns={columns}
        data={data}
        editStatus={true}
        editHeadName="Action"
        editName="Action"
        onEdit={handleEdit}
        deleteStatus={true}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ProfileApproval;
