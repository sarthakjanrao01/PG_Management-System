import { axiosInstance } from "../Lib/axios";

export const fetchPgTypes = async () =>
{
    try {
        const response = await axiosInstance.get("/pgtype");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch pgTypes:", error);
        throw error;
    }
}

export const fetchPgTypeById = async (pgTypeId : string) =>
{
    try {
        const response = await axiosInstance.get(`/pgtype/${pgTypeId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching pgType:", error);
        throw error;
    }
};

// Interface for PgType
interface PgType {
    name: string;
    isActive: boolean;
}

export const createPgType = async (pgType: PgType) =>
{
    try {
        await axiosInstance.post("/pgtype/create", pgType);
    } catch (error) {
        console.error("Failed to create pgType:", error);
        throw error;
    }
};

// Update PgType
export const updatePgType = async (
    pgTypeId: string,
    data: { name: string; isActive: boolean }
) => {
    try {
        const response = await axiosInstance.patch(
            `/pgtype/update/${pgTypeId}`,
            data
        );
        return response.data;
    } catch (error) {
        console.error("Error updating pgType:", error);
        throw error;
    }
};

// Delete PgType
export const deletePgType = async (pgTypeId: string) => {
    try {
        const response = await axiosInstance.delete(`/pgtype/delete/${pgTypeId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting pgType:", error);
        throw error;
    }
};