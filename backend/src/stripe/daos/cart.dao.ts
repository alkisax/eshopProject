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

// 🔹 Get cart for participant\
// in: participant id, out: participant cart
const getCartByParticipant = async (
  participantId: string | Types.ObjectId
): Promise<CartType> => {
  // αναζητώ στην db το καροτσάκι
  const cart = await Cart.findOne({ participant: participantId }).populate<{
    items: PopulatedCartItem[];
  }>('items.commodity');

  // αν δεν έχει καροτσάι δημιουργώ ένα
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
// in: participant id, out: participant cart
const createCart = async (
  participantId: string | Types.ObjectId
): Promise<CartType> => {
  try {
    // ελέγχει αν υπάρχει ήδη καροτσάκι (ένα καροτσάκι ανα user/participant)
    const existing = await Cart.findOne({ participant: participantId });
    if (existing) {
      throw new ValidationError('Cart already exists for this participant');
    }

    // δημιουργία του cart στην db
    const cart = new Cart({ participant: participantId, items: [] });
    return await cart.save();
  } catch (err: unknown) {
    if (err instanceof ValidationError) {
      throw new ValidationError('Cart already exists for this participant');
    }
    throw new DatabaseError('Error creating cart');
  }
};

// in: id του χρήστη, id του εμπορεύματος και ποσότητα, id του variant του εμπορεύματος (πχ s,m,l,xl). Out: καροτσάκι
const addOrRemoveItemToCart = async (
  participantId: string | Types.ObjectId,
  commodityId: string | Types.ObjectId,
  quantity: number,
  variantId?: string | Types.ObjectId
): Promise<CartType> => {
  // φέρνουμε το καροτσάκι του participant
  const cart = await Cart.findOne({ participant: participantId });
  if (!cart) {
    throw new NotFoundError('Cart not found');
  }

  // φέρνουμε το εμπόρευμα που είναι να προσθέσουμε/αφαιρέσουμε
  const commodity = await Commodity.findById(commodityId);
  if (!commodity) {
    throw new NotFoundError('Commodity not found');
  }

  const variantKey = variantId ? variantId.toString() : '';

  // ελέγχω αν το εμπόρευμα έχει variants
  // if (Array.isArray(commodity.variants) && commodity.variants.length === 0) {
  //   throw new ValidationError('Product variants are misconfigured');
  // }

  const hasVariants =
    Array.isArray(commodity.variants) && commodity.variants.length > 0;

  if (hasVariants) {
    if (!variantId) {
      throw new ValidationError('Variant selection is required');
    }

    // μου αποθηκεύει ένα variant obj { _id, attributes, active, sku } που αντιστοιχεί στο variantId που ήρθε από το request
    const variantExists = commodity.variants?.find(
      (variant) => variant._id?.toString() === variantKey
    );
    if (!variantExists || variantExists.active === false) {
      throw new ValidationError('Invalid or inactive variant');
    }
    // αν το εμπόρευμα δεν έχει variants αλλα παρόλα αυτά μου ζητήθηκε να διαχειριστό variant σταματάω την διαδικασία
  } else {
    if (variantId) {
      throw new ValidationError('Variant not allowed for this product');
    }
  }

  // ελέγχω αν το καρατσάκι έχει ήδη ένα τέτοιο εμπόρευμα και μάλιστα με το ίδιο variant (με ?? '' ακολλουθώ την περίπτωση το αντικείμενο να μην έχει variant) (αν και τα δύο είναι undefined → ταιριάζουν, αν και τα δύο έχουν ίδιο ObjectId → ταιριάζουν)
  // φέρνω το αντικείμενο απο το cart
  const existingItem = cart.items.find(
    (item) =>
      item.commodity.toString() === commodityId.toString() &&
      String(item.variantId ?? '') === variantKey
  );

  // Προσοχή ⚠️ έχω ένα κοινό stock για όλα τα variants
  // όταν δεν είχα variants έπρεπε να ελέγχω αν το stock είναι μεγαλύτερο απο την παραγγελία. Τωρά όμως που εχω variants θα πρέπει να με απασχολεί το στοκ απο όλες τις διαφορετικές κατηγορίες του ίδιου προιόντος
  // «Πάρε όλα τα items του ίδιου προϊόντος (όλα τα variants)
  // και πες μου πόσα κομμάτια συνολικά υπάρχουν στο cart».
  // cart.items = [ { commodity: 'A', variantId: 'S', quantity: 2 }, { commodity: 'A', variantId: 'M', quantity: 1 }, { commodity: 'B', variantId: null, quantity: 4 }, ];
  // .filter → [ { commodity: 'A', variantId: 'S', quantity: 2 }, { commodity: 'A', variantId: 'M', quantity: 1 }, ]
  // .reduce → totalQuantityInCart === 3
  const totalQuantityOfCommodityInCart = cart.items
    .filter((item) => item.commodity.toString() === commodityId.toString())
    .reduce((sum, item) => sum + item.quantity, 0);

  // αν υπαρχει ήδη το αντικείμενο στο καροτσάκι
  if (existingItem) {
    // ελεγχος αν υπερβένει το στοκ
    const newTotalQuantity = totalQuantityOfCommodityInCart + quantity;

    if (newTotalQuantity > commodity.stock) {
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
          String(item.variantId ?? '') !== variantKey // ←
      );
    }
    // Case: The item does not exist ελέγχει αν υπάρχει στο στοκ και το προσθέτει
  } else if (quantity > 0) {
    if (totalQuantityOfCommodityInCart + quantity > commodity.stock) {
      throw new ValidationError('Not enough stock available');
    }

    // προσθέτει το αντικείμενο
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
  variantId?: string | Types.ObjectId
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

  const variantKey = variantId ? variantId.toString() : '';

  // =====================
  // VARIANT VALIDATION
  // =====================

  // if (Array.isArray(commodity.variants) && commodity.variants.length === 0) {
  //   throw new ValidationError('Product variants are misconfigured');
  // }

  const hasVariants =
    Array.isArray(commodity.variants) && commodity.variants.length > 0;

  // αν το προϊόν έχει variants → το variantId είναι υποχρεωτικό
  if (hasVariants) {
    if (!variantId) {
      throw new ValidationError('Variant selection is required');
    }

    const variantExists = commodity.variants?.find(
      (variant) => variant._id?.toString() === variantKey
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
      String(item.variantId ?? '') === variantKey
  );

  if (!item) {
    throw new NotFoundError('Item not in cart');
  }

  // =====================
  // TOTAL STOCK CHECK (ALL VARIANTS)
  // =====================

  // Προσοχή ⚠️ έχω ένα κοινό stock για όλα τα variants
  // «Πάρε όλα τα items του ίδιου προϊόντος (όλα τα variants)
  // εκτός από το current item
  // και πες μου πόσα κομμάτια συνολικά υπάρχουν ήδη στο cart»
  const totalQuantityOfCommodityInCart = cart.items
    .filter(
      (i) =>
        i.commodity.toString() === commodityId.toString() &&
        String(i.variantId ?? '') !== variantKey
    )
    .reduce((sum, i) => sum + i.quantity, 0);

  // =====================
  // UPDATE / REMOVE LOGIC
  // =====================

  if (quantity <= 0) {
    // αν η ποσότητα γίνει 0 ή μικρότερη → αφαιρώ ΜΟΝΟ το συγκεκριμένο variant
    cart.items = cart.items.filter(
      (i) =>
        i.commodity.toString() !== commodityId.toString() ||
        String(i.variantId ?? '') !== variantKey
    );
  } else {
    // έλεγχος στοκ (κοινό stock για όλα τα variants)
    if (totalQuantityOfCommodityInCart + quantity > commodity.stock) {
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
