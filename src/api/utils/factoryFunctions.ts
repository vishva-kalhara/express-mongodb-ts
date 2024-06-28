import { Request, Response, NextFunction } from 'express';
import { Model, Document, PopulateOptions, Query } from 'mongoose';
import catchAsync from './catchAsync';
import APIFeatures from './apiFeatures';
import userSchema from '../schemas/userSchema';
import AppError from './appError';

export const getAll = <T extends Document>(Model: Model<T>) =>
    catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
        const features = new APIFeatures<T>(Model.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        const docs = await features.query;

        res.status(200).json({
            status: 'success',
            count: docs.length,
            data: { docs },
        });
    });

export const getOne = <T extends Document>(
    _Model: Model<T>,
    populateOptions?: PopulateOptions
) =>
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        let query: Query<T | null, T> = userSchema.findById(req.params.id);

        if (populateOptions) query = query.populate(populateOptions);

        const doc = await query;

        if (!doc) {
            return next(new Error('No document found with that ID'));
        }

        res.status(200).json({
            status: 'success',
            data: {
                doc,
            },
        });
    });

export const createOne = <T extends Document>(Model: Model<T>) =>
    catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
        const doc = await Model.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                doc,
            },
        });
    });

export const updateOne = <T extends Document>(Model: Model<T>) =>
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!doc) {
            return next(new AppError('No document found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                doc,
            },
        });
    });

export const deleteOne = <T extends Document>(Model: Model<T>) =>
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const doc = await Model.findByIdAndDelete(req.params.id);

        if (!doc) {
            return next(new AppError('No document found with that ID', 404));
        }

        res.status(204).json({
            status: 'success',
            data: null,
        });
    });
