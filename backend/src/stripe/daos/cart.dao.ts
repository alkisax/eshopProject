import Cart from '../models/cart.models';
import Commodity from '../models/commodity.models';
import type { CartType, CartItemType } from '../types/stripe.types';
import type { CommodityType } from '../types/stripe.types';
import { NotFoundError, ValidationError, DatabaseError } from '../types/errors.types';
import { Types } from 'mongoose';

type PopulatedCartItem = Omit<CartItemType, 'commodity'> & { commodity: CommodityType };
// type PopulatedCart = Omit<CartType, 'items'> & { items: PopulatedCartItem[] };

// 🔹 Get cart for participant
const getCartByParticipant = async (participantId: string | Types.ObjectId): Promise<CartType> => {
  const cart = await Cart.findOne({ participant: participantId }).populate<{ items: PopulatedCartItem[] }>('items.commodity');
  if (!cart) {
    return createCart(participantId);
  }
  return cart;
};

// 🔹 Create a new empty cart for participant
const createCart = async (participantId: string | Types.ObjectId): Promise<CartType> => {
  try {
    const existing = await Cart.findOne({ participant: participantId });
    if (existing) {
      throw new ValidationError('Cart already exists for this participant');
    }

    const cart = new Cart({ participant: participantId, items: [] });
    return await cart.save();
  } catch (err: unknown)  {
    if (err instanceof ValidationError) {
      throw new ValidationError('Cart already exists for this participant');
    }
    throw new DatabaseError('Error creating cart');
  }
};

const addOrRemoveItemToCart = async (
  participantId: string | Types.ObjectId,
  commodityId: string | Types.ObjectId,
  quantity: number
): Promise<CartType> => {
  const cart = await Cart.findOne({ participant: participantId });
  if (!cart) {
    throw new NotFoundError('Cart not found');
  };

  const commodity = await Commodity.findById(commodityId);
  if (!commodity) {
    throw new NotFoundError('Commodity not found');
  };

  const existingItem = cart.items.find(item => item.commodity.toString() === commodityId.toString());

  if (existingItem) {
    // ελεγχος αν υπερβένει το στοκ
    const newQuantity = existingItem.quantity + quantity;
    if (newQuantity > commodity.stock) {
      throw new ValidationError('Not enough stock available');
    }

    // 🔹 always refresh price to current commodity.price
    existingItem.priceAtPurchase = commodity.price;

    // αλλάζω την ποσότητα προσθέτοντας/αφαιρόντας (το quantity μπορεί να είναι '-')
    existingItem.quantity += quantity;

    //If after updating, the quantity is 0 or negative (e.g. user removed items): Remove the item completely from the cart.
    if (existingItem.quantity <= 0) {
      cart.items = cart.items.filter(item => item.commodity.toString() !== commodityId.toString());
    }
  // Case: The item does not exist  
  } else if (quantity > 0) {

    if (quantity > commodity.stock) {
      throw new ValidationError('Not enough stock available');
    }
    
    cart.items.push({ commodity: commodityId, quantity, priceAtPurchase: commodity.price });
  }

  return await cart.save();
};

// 🔹 Update quantity of an item
// παρότι η παραπάνω μπορει να κάνει πχ +1 ή -1 εδώ μπορούμε να συμπληρώσουμε κατευθείαν την ποσότητα (να πεις πχ θέλω 7)
const updateItemQuantity = async (
  participantId: string | Types.ObjectId,
  commodityId: string | Types.ObjectId,
  quantity: number
): Promise<CartType> => {
  // φέρνω το cart
  const cart = await Cart.findOne({ participant: participantId });
  if (!cart) {
    throw new NotFoundError('Cart not found');
  }

  // φέρνω το προς αλλαγή αντικείμενο του cart
  const item = cart.items.find(item => item.commodity.toString() === commodityId.toString());
  if (!item) {
    throw new NotFoundError('Item not in cart');
  }

  if (quantity <= 0) {
    // αν η ποσότητα γίνει 0 το αφαιρω
    cart.items = cart.items.filter(i => i.commodity.toString() !== commodityId.toString());
  } else {
    const commodity = await Commodity.findById(commodityId);
    if (!commodity) {
      throw new NotFoundError('Commodity not found');
    };
    if (quantity > commodity.stock) {
      throw new ValidationError('Not enough stock available');
    };

    item.quantity = quantity;
    // refresh price
    item.priceAtPurchase = commodity.price;
  }

  return await cart.save();
};

// 🔹 Clear cart
const clearCart = async (participantId: string | Types.ObjectId): Promise<CartType> => {
  const cart = await Cart.findOneAndUpdate(
    { participant: participantId },
    { $set: { items: [] } },
    { new: true }
  );
  if (!cart) {
    throw new NotFoundError('Cart not found');
  }

  return cart;
};

export const cartDAO = {
  getCartByParticipant,
  createCart,
  addOrRemoveItemToCart,
  updateItemQuantity,
  clearCart,
};
