import Cart from '../models/cart.models';
import type { CartType, ParticipantType, CartItemType, CommodityType } from '../types/stripe.types';
import { Types } from 'mongoose';
import { ValidationError } from '../../utils/error/errors.types';


export const fetchCart = async (participantId: Types.ObjectId | string | ParticipantType): Promise<CartType> => {

  const cart = await Cart.findOne({ participant: participantId })
    .populate<{ items: (CartItemType & { commodity: CommodityType })[] }>('items.commodity');

  if (!cart || cart.items.length === 0) {
    throw new ValidationError('Cart is empty or not found');
  }

  return cart;
};