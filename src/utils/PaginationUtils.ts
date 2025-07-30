import { Query } from 'mongoose';

export interface PaginationOptions {
    page?: number;
    limit?: number;
    sort?: Record<string, 1 | -1>;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export class PaginationUtils {
    static DEFAULT_PAGE = 1;
    static DEFAULT_LIMIT = 10;
    static MAX_LIMIT = 100;

    static getOptions(options?: PaginationOptions): Required<PaginationOptions> {
        const page = Math.max(1, options?.page || this.DEFAULT_PAGE);
        const limit = Math.min(this.MAX_LIMIT, Math.max(1, options?.limit || this.DEFAULT_LIMIT));
        const sort = options?.sort || { createdAt: -1 };

        return { page, limit, sort };
    }

    static async paginate<T>(query: Query<T[], T>, options?: PaginationOptions): Promise<PaginatedResponse<T>> {
        const { page, limit, sort } = this.getOptions(options);
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            query.sort(sort).skip(skip).limit(limit),
            query.model.countDocuments(query.getFilter())
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        };
    }
} 