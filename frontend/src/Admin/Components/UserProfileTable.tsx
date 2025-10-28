import React from "react";

interface TableProps {
  columns: string[]; // An array of column names
  data: { [key: string]: string | number }[]; // The data that will populate the table rows
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  editName?: string;
  editHeadName?: string; // Name for the Edit column header
  editStatus?: boolean;
  deleteStatus?: boolean;
}

const UserProfileTable: React.FC<TableProps> = ({
  columns,
  data,
  editStatus = false,
  deleteStatus = false,
  editName,
  editHeadName = "Edit", // Default to "Edit" if not provided
  onDelete,
  onEdit,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-blue-100">
            {columns.map((column, index) => (
              <th
                key={index}
                className="border border-gray-300 px-4 py-2 text-center"
              >
                {column}
              </th>
            ))}
            {editStatus && (
              <th className="border border-gray-300 px-4 py-2 text-center">
                {editHeadName}
              </th>
            )}
            {deleteStatus && (
              <th className="border border-gray-300 px-4 py-2 text-center">
                Delete
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-100">
              <td className="border border-gray-300 px-4 py-2 text-center">
                {row.No}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {row._id}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {row.name}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {row.email}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {row.mobileNumber}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {row.gender}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {row.profilePic ? (
                  <img
                    src={typeof row.profilePic === "string" ? row.profilePic : ""}
                    alt="Image"
                    className="w-36 h-16 object-cover mx-auto"
                  />
                ) : (
                  "NA"
                )}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {row.idProof ? (
                  <img
                    src={typeof row.idProof === "string" ? row.idProof : ""}
                    alt="Image"
                    className="w-36 h-16 object-cover mx-auto"
                  />
                ) : (
                  "NA"
                )}
              </td>
              
              <td className="border border-gray-300 px-4 py-2 text-center">
                {row.address}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {row.isVerified}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {row.createdAt}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {row.updatedAt}
              </td>
              {editStatus && onEdit && (
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <button
                    onClick={() => onEdit(String(row._id))}
                    className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-400"
                    aria-label={`Edit category ${row.name}`}
                  >
                    {editName || "Edit"}
                  </button>
                </td>
              )}
              {deleteStatus && onDelete && (
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <button
                    onClick={() => onDelete(String(row._id))}
                    className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-500"
                    aria-label={`Delete category ${row.name}`}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserProfileTable;