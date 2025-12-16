// backend\src\stripe\daos\cart.dao.ts
import Cart from '../models/cart.models';
import Commodity from '../models/commodity.models';
import type { CartType, CartItemType } from '../types/stripe.types';
import type { CommodityType } from '../types/stripe.types';
import {
  NotFoundError,
  ValidationError,
  DatabaseError,
} from '../../utils/error/errors.types';
import { Types } from 'mongoose';

type PopulatedCartItem = Omit<CartItemType, 'commodity'> & {
  commodity: CommodityType;
};

// 🔹 Get cart for participant
const getCartByParticipant = async (
  participantId: string | Types.ObjectId
): Promise<CartType> => {
  const cart = await Cart.findOne({ participant: participantId }).populate<{
    items: PopulatedCartItem[];
  }>('items.commodity');
  if (!cart) {
    return createCart(participantId);
  }
  return cart;
};

const getAllCarts = async (): Promise<CartType[]> => {
  const carts = await Cart.find({}).populate<{ items: PopulatedCartItem[] }>(
    'items.commodity'
  );
  return carts;
};

// 🔹 Create a new empty cart for participant
const createCart = async (
  participantId: string | Types.ObjectId
): Promise<CartType> => {
  try {
    const existing = await Cart.findOne({ participant: participantId });
    if (existing) {
      throw new ValidationError('Cart already exists for this participant');
    }

    const cart = new Cart({ participant: participantId, items: [] });
    return await cart.save();
  } catch (err: unknown) {
    if (err instanceof ValidationError) {
      throw new ValidationError('Cart already exists for this participant');
    }
    throw new DatabaseError('Error creating cart');
  }
};

const addOrRemoveItemToCart = async (
  participantId: string | Types.ObjectId,
  commodityId: string | Types.ObjectId,
  quantity: number,
  variantId?: Types.ObjectId
): Promise<CartType> => {
  const cart = await Cart.findOne({ participant: participantId });
  if (!cart) {
    throw new NotFoundError('Cart not found');
  }

  const commodity = await Commodity.findById(commodityId);
  if (!commodity) {
    throw new NotFoundError('Commodity not found');
  }

  // αν έχει variants αλλα είναι κενά
  if (commodity.variants?.length) {
    if (!variantId) {
      throw new ValidationError('Variant selection is required');
    }

    // μου αποθηκεύει ένα array απο variants
    const variantExists = commodity.variants.find(
      (v) => v._id?.toString() === variantId.toString()
    );
    if (!variantExists || variantExists.active === false) {
      throw new ValidationError('Invalid or inactive variant');
    }
  } else {
    if (variantId) {
      throw new ValidationError('Variant not allowed for this product');
    }
  }

  const existingItem = cart.items.find(
    (item) =>
      item.commodity.toString() === commodityId.toString() &&
      String(item.variantId ?? '') === String(variantId ?? '')
  );

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
      cart.items = cart.items.filter(
        (item) =>
          item.commodity.toString() !== commodityId.toString() ||
          String(item.variantId ?? '') !== String(variantId ?? '')
      );
    }
    // Case: The item does not exist
  } else if (quantity > 0) {
    if (quantity > commodity.stock) {
      throw new ValidationError('Not enough stock available');
    }

    cart.items.push({
      commodity: commodityId,
      variantId: variantId ?? undefined,
      quantity,
      priceAtPurchase: commodity.price,
    });
  }

  return await cart.save();
};

// 🔹 Update quantity of an item
// παρότι η παραπάνω μπορει να κάνει πχ +1 ή -1 εδώ μπορούμε να συμπληρώσουμε κατευθείαν την ποσότητα (να πεις πχ θέλω 7)
const updateItemQuantity = async (
  participantId: string | Types.ObjectId,
  commodityId: string | Types.ObjectId,
  quantity: number,
  variantId?: Types.ObjectId
): Promise<CartType> => {
  // φέρνω το cart
  const cart = await Cart.findOne({ participant: participantId });
  if (!cart) {
    throw new NotFoundError('Cart not found');
  }

  // φέρνω το commodity για validation (variants + stock)
  const commodity = await Commodity.findById(commodityId);
  if (!commodity) {
    throw new NotFoundError('Commodity not found');
  }

  // =====================
  // VARIANT VALIDATION
  // =====================

  // αν το προϊόν έχει variants → το variantId είναι υποχρεωτικό
  if (commodity.variants?.length) {
    if (!variantId) {
      throw new ValidationError('Variant selection is required');
    }

    const variantExists = commodity.variants.find(
      (v) => v._id?.toString() === variantId.toString()
    );

    if (!variantExists || variantExists.active === false) {
      throw new ValidationError('Invalid or inactive variant');
    }
  } else {
    // αν ΔΕΝ έχει variants → δεν επιτρέπεται variantId
    if (variantId) {
      throw new ValidationError('Variant not allowed for this product');
    }
  }

  // =====================
  // FIND CART ITEM
  // =====================

  // βρίσκω το item στο cart με βάση commodity + variant
  const item = cart.items.find(
    (item) =>
      item.commodity.toString() === commodityId.toString() &&
      String(item.variantId ?? '') === String(variantId ?? '')
  );

  if (!item) {
    throw new NotFoundError('Item not in cart');
  }

  // =====================
  // UPDATE / REMOVE LOGIC
  // =====================

  if (quantity <= 0) {
    // αν η ποσότητα γίνει 0 ή μικρότερη → αφαιρώ ΜΟΝΟ το συγκεκριμένο variant
    cart.items = cart.items.filter(
      (i) =>
        i.commodity.toString() !== commodityId.toString() ||
        String(i.variantId ?? '') !== String(variantId ?? '')
    );
  } else {
    // έλεγχος στοκ (προς το παρόν συνολικό stock, όχι ανα variant)
    if (quantity > commodity.stock) {
      throw new ValidationError('Not enough stock available');
    }

    // ενημερώνω ποσότητα
    item.quantity = quantity;

    // refresh price (σε περίπτωση που άλλαξε το price στο admin)
    item.priceAtPurchase = commodity.price;
  }

  return await cart.save();
};

// 🔹 Clear cart
const clearCart = async (
  participantId: string | Types.ObjectId
): Promise<CartType> => {
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

// delete older than 5 days
export const deleteOldCarts = async (days = 5): Promise<number> => {
  // becomes a date obj
  const toBeCLeared = new Date();
  // today - days
  toBeCLeared.setDate(toBeCLeared.getDate() - days);

  // $lt: less than
  const result = await Cart.deleteMany({
    updatedAt: { $lt: toBeCLeared },
  });
  return result.deletedCount ?? 0;
};

export const cartDAO = {
  getCartByParticipant,
  getAllCarts,
  createCart,
  addOrRemoveItemToCart,
  updateItemQuantity,
  clearCart,
  deleteOldCarts,
};
