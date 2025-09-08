import type { CartType, ParticipantType } from '../types/stripe.types';
import { Types } from 'mongoose';
export declare const fetchCart: (participantId: Types.ObjectId | string | ParticipantType) => Promise<CartType>;
