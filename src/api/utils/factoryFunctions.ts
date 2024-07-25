import { Request, Response, NextFunction } from 'express';
import { Model, Document, PopulateOptions, Query } from 'mongoose';
import catchAsync from './catchAsync';
import APIFeatures from './apiFeatures';
import AppError from './appError';
import { filterObj } from './filterObj';
import { IRequestWithUser } from '../types/authTypes';

/**
 * @description Retrieves all documents from the specified model based on query parameters for filtering, sorting, field limiting, and pagination.
 *
 * @template T - The type of the document being retrieved.
 *
 * @param {Model<T>} Model - The Mongoose model from which to retrieve documents.
 *
 * @returns {Function} - Returns an asynchronous middleware function to handle the get all request.
 *
 * @throws {AppError} - Throws an error if the document retrieval fails.
 *
 * @async
 */
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

/**
 * @description Retrieves a single document from the specified model by its ID. Optionally populates specified fields.
 *
 * @template T - The type of the document being retrieved.
 *
 * @param {Model<T>} Model - The Mongoose model from which to retrieve the document.
 * @param {PopulateOptions} [populateOptions] - Optional population options to specify which fields to populate.
 *
 * @returns {Function} - Returns an asynchronous middleware function to handle the get one request.
 *
 * @throws {Error} - Throws an error if no document is found with the specified ID.
 *
 * @async
 */
export const getOne = <T extends Document>(
    Model: Model<T>,
    populateOptions?: PopulateOptions
) =>
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        let query: Query<T | null, T> = Model.findById(req.params.id);

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

/**
 * @description Creates a new document in the specified model and returns the created document.
 * Optionally filters the fields to include or exclude based on the provided options.
 *
 * @template T - The type of the document being created.
 *
 * @param {Model<T>} Model - The Mongoose model used to create the document.
 * @param {Object} [options] - Optional configuration for field filtering.
 * @param {'include' | 'exclude'} [options.type] - The type of filtering to apply ('include' to keep only specified fields, 'exclude' to remove specified fields).
 * @param {string[]} [options.fields] - The fields to include or exclude based on the `options.type` setting.
 *
 * @returns {Function} - Returns an asynchronous middleware function to handle the create request.
 *
 * @throws {AppError} - Throws an error if the document creation fails.
 *
 * @async
 */
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

/**
 * @description Updates a single document in the specified model by its ID. Optionally filters the fields to include or exclude based on the provided options. The document ID can be obtained from either the JWT or request parameters.
 *
 * @template T - The type of the document being updated.
 *
 * @param {Model<T>} Model - The Mongoose model used to update the document.
 * @param {Object} [options] - Optional configuration for field filtering and document ID source.
 * @param {'jwt' | 'params'} [options.docIdFrom] - Specifies whether the document ID is obtained from the JWT or request parameters.
 * @param {'include' | 'exclude'} [options.type] - The type of filtering to apply ('include' to keep only specified fields, 'exclude' to remove specified fields).
 * @param {string[]} [options.fields] - The fields to include or exclude based on the `options.type` setting.
 *
 * @returns {Function} - Returns an asynchronous middleware function to handle the update request.
 *
 * @throws {AppError} - Throws an error if no document is found with the specified ID.
 *
 * @async
 */
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

/**
 * @description Deletes a single document from the specified model by its ID. If no document is found with the specified ID, an error is returned.
 *
 * @template T - The type of the document being deleted.
 *
 * @param {Model<T>} Model - The Mongoose model from which to delete the document.
 *
 * @returns {Function} - Returns an asynchronous middleware function to handle the delete request.
 *
 * @throws {AppError} - Throws an error if no document is found with the specified ID.
 *
 * @async
 */
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
