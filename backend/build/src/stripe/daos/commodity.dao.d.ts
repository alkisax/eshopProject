import mongoose from 'mongoose';
import type { CommodityType, CommentType } from '../types/stripe.types';
import { Types } from 'mongoose';
export declare const commodityDAO: {
    createCommodity: (data: Partial<CommodityType>) => Promise<CommodityType>;
    findAllCommodities: (page?: number) => Promise<CommodityType[]>;
    findCommodityById: (id: string | Types.ObjectId) => Promise<CommodityType>;
    getAllCategories: () => Promise<string[]>;
    updateCommodityById: (id: string | Types.ObjectId, updateData: Partial<CommodityType>) => Promise<CommodityType>;
    sellCommodityById: (id: string | Types.ObjectId, quantity: number, session?: mongoose.ClientSession) => Promise<CommodityType>;
    deleteCommodityById: (id: string | Types.ObjectId) => Promise<CommodityType>;
    addCommentToCommodity: (commodityId: string | Types.ObjectId, comment: CommentType) => Promise<CommodityType>;
    clearCommentsFromCommodity: (commodityId: string | Types.ObjectId) => Promise<CommodityType>;
    deleteCommentFromCommoditybyCommentId: (commodityId: string | Types.ObjectId, commentId: string | Types.ObjectId) => Promise<CommodityType>;
};
