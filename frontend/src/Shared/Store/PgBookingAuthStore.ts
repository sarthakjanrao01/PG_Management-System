import { axiosInstance } from "../Lib/axios";

interface PgBookingBody {
  user_id: string;
  provider_id: string;
  name: string;
  pg_id: string;
  gender: string;
  start_date: Date;
  payment_status: string;
}

export const fetchPgBookings = async () => {
  try {
    const response = await axiosInstance.get("/pgbooking");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch Pg bookings:", error);
    throw error;
  }
};

export const fetchPgBookingsByPgId = async (pgId : string) => {
  try {
    const response = await axiosInstance.get(`/pgbooking/bypgid/${pgId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch Pg bookings:", error);
    throw error;
  }
};

export const fetchPgBookingsByRegisterId = async (registerId : string) => {
  try {
    const response = await axiosInstance.get(`/pgbooking/byregisterid/${registerId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch Pg bookings:", error);
    throw error;
  }
};

export const checkBookingExists = async (booking: PgBookingBody) => {
  const response = await axiosInstance.post(`/pgbooking/check`, booking);
  return response.data;
}

export const createPgBooking = async (pgBookingData: PgBookingBody) => {
  try {
    const response = await axiosInstance.post(
      "/pgbooking/create",
      pgBookingData
    );
    return response.data;
  } catch (error) {
    console.error("Failed to create Pg bookings:", error);
    throw error;
  }
};


export const updatePgBookingStatus = async (bookingId : string, status : string) => {
  try {
    const response = await axiosInstance.patch(`/pgbooking/update/${bookingId}`, {status});
    return response.data;
  } catch (error) {
    console.error("Failed to update Pg bookings:", error);
    throw error;
  }
}
