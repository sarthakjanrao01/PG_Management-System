import { axiosInstance } from "../Lib/axios";

export const fetchServices = async() => {
    try {
        const services = await axiosInstance.get("/service");
        console.log(services.data);
        return services.data;
    } catch (error) {
        console.log(error);
        throw new Error('Failed to get services');
    }
};

export const fetchServiceById = async(registerId : string) => {
    try {
        const service = await axiosInstance.get(`/service/${registerId}`);
        return service.data;
    } catch (error) {
        console.log(error);
        throw new Error("Failed to get Services")
    }
};

export const changeStatus = async(serviceId : string) => {
    try {
        const response = await axiosInstance.patch(`/service/changestatus/${serviceId}`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.log(error);
        throw new Error('Failed to change status');
    }
};

export interface serviceBody{
    provider_id: string
    category_id: string,
    sub_category_id: string,
    price: number,
    note: string,
}

export const createService = async(serviceData : serviceBody) => {
    try {
        const response = await axiosInstance.post(`/service/create`, serviceData);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.log(error);
        throw new Error('Failed to create service');
    }
};

export const updateService = async(serviceId : string, serviceData : serviceBody) => {
    try {
        const response = await axiosInstance.patch(`/service/update/${serviceId}`, serviceData);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.log(error);
        throw new Error('Failed to update service');
    }
};


export const deleteService = async(serviceId : string) => {
    try {
        const response = await axiosInstance.delete(`/service/delete/${serviceId}`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.log(error);
        throw new Error('Failed to delete service');
    }
};