"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildLineItems = void 0;
// για την τιμή φωνάζουμε το price_id του stripe και οχι το commodity.price γιατί η τιμή πρέπει να είναι hardcoded στο dashboard του stripe για λόγους ασφαλείας
// εχουμε cart{_id,  participant: Types.ObjectId | string | ParticipantType items: CartItemType[];}. Οπότε για να βρούμε το stripePriceId πάμε cart.items.commodity.stripePriceId, ενώ για quantity, cart.items.quantity. δες types
const buildLineItems = (cart) => {
    return cart.items.map((item) => ({
        price: item.commodity.stripePriceId,
        quantity: item.quantity
    }));
};
exports.buildLineItems = buildLineItems;
//# sourceMappingURL=stripe.functions.helper.js.map