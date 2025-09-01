# Buy Cart Flow Analysis

Let's follow our buy cart flow. The question is: after Stripe checkout success (can't try it now, no card with me), is the object decremented from stock quantity? Is the transaction saved? 

For reminder, I have this for decrementing:

## Backend Components

### Commodity DAO (`backend/src/stripe/daos/commodity.dao.ts`)

**Note:** Changes were made here to become part of the session that comes from `backend/src/stripe/daos/transaction.dao.ts` createTransaction. The session comments are there.

```typescript
const sellCommodityById = async (
  id: string | Types.ObjectId,
  quantity: number,
  session?: mongoose.ClientSession // session
): Promise<CommodityType> => {
  if (quantity <= 0) {
    throw new ValidationError('Quantity must be at least 1');
  }

  const commodity = await Commodity.findById(id).session(session || null); // session;

  if (!commodity) {
    throw new NotFoundError('Commodity not found');
  }

  if (commodity.stock < quantity) {
    throw new ValidationError('Not enough quantity in stock');
  }

  const updated = await Commodity.findByIdAndUpdate(
    id, // 1️⃣ Which document? → Match by _id
    { // 2️⃣ What update to apply?
      $inc: { // Use MongoDB's $inc operator = "increment"
        soldCount: quantity, // Increase soldCount by the quantity sold
        stock: -quantity // Decrease stock by the same quantity
      }
    },
    { // 3️⃣ Options for Mongoose
      new: true, // Return the *updated* document (not the old one)
      runValidators: true,
      session // session
    }
  );

  if (!updated) {
    throw new NotFoundError('Commodity not found');
  }

  return updated;
};

// Update
const updateCommodityById = async (
  id: string | Types.ObjectId,
  updateData: Partial<CommodityType>
): Promise<CommodityType> => {
  try {
    const updated = await Commodity.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      throw new NotFoundError('Commodity not found');
    }

    return updated;
  } catch (err: unknown) {
    if (err instanceof ValidationError) {
      throw err; // keep ValidationError
    }
    if (err instanceof NotFoundError) {
      throw err; // keep NotFoundError
    }
    if (err instanceof Error && err.name === 'ValidationError') {
      throw new ValidationError(err.message);
    }
    throw new DatabaseError('Unexpected error updating commodity');
  }
};
```

### Commodity Controller (`backend/src/stripe/controllers/commodity.controller.ts`)

```typescript
// PATCH update commodity
const updateById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!id) {
    return res.status(400).json({
      status: false,
      error: 'Commodity ID is required'
    });
  }

  try {
    const updatedCommodity = await commodityDAO.updateCommodityById(id, updateData);
    console.log(`Updated commodity ${id}`);
    return res.status(200).json({
      status: true,
      data: updatedCommodity
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// PATCH sell commodity (stock decrease + soldCount increase)
const sellById = async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const quantity: number = req.body.quantity;

  if (!id || !quantity) {
    return res.status(400).json({
      status: false,
      message: 'Commodity ID and quantity are required'
    });
  }

  try {
    const updated = await commodityDAO.sellCommodityById(id, quantity);
    console.log(`Sold ${quantity} of commodity ${id}`);
    return res.status(200).json({
      status: true,
      data: updated
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

router.patch('/sell/:id', middleware.verifyToken, middleware.checkRole('ADMIN'), commodityController.sellById);
router.patch('/:id', middleware.verifyToken, middleware.checkRole('ADMIN'), commodityController.updateById);
// (update is more about restocking)
```

### Transaction Routes and Controller

```typescript
router.post('/', transactionController.create);

const create = async (req: Request, res: Response) => {
  const participantId = req.body.participant as Types.ObjectId;
  const sessionId = req.body.sessionId as string;

  if (!participantId || !sessionId) {
    return res.status(400).json({
      status: false,
      message: 'participantId and sessionId are required'
    });
  }

  try {
    const newTransaction = await transactionDAO.createTransaction(participantId, sessionId);
    return res.status(201).json({
      status: true,
      data: newTransaction
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};
```

### Transaction DAO - CreateTransaction

```typescript
const createTransaction = async (
  participantId: string | Types.ObjectId,
  sessionId: string
): Promise<TransactionType> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1️⃣ Get participant
    const participant = await Participant.findById(participantId).session(session);
    if (!participant) {
      throw new NotFoundError('Participant not found');
    }

    // 2️⃣ Get cart
    // We don't call the cart dao create logic because that creates a new cart if it doesn't exist.
    // We are at checkout here and expect the customer to have a cart when they reach here, otherwise it's wrong
    const cart = await Cart.findOne({ participant: participantId })
      .populate<{ items: PopulatedCartItem[] }>('items.commodity')
      .session(session);

    if (!cart || cart.items.length === 0) {
      throw new ValidationError('Cart is empty or not found');
    }

    // 3️⃣ Prevent duplicate sessions
    const existingTransaction = await Transaction.findOne({ sessionId }).session(session);
    if (existingTransaction) {
      throw new ValidationError('Transaction already exists for this session');
    }

    // 4️⃣ Calculate total amount & snapshot items
    const items = cart.items.map(item => ({
      commodity: item.commodity._id,
      quantity: item.quantity,
      priceAtPurchase: item.priceAtPurchase
    }));

    // Find the total price: product * quantity for each product
    const amount = items.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0);

    // 5️⃣ Here is the construction of my final transaction that I will send to stripe.
    // It has customer id, items (with products, quantity, purchase price), total value, and if it has been processed.
    // It also has the id that was used by stripe
    const transaction = new Transaction({
      participant: participantId,
      items,
      amount,
      sessionId,
      processed: false
    });
    
    // ... rest of transaction creation logic
  } catch (error) {
    // ... error handling
  }
};
```

## Frontend Components

### Cart Items List (`frontend/src/components/store_components/CartItemsList.tsx`)

```tsx
<Button
  variant="contained"
  color="primary"
  sx={{ mt: 2 }}
  onClick={() => {handleCheckout()}}
>
  Proceed to Checkout
</Button>
```

This calls the hook:

```typescript
const { handleCheckout } = useCheckout();
```

### Checkout Hook

```typescript
const PUBLIC_STRIPE_KEY = import.meta.env.VITE_PUBLIC_STRIPE_KEY;
const stripePromise = loadStripe(`${PUBLIC_STRIPE_KEY}`);

export const useCheckout = () => {
  const { url, globalParticipant } = useContext(VariablesContext);

  const handleCheckout = async () => {
    if (!globalParticipant?._id) {
      console.error("No participant found");
      return;
    }

    const participantInfo = {
      name: globalParticipant.name,
      surname: globalParticipant.surname,
      email: globalParticipant.email,
    };

    console.log("participant info>>>", participantInfo);
    console.log(">>> button clicked, participant_id =", globalParticipant._id);

    try {
      // Added participant info to be sent to back via url params
      const response = await axios.post(`${url}/api/stripe/checkout/cart`, {
        participantId: globalParticipant._id,
        participantInfo
      });

      const { data } = response.data;
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error("Stripe failed to initialize");
      }

      await stripe.redirectToCheckout({
        sessionId: data.id
      });
    } catch (error) {
      console.error("Error during checkout:", error);
    }
  };

  return { handleCheckout };
};
```

Which sends metadata and participant id to:

```
POST ${url}/api/stripe/checkout/cart
```

### Stripe Controller - Create Checkout Session

```typescript
router.post('/checkout/cart', stripeController.createCheckoutSession);

const createCheckoutSession = async (req: Request, res: Response) => {
  const participantId = req.body.participantId;
  const participantInfo = req.body.participantInfo;

  try {
    const cart: CartType = await fetchCart(participantId);
    const session = await stripeService.createCheckoutSession(cart, participantInfo);
    return res.status(200).json({
      status: true,
      data: session
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};
```

This firstly fetches the cart associated with participant:

```typescript
export const fetchCart = async (participantId: Types.ObjectId | string | ParticipantType): Promise<CartType> => {
  const cart = await Cart.findOne({ participant: participantId })
    .populate<{ items: (CartItemType & { commodity: CommodityType })[] }>('items.commodity');

  if (!cart || cart.items.length === 0) {
    throw new ValidationError('Cart is empty or not found');
  }

  return cart;
};
```

Then calls the create session with the cart and the metadata:

```typescript
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('missing env variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Takes the cart from the front and customer information as metadata
const createCheckoutSession = async (
  cart: CartType,
  participantInfo: Partial<ParticipantType> = {}
) => {
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

  // Added to get the participant info from front to be able to create a new transaction -> metadata come from front
  const metadata = {
    name: participantInfo.name || '',
    surname: participantInfo.surname || '',
    email: participantInfo.email as string
  };

  console.log('Creating checkout session with metadata:', metadata);

  const line_items: lineItemsType[] = buildLineItems(cart);

  return await stripe.checkout.sessions.create({
    // Stripe will still show Google Pay / Revolut if you have them enabled in your dashboard
    mode: 'payment',
    payment_method_types: ['card', 'revolut_pay'],
    line_items,
    success_url: `${FRONTEND_URL}/success?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${FRONTEND_URL}/cancel?canceled=true`,
    metadata: metadata
  });
};
```

This calls the line items to make the cart into stripe form creator:

```typescript
export const buildLineItems = (cart: CartType): lineItemsType[] => {
  return cart.items.map((item: CartItemType) => ({
    price: (item.commodity as CommodityType).stripePriceId,
    quantity: item.quantity as number
  }));
};
```

And creates the checkout (all these seem to work when tested).

## Success Handler (The part I'm not sure about)

In stripe routes we have:

```typescript
router.get('/success', stripeController.handleSuccess);

const handleSuccess = async (req: Request, res: Response) => {
  try {
    // Collect various user data from the success url
    const sessionId = req.query.session_id as string;

    if (!sessionId) {
      return res.status(400).json({
        status: false,
        message: 'Missing session ID.'
      });
    }

    // Prevent duplicate transactions
    const existingTransaction = await transactionDAO.findBySessionId(sessionId);
    if (existingTransaction) {
      return res.status(409).json({
        status: false,
        message: 'Transaction already recorded.'
      });
    }

    // Not sure what this does, but probably awaits the response
    const session = await stripeService.retrieveSession(sessionId);

    const name = session.metadata?.name || '';
    const surname = session.metadata?.surname || '';
    const email = session.metadata?.email || '';

    if (!email) {
      return res.status(400).json({
        status: false,
        message: 'Missing session ID.'
      });
    }

    // Convert euros to cents
    if (!session.amount_total || session.amount_total === 0) {
      return res.status(400).json({
        status: false,
        message: 'amount is 0'
      });
    }

    const amountTotal = session.amount_total / 100; // Stripe returns cents
    console.log(`Payment success for: ${email}, amount: ${amountTotal}`);

    // Search for participant by email to update if exists or create them
    let participant = await participantDao.findParticipantByEmail(email);

    if (participant) {
      console.log(`Participant ${participant.email} found`);
    }

    if (!participant || !participant._id) {
      console.log('Participant not found, creating new one...');
      // Create new participant
      participant = await participantDao.createParticipant({
        email: email,
        name: name,
        surname: surname
      });
    }

    // Create transaction
    const newTransaction = await transactionDAO.createTransaction(
      participant._id as Types.ObjectId,
      sessionId
    );

    return res.status(200).json({
      status: true,
      data: newTransaction,
      message: 'Success! Your purchase has been recorded. You will soon receive an email with the progress. Thank you!'
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};
```

## Summary

Where it:
- Collects data from query params
- Checks if session already exists so no doubles
- Retrieves session (explain?)
- Clears metadata
- Finds participant by the email in the metadata (if not found creates one - seems redundant because can't reach cart->checkout without participant, but let's leave it)
- Creates transaction and finishes

**So it creates transaction** ← (correct?)
**It does not decrement quantity** ← **This is the place to call controller for sell**