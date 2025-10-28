import createHttpError from "http-errors";
import ContactUsModel from "../Models/ContactUs.model";
import { RequestHandler } from "express";

interface ContactUsBody {
  name: string;
  email: string;
  message: string;
  isActive: boolean;
}

export const getAllContactUs: RequestHandler = async (req, res, next) => {
  try {
    const contactUs = await ContactUsModel.find().exec();
    res.status(200).json(contactUs);
  } catch (error) {
    console.error("Failed to get all contact us:", error);
    next(error);
  }
};

export const createContactUs: RequestHandler<
  unknown,
  unknown,
  ContactUsBody,
  unknown
> = async (req, res, next) => {
  const { name, email, message } = req.body;

  try {
    // Validate that all required fields are provided
    if (!name || !email || !message) {
      throw createHttpError(400, "Please provide all required fields");
    }

    // Check if the contact already exists with the same email
    const existingContact = await ContactUsModel.findOne({ email });
    if (existingContact) {
      throw createHttpError(
        400,
        "Contact message already exists for this email"
      );
    }

    // Create a new contact message
    const newContactUs = await ContactUsModel.create({
      name,
      email,
      message,
      isActive: false, // Assuming new messages are inactive by default
    });

    // Send the response with the created contact message
    res.status(201).json(newContactUs);
  } catch (error) {
    next(error); // Forward the error to the error handling middleware
  }
};

export const deleteContactUs: RequestHandler = async (req, res, next) => {
  const { contactus_id } = req.params;
  try {
    await ContactUsModel.findByIdAndDelete(contactus_id);
    res.status(204).json();
  } catch (error) {
    console.error("Failed to delete contact us:", error);
    next(error);
  }
};