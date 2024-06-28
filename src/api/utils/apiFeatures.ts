import { Query } from 'mongoose';

interface QueryString {
    page?: string;
    sort?: string;
    limit?: string;
    fields?: string;
    [key: string]: any;
}

class APIFeatures<T> {
    query: Query<T[], T>;
    queryString: QueryString;

    constructor(query: Query<T[], T>, queryString: QueryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter(): this {
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach((el) => delete queryObj[el]);

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(
            /\b(gte|gt|lte|lt)\b/g,
            (match) => `$${match}`
        );

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    sort(): this {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }

        return this;
    }

    limitFields(): this {
        if (this.queryString.fields) {
            const filterBy = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(filterBy);
        } else {
            this.query = this.query.select('-__v');
        }

        return this;
    }

    paginate(): this {
        const page = parseInt(this.queryString.page || '1');
        const limit = parseInt(this.queryString.limit || '100');
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

export default APIFeatures;
