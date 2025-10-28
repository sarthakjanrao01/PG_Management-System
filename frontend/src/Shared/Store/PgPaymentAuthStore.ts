import { axiosInstance } from "../Lib/axios";

export const createPgPaymentOrder = async (amount: number) => {
    try {
        const response = await axiosInstance.post("/pgpayment/order", { amount });
        return response.data;
    } catch (error) {
        console.error("Error creating order:", error);
        throw error;
    }
};


interface PgPaymentVerifyBody{
    user_id: string;
    pg_id: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export const pgPaymentVerify = async (data: PgPaymentVerifyBody) => {
    try {
        const response = await axiosInstance.post("/pgpayment/verify", data);
        return response.data;
    } catch (error) {
        console.error("Error verifying order:", error);
        throw error;
    }
}