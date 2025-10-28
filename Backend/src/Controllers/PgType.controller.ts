import { RequestHandler } from "express";
import createHttpError from "http-errors";
import PgTypeModel from "../Models/PgType.model";


export const getPgTypes : RequestHandler = async (req, res, next) => {
    try {
        const types = await PgTypeModel.find();
        res.status(200).json(types);
    } catch (error) {
        next(error);
    }
};

export const getPgTypeById : RequestHandler = async (req, res, next) => {
    const pgtype_id = req.params.pgtype_id;
    try {
        const type = await PgTypeModel.findById(pgtype_id);
        if (!type) {
            throw createHttpError(404, "Pg Type Not Found");
        }
        res.status(200).json(type);
    } catch (error) {
        next(error);
    }
};

export const createPgType : RequestHandler = async (req, res, next) => {
    const name = req.body.name;
    const isActive = req.body.isActive;

try {
    const checkType = await PgTypeModel.findOne({ name : name });
    if(checkType)
    {
        throw createHttpError(400, "Type Already Exists");
    }
    else{
        const newType = await PgTypeModel.create({
            name: name,
            isActive: isActive
        });
        res.status(201).json(newType);
    }
} catch (error) {
    next(error);
}
};

export const updatePgType : RequestHandler = async (req, res, next) => {
    const pgtype_id = req.params.pgtype_id;
    const name = req.body.name;
    const isActive = req.body.isActive;

    try {
        const updatedType = await PgTypeModel.findByIdAndUpdate(pgtype_id, {
            name: name,
            isActive: isActive
        }, { new: true });
        res.status(200).json(updatedType);
    } catch (error) {
        next(error);
    }
};

export const deletePgType : RequestHandler = async (req, res, next) => {
    const pgtype_id = req.params.pgtype_id;
    try {
        const deletedType = await PgTypeModel.findByIdAndDelete(pgtype_id);
        if (!deletedType) {
            throw createHttpError(404, "Pg Type Not Found");
        }
        res.status(204).json();
    } catch (error) {
        next(error);
    }
};