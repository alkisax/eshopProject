## buy pipeline

### participant
στην εφαρμογή έχουμε το εξής πρόβλημα, αγορές μπορούν να γίνουν είτε απο loged in users είτε απο visitors. Για να λυθεί φτιάχτικε μια νέα οντότητα ο Participant. κάθε πελάτης είτε loged in είτε οχι αντιστοιχείτε με έναν participant και αυτός κάνει την αγορά. Αυτό στο front γινετε μέσο context

ας το δούμε στο frontend\src\context\VariablesContext.tsx

```tsx
const [globalParticipant, setGlobalParticipant] = useState<ParticipantType | null>(null);
```

στην frontend\src\context\CartActionsContext.tsx στην addOneToCart ξεκινάμε με `const participantId = await fetchParticipantId();` όπου θα έλεξουμε αν έχουμε user, αν οχι φτιάχνουμε έναν προσορινό participant, ή αν ο user είναι συσχετισμένος με κάποιο participant ή αν πρέπει να του δημιουργήσουμε έναν

αυτά γίνονται στο ίδιο αρχείο εδώ
```ts
  // part 1/2
  const fetchParticipantId = async (): Promise<string | null> => {
    console.log("enter addToCart");

    if (user) {
      // 1. get user from context
      console.log("setp 1. See if user has participant. user from context: ", user);
      const email = user?.email;
      if (!email) {
        console.error("email is required");
        return null;
      }

      // 2. see if user is assosiated with a participant
      try {
        const response = await axios.get<{ status: boolean; data: ParticipantType }>(
          `${url}/api/participant/by-email?email=${email}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        const found = response.data.data;
        setGlobalParticipant(found);
        return found._id  ?? null;
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          console.log("No participant found, will create a new one...");
        } else {
          throw err;
        }
      }

      // 3. if user without participant, create participant and add it to user
      console.log("step 3. User has not participant association");

      const newParticipantData = {
        name: user?.name,
        surname: user?.surname,
        email: user?.email,
        user: user?._id,
        transactions: [],
      };

      const response = await axios.post<{ status: boolean; data: ParticipantType }>(
        `${url}/api/participant/`,
        newParticipantData
      );
      if (!response) {
        console.error("error creating participant");
        return null;
      }

      const newParticipant = response.data.data;
      setGlobalParticipant(newParticipant);

      console.log(
        `step 3. User is associeted with a new participant. id: ${newParticipant._id}`
      );
      return newParticipant._id  ?? null;
    } else {
      // 4. if no user create a participant
      console.log("step 4. no existing user. we will create a participant not associated with a user");

      // 4a. check if guest has lockalstorage
      const storedParticipantId = localStorage.getItem("guestParticipantId");
      if (storedParticipantId) {
        // 4b. if yes refetch his cart
        try {
          const response = await axios.get<{ status: boolean; data: ParticipantType }>(
            `${url}/api/participant/${storedParticipantId}`
          );
          const newParticipant = response.data.data;
          setGlobalParticipant(newParticipant);
          console.log("Guest restored from localStorage:", response.data.data);
          return newParticipant._id  ?? null;
        } catch (err: unknown) {
          console.warn("Stored guest not found in DB, creating a new one...", err);
          localStorage.removeItem("guestParticipantId");
        }
      } else {
        // 4c. if no create a guest participant to lockal storage.
        const uuidGuest = uuidv4();
        const guestEmail = `guest-${uuidGuest}@eshop.local`;

        const newParticipantData = {
          name: "",
          surname: "",
          email: guestEmail,
          transactions: [],
        };

        const response = await axios.post<{ status: boolean; data: ParticipantType }>(
          `${url}/api/participant/`,
          newParticipantData
        );

        const newParticipant = response.data.data;
        setGlobalParticipant(newParticipant);

        // 🔑 Store the participant id for later refresh
        // added "trust me" at _id with '!'
        localStorage.setItem("guestParticipantId", newParticipant._id!.toString());

        console.log(
          `step 4. Guest is associeted with a new participant. id: ${newParticipant._id} and email: ${newParticipant.email}`
        );
        return newParticipant._id ?? null;
      }
    }
    return null;
  };
```

ας δούμε λίγο παραπάνω την λογική
- ελεγχουμε αν έχουμε loged in user
- ελέγχουμε αν ο user είναι συσχετισμένος με έναν partisipant `${url}/api/participant/by-email?email=${email}`
- αν δεν είναι δημιουργούμε έναν ` const response = await axios.post<{ status: boolean; data: ParticipantType }>(`${url}/api/participant/`,newParticipantData)`
- και τον κάνουμε global `setGlobalParticipant(newParticipant)`
- αν δεν έχουμε logedin user πρώτα ελέγχουμε αν έχει `localStorage.getItem("guestParticipantId")` (Παρ ότι guest θα μπορούσε να είναι για ώρα στην σελιδα)
- αν δεν έχει του διμιουργούμε έναν temporary participant `const response = await axios.post<{ status: boolean; data: ParticipantType }>(newParticipantData);` τα data είναι ένα uuid και κενα ""
- αν έχει (ή μολις δημιουργήσαμε) `await axios.get<{ status: boolean; data: ParticipantType }>(`${url}/api/participant/${storedParticipantId}`);`


### add to cart
στην // frontend\src\components\store_components\CommodityPage.tsx

```jsx
<>
  <CommodityPageMobile
    commodity={commodity}
    user={user}
    isFavorite={isFavorite}
    showSuggestions={showSuggestions}
    suggested={suggested}
    comments={comments}
    newComment={newComment}
    newRating={newRating}
    onAddToCart={() => addOneToCart(commodity._id)}
    onToggleFavorite={
      isFavorite ? handleRemoveFromFavorites : handleAddToFavorites
    }
    setShowSuggestions={setShowSuggestions}
    setNewComment={setNewComment}
    setNewRating={setNewRating}
    commentPage={commentPage}
    setCommentPage={setCommentPage}
    commentsPerPage={commentsPerPage}
    handleAddComment={handleAddComment}
  />
</>
```

oπότε πάμε να δουμε την
`onAddToCart={() => addOneToCart(commodity._id)}`
την παίρνουμε απο
`const { addOneToCart } = useContext(CartActionsContext)!;`

### addOneTooCart

πάμε σε `// frontend\src\context\CartActionsContext.tsx`

η addOneTooCart αρχικά φαίρνει το participantId μετά καλεί την addQuantityCommodityToCart

η addQuantityCommodityToCart →
πρώτα κανει get σε ${url}/api/cart/${participantId} για να δει αν έχεί ήδη προιόντα.

ας δούμε λίγο το endpoint

```ts
router.get("/:participantId", cartController.getCart);
```

```ts
const getCart = async (req: Request, res: Response) => {
  const participantId = req.params.participantId;
  try {
    const cart = await cartDAO.getCartByParticipant(participantId);
    return res.status(200).json({ status: true, data: cart });
```

```ts
const getCartByParticipant = async (
  participantId: string | Types.ObjectId
): Promise<CartType> => {
  const cart = await Cart.findOne({ participant: participantId }).populate<{
    items: PopulatedCartItem[];
  }>("items.commodity");
  if (!cart) {
    return createCart(participantId);
  }
  return cart;
};
```

πίσω στην addQuantityCommodityToCart
φτιάχνει τα data του προιόντως

```ts
const data = {
  commodityId,
  quantity,
};
```

μετά κάνει Patch σε `${url}/api/cart/${participantId}/items` δείνοντάς του τα data. Αυτο θα πάρει το καροτσάκι και θα του προσθέσει τα προιόντα

ας δούμε λίγο το endpoint

```ts
router.patch("/:participantId/items", cartController.addOrRemoveItem);
```

```ts
const addOrRemoveItem = async (req: Request, res: Response) => {
  try {
    const parsedParams = participantParamSchema.parse(req.params);
    const parsedBody = cartItemChangeSchema.parse(req.body);
    const { participantId } = parsedParams;
    const { commodityId, quantity } = parsedBody;

    const cart = await cartDAO.addOrRemoveItemToCart(
      participantId,
      commodityId,
      quantity
    );
    return res.status(200).json({ status: true, data: cart });
  } catch (error) {
    return handleControllerError(res, error);
  }
};
```

εδώ το dao παίρνει τα id του χρήστη και του εμπορεύματος όπως και την ποσότητσ και επιστρέφει το καροτσακι αλλαγμένο

```ts
const addOrRemoveItemToCart = async (
  participantId: string | Types.ObjectId,
  commodityId: string | Types.ObjectId,
  quantity: number
): Promise<CartType> => {
  const cart = await Cart.findOne({ participant: participantId });
  if (!cart) {
    throw new NotFoundError("Cart not found");
  }

  const commodity = await Commodity.findById(commodityId);
  if (!commodity) {
    throw new NotFoundError("Commodity not found");
  }

  const existingItem = cart.items.find(
    (item) => item.commodity.toString() === commodityId.toString()
  );

  if (existingItem) {
    // ελεγχος αν υπερβένει το στοκ
    const newQuantity = existingItem.quantity + quantity;
    if (newQuantity > commodity.stock) {
      throw new ValidationError("Not enough stock available");
    }

    // 🔹 always refresh price to current commodity.price
    existingItem.priceAtPurchase = commodity.price;

    // αλλάζω την ποσότητα προσθέτοντας/αφαιρόντας (το quantity μπορεί να είναι '-')
    existingItem.quantity += quantity;

    //If after updating, the quantity is 0 or negative (e.g. user removed items): Remove the item completely from the cart.
    if (existingItem.quantity <= 0) {
      cart.items = cart.items.filter(
        (item) => item.commodity.toString() !== commodityId.toString()
      );
    }
    // Case: The item does not exist
  } else if (quantity > 0) {
    if (quantity > commodity.stock) {
      throw new ValidationError("Not enough stock available");
    }

    cart.items.push({
      commodity: commodityId,
      quantity,
      priceAtPurchase: commodity.price,
    });
  }

  return await cart.save();
};
```

πίσω στην addOneToCart
μέχρι τώρα αυτή έχει το id του εμπορεύματος ως prop, και έχει φέρει το id του πελάτη. Με αυτά έχει αναναιώσει το καροτσάκι.

στην συνέχεια το γράφει στο ga4

ολη η addOneToCart:

```tsx
const addOneToCart = async (commodityId: string): Promise<void> => {
  try {
    const participantId = await fetchParticipantId();
    if (!participantId) {
      console.error("No participantId available, cannot add to cart");
      return;
    }

    await addQuantityCommodityToCart(participantId, commodityId, 1);
    setHasCart(true); // optimistic update
    setLoadingItemId(commodityId); //axios spamming controll

    // GA google analytics
    if (tracker?.trackEvent) {
      const commodityResponce = await axios.get<{
        status: boolean;
        data: CommodityType;
      }>(`${url}/api/commodities/${commodityId}`);
      const commodity = commodityResponce.data.data;

      tracker?.trackEvent("add_to_cart", {
        currency: commodity.currency,
        value: commodity.price,
        items: [
          {
            item_id: commodity._id,
            item_name: commodity.name,
            price: commodity.price,
            quantity: 1,
          },
        ],
      });
    }

    // this part is just for logging the cart maybe later remove
    const cartRes = await axios.get<{ status: boolean; data: CartType }>(
      `${url}/api/cart/${participantId}`
    );

    const cart = cartRes.data.data;
    setHasCart(cart.items.length > 0); // actual backend truth update
    setCartCount(cart.items.reduce((sum, item) => sum + item.quantity, 0)); // 🆕 total quantity
    console.log(`cart items:`, cart.items);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(
        "Error adding commodity to cart:",
        err.response?.data || err.message
      );
    } else {
      console.error("Unexpected error:", err);
    }
  } finally {
    setLoadingItemId(null);
  }
};
```

### shipping info

αν πατήσουμε στο navbar στο καροτσάκι
κάνει render η frontend\src\pages\Cart.tsx
που το σημαντικό εδώ είναι το <CartItemsList />

στο frontend\src\components\store_components\CartItemsList.tsx

```tsx
<Button
  id="proceed-to-shipping-btn"
  variant="contained"
  color="primary"
  onClick={() => navigate("/shipping-info")}
>
  Proceed to shipping info
</Button>
```

στο frontend\src\pages\ShippingInfo.tsx

```tsx
const ShippingInfo = () => {
  const [form, setForm] = useState<ShippingInfoType>({
    shippingEmail: "",
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
    notes: "",
    shippingMethod: "pickup"
  });

  const { handleCheckout } = useCheckout();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 Checkout form submitted", form);
    handleCheckout(form);
  };
```

και εδω αρχίζει να γίνετε πιο ενδιαφέρον γιατί καλούμε την handleCheckout στέλνοντας το form, το cart βρίσκετε σε context

### useCheckout

```tsx
// frontend\src\hooks\useCheckout.tsx
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { useContext } from "react";
// import { UserAuthContext } from "../../context/UserAuthContext";
import { VariablesContext } from "../context/VariablesContext";
import type { ShippingInfoType } from "../types/commerce.types";

const PUBLIC_STRIPE_KEY = import.meta.env.VITE_PUBLIC_STRIPE_KEY;

const stripePromise = loadStripe(`${PUBLIC_STRIPE_KEY}`);

export const useCheckout = () => {
  const { url, globalParticipant } = useContext(VariablesContext);

  const handleCheckout = async (form: ShippingInfoType) => {
    if (!globalParticipant?._id) {
      console.error("No participant found");
      return;
    }

    const participantInfo = {
      _id: globalParticipant._id,
      name: form.fullName,
      surname: form.fullName,
      email: globalParticipant.email,
    };

    console.log("participant info>>>", participantInfo);
    console.log(">>> button clicked, participant_id =", globalParticipant._id);

    try {
      // added participant info to be sent to back via url params
      // added shipping inf to be sent to back in body
      const response = await axios.post(`${url}/api/stripe/checkout/cart`, {
        participantId: globalParticipant._id,
        participantInfo,
        shippingInfo: form,
      });

      const { data } = response.data;

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to initialize");
      }
      await stripe.redirectToCheckout({ sessionId: data.id });
    } catch (error) {
      console.error("Error during checkout:", error);
    }
  };

  return { handleCheckout };
};
```

ας δούμε την λογική της λίγο παραπάνω
αρχικοποιεί με loadStripe
παίρνει url και participant απο context
απο την φόρμα και το context φτιάχνει τα info του πελάτη

```ts
const participantInfo = {
  _id: globalParticipant._id,
  name: form.fullName,
  surname: form.fullName,
  email: globalParticipant.email,
};
```

κάνει post στο `${url}/api/stripe/checkout/cart` δείνοντας τα participantId participantInfo και shippingInfo
(εδω υπάρχει δυο φορές το id αλλα δεν πειράζει)

#### backend (μεσασ στην handlecheckout)

- ας δούμε λίγο παραπάνω το endpoint

`app.use('/api/stripe', stripeRoutes);`
`router.post('/checkout/cart', stripeController.createCheckoutSession);`

backend\src\stripe\controllers\stripe.controller.ts

```tsx
const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const parsed = checkoutSessionSchema.parse(req.body);
    const participantId = parsed.participantId;
    const participantInfo = parsed.participantInfo;
    const shippinginfo = parsed.shippingInfo;

    const cart: CartType = await fetchCart(participantId);
    const session = await stripeService.createCheckoutSession(
      cart,
      participantInfo,
      shippinginfo
    );
    return res.status(200).json({ status: true, data: session });
  } catch (error) {
    return handleControllerError(res, error);
  }
};
```

εδώ κάνει δύο πράγματα καλεί την `fetchCart(participantId)` και την `stripeService.createCheckoutSession(cart, participantInfo, shippinginfo)`

ας τις δούμε
η
backend\src\stripe\daos\stripe.dao.ts
φέρνει το καροτσάκι του χρήστη

```ts
export const fetchCart = async (
  participantId: Types.ObjectId | string | ParticipantType
): Promise<CartType> => {
  const cart = await Cart.findOne({ participant: participantId }).populate<{
    items: (CartItemType & { commodity: CommodityType })[];
  }>("items.commodity");

  if (!cart || cart.items.length === 0) {
    throw new ValidationError("Cart is empty or not found");
  }

  return cart;
};
```

στην
backend\src\stripe\services\stripe.service.ts
υπάρχει η hard λογική του stripe
το σημαντικο είναι

```ts
return await stripe.checkout.sessions.create({
  mode: "payment",
  payment_method_types: ["card", "revolut_pay"],
  line_items,
  success_url: `${
    process.env.FRONTEND_URL || "http://localhost:5173"
  }/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${FRONTEND_URL}/cancel?canceled=true`,
  metadata: metadata,
});
```

όπου line items η λίστα με τα προιόντα

```ts
// backend\src\stripe\services\stripe.functions.helper.ts
import type {
  CartType,
  CartItemType,
  CommodityType,
  lineItemsType,
} from "../types/stripe.types";
import { SHIPPING_PRICE_IDS } from "../config/shippingPrices";

// για την τιμή φωνάζουμε το price_id του stripe και οχι το commodity.price γιατί η τιμή πρέπει να είναι hardcoded στο dashboard του stripe για λόγους ασφαλείας
// εχουμε cart{_id,  participant: Types.ObjectId | string | ParticipantType items: CartItemType[];}. Οπότε για να βρούμε το stripePriceId πάμε cart.items.commodity.stripePriceId, ενώ για quantity, cart.items.quantity. δες types
export const buildLineItems = (
  cart: CartType,
  shippingMethod?: "courier" | "boxnow" | "pickup"
): lineItemsType[] => {
  const items = cart.items.map((item: CartItemType) => ({
    price: (item.commodity as CommodityType).stripePriceId,
    quantity: item.quantity as number,
  }));
  if (shippingMethod && shippingMethod !== "pickup") {
    items.push({
      price: SHIPPING_PRICE_IDS[shippingMethod],
      quantity: 1,
    });
  }

  return items;
};
```

```ts
const createCheckoutSession = async (
  cart: CartType,
  participantInfo: Partial<ParticipantType> = {},
  shippingInfo: Partial<ShippingInfoType> = {}
) => {
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
  // const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

  // added to get the participant info from front to be able to create a new transaction -> metadata come from front
  const metadata = {
    participantId: participantInfo._id?.toString() || "",
    name: participantInfo.name || "",
    surname: participantInfo.surname || "",
    email: participantInfo.email as string,
    shippingEmail: shippingInfo.shippingEmail as string,
    fullName: shippingInfo.fullName || "",
    addressLine1: shippingInfo.addressLine1 || "",
    addressLine2: shippingInfo.addressLine2 || "",
    city: shippingInfo.city || "",
    postalCode: shippingInfo.postalCode || "",
    country: shippingInfo.country || "",
    phone: shippingInfo.phone || "",
    notes: shippingInfo.notes || "",
    shippingMethod:
      (shippingInfo as ShippingInfoType).shippingMethod || "pickup",
  };
  console.log("Creating checkout session with metadata:", metadata);

  const line_items: lineItemsType[] = buildLineItems(
    cart,
    shippingInfo.shippingMethod
  );

  //Stripe will still show  Google Pay / Revolut if you have them enabled in your dashboard.
  return await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card", "revolut_pay"],
    line_items,
    success_url: `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${FRONTEND_URL}/cancel?canceled=true`,
    metadata: metadata,
  });
};
```

#### και εδώ ξαναγυρνάμε στην handleCheckout στο frontend

οπου μετα το await του backend πάιρνουμε την απάντηση

μετά κάνει `await stripePromise`
όπου `const stripePromise = loadStripe(`${PUBLIC_STRIPE_KEY}`)`

και τέλος `await stripe.redirectToCheckout({ sessionId: data.id })`

Όπου αυτο που καταλαβαίνω είναι οτι ενεργοποιεί το webhook με βάση το session (Το καλεί η Stripe από τους δικούς της servers). που έχουμε οπότε περιμένουμε να ολοκληρωθεί και γυρνάμε στο success ή fail.

στο app.ts έχουμε

```ts
// stripe checkout web hook is implemented here and not in usual routes/contoller type because it has to be raw and not json so its declared before app.use(express.json())
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeController.handleWebhook
);
```

ολο το useCheckout:

```tsx
// frontend\src\hooks\useCheckout.tsx
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { useContext } from "react";
// import { UserAuthContext } from "../../context/UserAuthContext";
import { VariablesContext } from "../context/VariablesContext";
import type { ShippingInfoType } from "../types/commerce.types";

const PUBLIC_STRIPE_KEY = import.meta.env.VITE_PUBLIC_STRIPE_KEY;

const stripePromise = loadStripe(`${PUBLIC_STRIPE_KEY}`);

export const useCheckout = () => {
  const { url, globalParticipant } = useContext(VariablesContext);

  const handleCheckout = async (form: ShippingInfoType) => {
    if (!globalParticipant?._id) {
      console.error("No participant found");
      return;
    }

    const participantInfo = {
      _id: globalParticipant._id,
      name: form.fullName,
      surname: form.fullName,
      email: globalParticipant.email,
    };

    console.log("participant info>>>", participantInfo);
    console.log(">>> button clicked, participant_id =", globalParticipant._id);

    try {
      // added participant info to be sent to back via url params
      // added shipping inf to be sent to back in body
      const response = await axios.post(`${url}/api/stripe/checkout/cart`, {
        participantId: globalParticipant._id,
        participantInfo,
        shippingInfo: form,
      });

      const { data } = response.data;

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to initialize");
      }
      await stripe.redirectToCheckout({ sessionId: data.id });
    } catch (error) {
      console.error("Error during checkout:", error);
    }
  };

  return { handleCheckout };
};
```

## success pipeline

το ποιο συμαντικό σημείο είναι στο `backend\src\stripe\controllers\stripe.controller.ts` η handleWebhook

```ts
// ⚠️ Important: this route must use express.raw({ type: 'application/json' })
// instead of express.json(), otherwise signature verification will fail.
const handleWebhook = async (req: Request, res: Response) => {
  console.log("🔥 Stripe webhook hit");

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Missing STRIPE_SECRET_KEY env variable");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    // 🟢 Debug logs
    console.log("Headers:", req.headers);
    console.log("Raw body length:", req.body?.length || "not raw");
    // ✨ Unlike handleSuccess, we don’t read query params.
    // Webhooks POST a raw body + Stripe-Signature header.
    // αλλά παίρναμε το session id απο τα queries και με αυτό βρίσκαμε αν υπάρχει ήδη session. Πως γινετε εδώ αυτό;
    // In webhooks, Stripe calls your backend directly.το front κάνει μόνο το initiate της διαδικασίας. Stripe also signs it with a special header Stripe-Signature.You must verify this signature to prove it’s from Stripe.
    const sig = req.headers["stripe-signature"];
    if (!sig) {
      console.error("❌ Missing Stripe signature header");
      return res.status(400).send("Missing Stripe signature");
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body, // ⚠️ raw body, not parsed JSON - εδώ βρίσκετε πια το Payload μου με το shipping info και particippant info
        sig,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
    } catch (err) {
      console.error("⚠️ Webhook signature verification failed:", err);
      return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    }

    console.log("✅ Verified event type:", event.type);

    // ✨ Webhooks send many event types — we only care about checkout.session.completed
    // το session id για τον έλεγχο το παίρνουμε απο την απάντηση του webhook
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("💰 Session completed:", {
        id: session.id,
        email: session.metadata?.email,
        amount: session.amount_total,
      });

      // ✅ EARLY RETURN if payment not actually paid
      if (session.payment_status !== "paid") {
        return res.json({
          received: true,
          message: `Payment status: ${session.payment_status}`,
        });
      }

      const sessionId = session.id;

      // prevent duplicate transactions
      const existingTransaction = await transactionDAO.findBySessionId(
        sessionId
      );
      if (existingTransaction) {
        // ✨ In webhook we just ack and return 200 (no redirect)
        return res.json({
          received: true,
          message: "Transaction already recorded",
        });
      }

      const email = session.metadata?.email || "";
      const shipping = {
        shippingEmail: session.metadata?.shippingEmail || "",
        fullName: session.metadata?.fullName || "",
        addressLine1: session.metadata?.addressLine1 || "",
        addressLine2: session.metadata?.addressLine2 || "",
        city: session.metadata?.city || "",
        postalCode: session.metadata?.postalCode || "",
        country: session.metadata?.country || "",
        phone: session.metadata?.phone || "",
        notes: session.metadata?.notes || "",
      };

      if (!email) {
        // ✨ In webhook we don’t redirect — just log and return
        console.error("No email metadata in session");
        return res.json({ received: true, error: "noEmailMetadata" });
      }

      // κάνω τα ευρώ σέντς
      if (!session.amount_total || session.amount_total === 0) {
        return res.json({ received: true, error: "amount is 0" });
      }
      const amountTotal = session.amount_total / 100; // Stripe returns cents

      console.log(`Payment success for: ${email}, amount: ${amountTotal}`);
      console.log("shipping address: ", shipping);

      // ψαχνω τον participant απο το ημαιλ του για να τον ανανεώσω αν υπάρχει ή να τον δημιουργήσω
      // let participant = await participantDao.findParticipantByEmail(email);

      // if (participant) {
      //   console.log(`Participant ${participant.email} found`);
      // }

      // if (!participant || !participant._id) {
      //   console.log('Participant not found, creating new one...');
      //   participant = await participantDao.createParticipant({
      //     email: email,
      //     name: name,
      //     surname: surname,
      //   });
      // }

      const participantId = session.metadata?.participantId;
      if (!participantId) {
        throw new Error("Missing participantId in Stripe session metadata");
      }
      const participant = await participantDao.findParticipantById(
        participantId
      );
      if (!participant) {
        throw new Error(`Participant ${participantId} not found`);
      }

      // δημιουργία transaction
      const newTransaction = await transactionDAO.createTransaction(
        participant._id as Types.ObjectId,
        sessionId,
        shipping
      );
      console.log(newTransaction);

      // μεταφέρθεικε σε helper γιατί ήδη είναι τεράστια ⚠️⚠️⚠️⚠️
      await updateUserPurchaseHistory(participant, newTransaction);

      // persist log
      logger.info("Transaction created after Stripe webhook", {
        sessionId,
        participantId: participant._id!.toString(),
        email: participant.email,
        amount: newTransaction.amount,
        shipping,
        items: newTransaction.items.map((i) => ({
          commodity: i.commodity.toString(),
          quantity: i.quantity,
          priceAtPurchase: i.priceAtPurchase,
        })),
      });

      // αδειάζω το cart
      try {
        await cartDAO.clearCart(participant._id!);
      } catch (err) {
        if (err instanceof Error) {
          console.warn("Cart clear skipped:", err.message);
        } else {
          console.warn("Cart clear skipped:", err);
        }
      }
    }

    // ✨ Webhook endpoints must return 200 quickly, no redirects
    return res.json({ received: true });
  } catch (error) {
    console.error("handleWebhook error:", error);
    return res.status(500).send("Webhook handler failed");
  }
};

const handleCancel = (_req: Request, res: Response) => {
  return res.send("Payment canceled! :(");
};

export const stripeController = {
  createCheckoutSession,
  // handleSuccess,
  handleWebhook,
  handleCancel,
};
```

ας δούμε την λογική της λίγο

- αρχικοποιούμε με `const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);`
- παίρνουμε την υπογραφή οτι όλα είναι όκ `const sig = req.headers['stripe-signature'];`
- ⚠️ δεν ξέρω τι κάνει `let event: Stripe.Event;`
- ⚠️ δεν κατάλαβα

```ts
event = stripe.webhooks.constructEvent(
  req.body, // ⚠️ raw body, not parsed JSON - εδώ βρίσκετε πια το Payload μου με το shipping info και particippant info
  sig,
  process.env.STRIPE_WEBHOOK_SECRET as string
);
```

- ⚠️ `if(event.type === 'checkout.session.completed') ` τότε `const session = event.data.object as Stripe.Checkout.Session`
  αυτό που καταλαβαίνω οτι κάνουν τα παραπάνω είναι οτι παίρνουν την άπάντηση απο το webhook του stripe και λένε οτι είναι ολα οκ με την συναλαγή και οτι όλα έχουν τελειώσει

- ⚠️ `const sessionId = session.id`

- παίρνω όλα τα data (που τα είχα στείλει ως metadata όταν καλεσα αρχικα το stripe) απο το web hook success για να τα χρησιμοποιήσω και για να καταγράψω την επιτυχία
```ts
      const email = session.metadata?.email || '';
      const shipping = {
        shippingEmail: session.metadata?.shippingEmail || '',
        fullName: session.metadata?.fullName || '',
        addressLine1: session.metadata?.addressLine1 || '',
        addressLine2: session.metadata?.addressLine2 || '',
        city: session.metadata?.city || '',
        postalCode: session.metadata?.postalCode || '',
        country: session.metadata?.country || '',
        phone: session.metadata?.phone || '',
        notes: session.metadata?.notes || '',
      };
      const participantId = session.metadata?.participantId;
```

- απο τα metadata παίρνω το id και το χρησιμοποιώ για να βρώ ποιον user απο την mongoDB μου αφορα `const participant = await participantDao.findParticipantById(participantId)`

- φτιάχνω μια νέα συναλαγή για αυτόν τον χρήστη 
```ts
      const newTransaction = await transactionDAO.createTransaction(
        participant._id as Types.ObjectId,
        sessionId,
        shipping
      );
```

- αυτή προστέθηκε προσφατα για το user history και θα την βάλω παρακάτω `await updateUserPurchaseHistory(participant, newTransaction);`

- αδειάζω το cart `await cartDAO.clearCart(participant._id!)`

και εδώ τελειώνει

- ή updateUserPurchaseHistory
```ts
/* eslint-disable no-console */
// backend\src\stripe\services\updateUserPurchaseHistory.ts
import { Types } from 'mongoose';
import { commodityDAO } from '../daos/commodity.dao';
import { userPurchaseDAO } from '../../login/dao/userPurchase.dao';

import type { IUser } from '../../login/types/user.types';
import type { TransactionType } from '../../stripe/types/stripe.types';

export async function updateUserPurchaseHistory(
  participant: { user?: Types.ObjectId | string | IUser },
  transaction: TransactionType
): Promise<void> {
  if (!participant.user) {
    return;
  }

  const userId = participant.user.toString();

  try {
    // 1) Add transaction ID to order history
    await userPurchaseDAO.addTransaction(userId, transaction._id);

    // 2) Increase total spent
    await userPurchaseDAO.increaseTotalSpent(userId, transaction.amount);

    // 3) Purchased products
    for (const item of transaction.items) {
      const commodityId = item.commodity as Types.ObjectId;

      const commodity = await commodityDAO.findCommodityById(commodityId);
      if (!commodity || !commodity.uuid) {
        continue;
      }

      // 3A: increment if exists
      const updateResult = await userPurchaseDAO.incrementExistingProduct(
        userId,
        commodity.uuid,
        item.quantity
      );

      // 3B: if product entry does NOT exist → add new
      if (updateResult.matchedCount === 0) {
        await userPurchaseDAO.addNewPurchasedProduct(
          userId,
          commodity.uuid,
          item.quantity
        );
      }
    }

    console.log('✅ Updated user purchase history for user:', userId);
  } catch (err) {
    console.error('❌ Error updating user purchase history:', err);
  }
}
```

### stripe succeess page
μετά απο όλα αυτά αν έχουν πάει καλά ανακατευθείνομαι στη success σελίδα που έχω δηλώσει στο strip

```tsx
// frontend\src\components\store_components\CheckoutSuccess.tsx
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import {
  Typography,
  CircularProgress,
  Box,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { VariablesContext } from "../../context/VariablesContext";
import type { TransactionType } from "../../types/commerce.types";

const CheckoutSuccess = () => {
  const { url, globalParticipant, setGlobalParticipant } = useContext(VariablesContext);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      // 🟦 DEBUG
      console.log("⭐ globalParticipant at start:", globalParticipant);

      if (!globalParticipant?._id) {
        const storedId = localStorage.getItem("guestParticipantId");
        console.log("🟦 guestParticipantId from localStorage:", storedId);

        if (storedId) {
          axios.get(`${url}/api/participant/${storedId}`).then((res) => {
            console.log("🟦 Loaded participant from backend:", res.data.data);
            setGlobalParticipant(res.data.data);
          });
        }
        return;
      }

      try {
        const token = localStorage.getItem("token");

        console.log("📡 Fetching transactions for participant:", globalParticipant._id);

        const res = await axios.get<{ status: boolean; data: TransactionType[] }>(
          `${url}/api/transaction/participant/${globalParticipant._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("🔥 RAW TRANSACTIONS FROM BACKEND:", res.data.data);

        const sorted = res.data.data.sort(
          (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        );

        console.log("🔥 SORTED TRANSACTIONS:", sorted);

        // Επιβεβαιώνω ότι το πρώτο transaction έχει σωστά items
        if (sorted[0]) {
          console.log("🧪 ITEMS INSIDE FIRST TRANSACTION:", sorted[0].items);

          sorted[0].items.forEach((item, idx) => {
            console.log(`🧩 ITEM ${idx}:`, item);
            console.log("👉 commodity:", item.commodity);
            console.log("👉 images:", item.commodity?.images);
          });
        }

        setTransactions(sorted);
      } catch (err) {
        console.error("❌ Error fetching transactions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [globalParticipant?._id, setGlobalParticipant, url]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!globalParticipant?._id) {
    return <Typography color="error">❌ No participant info found. Please log in again.</Typography>;
  }

  const lastTransaction = transactions[0];

  // 🟦 DEBUG
  console.log("⭐ lastTransaction:", lastTransaction);

  if (lastTransaction?.items) {
    lastTransaction.items.forEach((item, idx) => {
      console.log(`🧩 (render) ITEM ${idx}:`, item);
      console.log("👉 (render) commodity:", item.commodity);
      console.log("👉 (render) images:", item.commodity?.images);
    });
  }

  return (
    <Box sx={{ mt: 6, display: "flex", justifyContent: "center" }}>
      <Paper
        sx={{
          p: 5,
          maxWidth: 650,
          width: "100%",
          borderRadius: 4,
          background: "linear-gradient(135deg, #f9f9ff, #ffffff)",
          boxShadow: "0px 6px 20px rgba(0,0,0,0.1)",
        }}
        elevation={0}
      >
        <Typography
          variant="h3"
          gutterBottom
          align="center"
          sx={{ fontWeight: "bold", color: "success.main" }}
        >
          ✅ Ευχαριστούμε, {globalParticipant.name || "guest"}!
        </Typography>
        <Typography variant="h6" align="center" gutterBottom>
          Η πληρωμή σας ολοκληρώθηκε με επιτυχία 🎉
        </Typography>

        {lastTransaction && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h5" gutterBottom>
              🛍️ Τελευταία αγορά
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              {new Date(lastTransaction.createdAt!).toLocaleString()}
            </Typography>

            <List dense>
              {lastTransaction.items.map((item, idx) => (
                <ListItem key={idx} sx={{ borderBottom: "1px dashed #ddd" }}>
                  {item.commodity.images && item.commodity.images?.length > 0 && (
                    <Box
                      component="img"
                      src={item.commodity.images[0]}
                      alt={item.commodity?.name}
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        mr: 2,
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.jpg";
                      }}
                    />
                  )}

                  <ListItemText
                    primary={`${item.commodity.name} × ${item.quantity}`}
                    secondary={`${item.priceAtPurchase}€ / τεμ.`}
                  />
                </ListItem>
              ))}
            </List>

            <Typography variant="h6" sx={{ mt: 2, textAlign: "right" }}>
              Σύνολο: {lastTransaction.amount}€
            </Typography>

            <Alert severity="success" sx={{ mt: 3, fontWeight: "bold" }}>
              📧 Θα λάβετε σύντομα επιβεβαίωση με email
            </Alert>
          </>
        )}

        {transactions.length > 1 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">📜 Προηγούμενες Αγορές</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {transactions.slice(1).map((t) => (
                    <ListItem key={t._id?.toString()}>
                      <Stack>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          {new Date(t.createdAt!).toLocaleString()}
                        </Typography>

                        {t.items.map((item, idx) => (
                          <Typography key={idx} variant="body2">
                            {item.commodity.name} × {item.quantity} — {item.priceAtPurchase}€
                          </Typography>
                        ))}

                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Σύνολο:</strong> {t.amount}€
                        </Typography>
                      </Stack>
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          </>
        )}
      </Paper>
    </Box>
  );
};
export default CheckoutSuccess;
```

ας δούμε την λογική της
- φέρνω το id του global participant `const storedId = localStorage.getItem("guestParticipantId");`
- φέρνω τον participant `axios.get(`${url}/api/participant/${storedId}`)`
- φέρνω ότι συναλαγές υπάρχουν στην Mongo του participant `await axios.get(`${url}/api/transaction/participant/${globalParticipant._id}``
- τις βάζω με χρονολογική σειρά `const sorted = res.data.data.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());`
