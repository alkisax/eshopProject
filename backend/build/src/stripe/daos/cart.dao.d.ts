import type { CartType } from '../types/stripe.types';
import { Types } from 'mongoose';
export declare const deleteOldCarts: (days?: number) => Promise<number>;
export declare const cartDAO: {
    getCartByParticipant: (participantId: string | Types.ObjectId) => Promise<CartType>;
    getAllCarts: () => Promise<CartType[]>;
    createCart: (participantId: string | Types.ObjectId) => Promise<CartType>;
    addOrRemoveItemToCart: (participantId: string | Types.ObjectId, commodityId: string | Types.ObjectId, quantity: number) => Promise<CartType>;
    updateItemQuantity: (participantId: string | Types.ObjectId, commodityId: string | Types.ObjectId, quantity: number) => Promise<CartType>;
    clearCart: (participantId: string | Types.ObjectId) => Promise<CartType>;
    deleteOldCarts: (days?: number) => Promise<number>;
};
