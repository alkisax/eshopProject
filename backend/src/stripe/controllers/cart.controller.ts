import type { Request, Response } from 'express';
import { cartDAO } from '../daos/cart.dao';
import { handleControllerError } from '../../utils/errorHnadler';

// GET cart
const getCart = async (req: Request, res: Response) => {
  const participantId = req.params.participantId;
  try {
    const cart = await cartDAO.getCartByParticipant(participantId);
    return res.status(200).json({ status: true, data: cart });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// POST create empty cart
const createCart = async (req: Request, res: Response) => {
  const participantId = req.body.participantId;
  try {
    const cart = await cartDAO.createCart(participantId);
    return res.status(201).json({ status: true, data: cart });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// PATCH add/remove item (increment/decrement)
const addOrRemoveItem = async (req: Request, res: Response) => {
  const { participantId } = req.params;
  const { commodityId, quantity } = req.body;

  try {
    const cart = await cartDAO.addOrRemoveItemToCart(participantId, commodityId, quantity);
    return res.status(200).json({ status: true, data: cart });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// PATCH update quantity directly
const updateQuantity = async (req: Request, res: Response) => {
  const { participantId } = req.params;
  const { commodityId, quantity } = req.body;

  try {
    const cart = await cartDAO.updateItemQuantity(participantId, commodityId, quantity);
    return res.status(200).json({ status: true, data: cart });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// DELETE clear cart
const clearCart = async (req: Request, res: Response) => {
  const { participantId } = req.params;

  try {
    const cart = await cartDAO.clearCart(participantId);
    return res.status(200).json({ status: true, data: cart });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const cartController = {
  getCart,
  createCart,
  addOrRemoveItem,
  updateQuantity,
  clearCart,
};
