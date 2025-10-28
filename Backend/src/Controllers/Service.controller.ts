import { RequestHandler } from "express";
import serviceModel from "../Models/Service.model";
import createHttpError from "http-errors";
import mongoose, { isValidObjectId, ObjectId } from "mongoose";

export const getServices: RequestHandler = async (req, res, next) => {
  try {
    const services = await serviceModel.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $lookup: {
          from: "subcategories",
          localField: "sub_category_id",
          foreignField: "_id",
          as: "subcategory",
        },
      },
      {
        $lookup: {
          from: "registers",
          localField: "provider_id",
          foreignField: "_id",
          as: "serviceprovider",
        },
      },
      {
        $match: {
          category: { $ne: [] },
          subcategory: { $ne: [] },
          serviceprovider: { $ne: [] },
        },
      },
    ]);

    res.status(200).json({ services });
  } catch (error) {
    next(error);
  }
};

// Get Service by ID

export const getServiceById: RequestHandler = async (req, res, next) => {
  const serviceId = req.params.service_id;

  try {
    const objectId = new mongoose.Types.ObjectId(serviceId);
    const service = await serviceModel.aggregate([
      {
        $match: { _id: objectId },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $lookup: {
          from: "subcategories",
          localField: "sub_category_id",
          foreignField: "_id",
          as: "subcategory",
        },
      },
      {
        $lookup: {
          from: "registers",
          localField: "provider_id",
          foreignField: "_id",
          as: "serviceprovider",
        },
      },
      {
        $match: {
          category: { $ne: [] },
          subcategory: { $ne: [] },
          serviceprovider: { $ne: [] },
        },
      },
    ]);

    if (!service) {
      throw createHttpError(404, "Service ID not found");
    } else {
      res.status(200).json({ service });
    }
  } catch (error) {
    next(error);
  }
};

// Create Service

interface ServiceBody {
  provider_id: ObjectId;
  category_id: ObjectId;
  sub_category_id: ObjectId;
  price: number;
  note: string;
  isActive: boolean;
}

export const createService: RequestHandler<
  unknown,
  unknown,
  ServiceBody,
  unknown
> = async (req, res, next) => {
  const { provider_id, category_id, sub_category_id, price, note } =
    req.body;

  try {
    if (
      !provider_id ||
      !category_id ||
      !sub_category_id ||
      !price ||
      !note
    ) {
      throw createHttpError(400, "Please provide all required fields");
    } else {
      const checkService = await serviceModel.find({
        provider_id: provider_id,
        sub_category_id: sub_category_id,
        category: { $ne: "pgOwner" }, // Exclude records where category is "Pg Owner"
      });
      if (checkService.length > 0) {
        // res.status(201).json(checkService);
        throw createHttpError(404, "Service Already Exist");
      } else {
        const newService = await serviceModel.create({
          provider_id,
          category_id,
          sub_category_id,
          price,
          note,
          isActive : false,
        });
        res.status(201).json(newService);
      }
    }
  } catch (error) {
    next(error);
  }
};

export const changeStatus : RequestHandler = async (req, res, next) => {
  const serviceId = req.params.service_id;

  try {
    if (!isValidObjectId(serviceId)) {
      throw createHttpError(400, "Invalid service ID");
    }
    const service = await serviceModel.findById(serviceId);
    if (!service) {
          throw createHttpError(404, "Service ID not found");
        }
    
        // Reverse the isActive value
        const isActive = !service.isActive;
        const updatedService = await serviceModel.findByIdAndUpdate(
          serviceId,
          { isActive },
          { new: true }
        );
        if(!updateService)
        {
          throw createHttpError(404, "Failed to update Service Status");
        }
        res.status(200).json(updatedService);
  }
  catch(error)
  {
    next(error);
  }
}
// Update Service

// Interfaces for Update Service
interface UpdateServiceParams {
  service_id: string;
}

interface UpdateServiceBody {
  provider_id: ObjectId;
  category_id: ObjectId;
  sub_category_id: ObjectId;
  price: number;
  note: string;
  isActive: boolean;
}

export const updateService: RequestHandler<
  UpdateServiceParams,
  unknown,
  UpdateServiceBody,
  unknown
> = async (req, res, next) => {
  const { service_id: serviceId } = req.params;
  const { provider_id, category_id, sub_category_id, price, note, isActive } =
    req.body;

  try {
    // Validate input
    if (!isValidObjectId(serviceId)) {
      throw createHttpError(400, "Invalid service ID");
    }

    if (
      !isValidObjectId(provider_id) ||
      !isValidObjectId(category_id) ||
      !isValidObjectId(sub_category_id)
    ) {
      throw createHttpError(
        400,
        "Invalid ObjectId(s) provided in the request body"
      );
    }

    if (price < 0) {
      throw createHttpError(400, "Price cannot be negative");
    }

    // Fetch the service by ID
    const checkService = await serviceModel.find({
      provider_id: provider_id,
      sub_category_id: sub_category_id,
      category: { $ne: "pgOwner" }, // Exclude records where category is "Pg Owner"
    });
    if (checkService) {
      throw createHttpError(404, "Service Already Exist");
    } else {
      const updatedService = await serviceModel
        .findByIdAndUpdate(
          { _id: serviceId },
          { provider_id, category_id, sub_category_id, price, note, isActive },
          { new: true }
        )
        .exec();

      // Respond with the updated service
      res.status(200).json(updatedService);
    }
  } catch (error) {
    next(error);
  }
};

// Delete Service

export const deleteService: RequestHandler<UpdateServiceParams> = async (
  req,
  res,
  next
) => {
  const serviceId = req.params.service_id;
  try {
    const deletedService = await serviceModel.findByIdAndDelete(serviceId);
    if (!deletedService) {
      throw createHttpError(404, "Service ID not found");
    }
    res.status(204).json();
  } catch (error) {
    next(error);
  }
};
