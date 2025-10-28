import { axiosInstance } from "../Lib/axios";

export const fetchBookings = async () => {
  try {
    const response = await axiosInstance.get("/booking");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    throw error;
  }
};

export const fetchBookingsByRegisterId = async (reg_id: string) => {
  try {
    const response = await axiosInstance.get(`/booking/byregisterid/${reg_id}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    throw error;
  }
};

interface BookingBody {
  name: string;
  user_id: string;
  category_id: string;
  sub_category_id: string;
  gender: string;
  start_date: Date;
}

export const createBooking = async (bookingData: BookingBody) => {
  try {
    const response = await axiosInstance.post("/booking/create", bookingData);
    return response.data;
  } catch (error) {
    console.error("Failed to create bookings:", error);
    throw error;
  }
};

export const updateBookingProvider = async (
  bookingId: string,
  provider_id: string
) => {
  try {
    const response = await axiosInstance.patch(
      `booking/updateprovider/${bookingId}`,
      { provider_id }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to update booking provider:", error);
    throw error;
  }
};

export const updateBookingStatusPending = async (bookingId: string) => {
  try {
    const response = await axiosInstance.patch(
      `booking/update/pendingstatus/${bookingId}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to update booking status:", error);
    throw error;
  }
};

export const updateBookingStatusCanceled = async (bookingId: string) => {
  try {
    const response = await axiosInstance.patch(
      `booking/update/cancelstatus/${bookingId}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to update booking status:", error);
    throw error;
  }
};

export const deleteBookings = async (bookingId: string) => {
  try {
    await axiosInstance.delete(`/booking/delete/${bookingId}`);
  } catch (error) {
    console.log("Failed to delete bookings:", error);
    throw error;
  }
};
