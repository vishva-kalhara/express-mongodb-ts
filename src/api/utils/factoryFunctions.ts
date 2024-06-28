import { Request, Response, NextFunction } from 'express';
import { Model, Document, PopulateOptions, Query } from 'mongoose';
import catchAsync from './catchAsync';
import APIFeatures from './apiFeatures';
import userSchema from '../schemas/userSchema';
import AppError from './appError';
import { filterObj } from './filterObj';
import { IRequestWithUser } from '../types/authTypes';

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

export const createOne = <T extends Document>(
    Model: Model<T>,
    options?: {
        type: 'include' | 'exclude';
        fields: string[];
    }
) =>
    catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
        let filteredBody = req.body;
        if (options) filteredBody = filterObj(req.body, options);

        const doc = await Model.create(filteredBody);

        res.status(201).json({
            status: 'success',
            data: {
                doc,
            },
        });
    });

export const updateOne = <T extends Document>(
    Model: Model<T>,
    options?: {
        docIdFrom?: 'jwt' | 'params';
        type: 'include' | 'exclude';
        fields: string[];
    }
) =>
    catchAsync(
        async (req: IRequestWithUser, res: Response, next: NextFunction) => {
            let filteredBody = req.body;
            // if(allowedFields) filteredBody =
            if (options) filteredBody = filterObj(req.body, options);

            let documentId: string;
            if (options?.docIdFrom === 'jwt') documentId = req.user.id;
            else documentId = req.params.id;

            const doc = await Model.findByIdAndUpdate(
                documentId,
                filteredBody,
                {
                    new: true,
                    runValidators: true,
                }
            );

            if (!doc) {
                return next(
                    new AppError('No document found with that ID', 404)
                );
            }

            return res.status(200).json({
                status: 'success',
                data: {
                    doc,
                },
            });
        }
    );

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
