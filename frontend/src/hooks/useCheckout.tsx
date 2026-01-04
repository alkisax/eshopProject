// frontend\src\hooks\useCheckout.tsx
import axios from 'axios' 
import { loadStripe } from '@stripe/stripe-js'
import { useContext } from "react";
// import { UserAuthContext } from "../../context/UserAuthContext";
import { VariablesContext } from "../context/VariablesContext";
import type { ShippingInfoType } from '../types/commerce.types';
import { appendShippingMethodToNotes } from '../utils/shippingNotes';

const PUBLIC_STRIPE_KEY = import.meta.env.VITE_PUBLIC_STRIPE_KEY

const stripePromise = loadStripe(`${PUBLIC_STRIPE_KEY}`)

 export const useCheckout = () => {
  const { url, globalParticipant } = useContext(VariablesContext);

  const handleCheckout = async (form: ShippingInfoType) => {
    if (!globalParticipant?._id) {
      console.error("No participant found");
      return;
    }
      
    console.log("👉 globalParticipant before checkout:", globalParticipant);

    const participantInfo = { 
      _id: globalParticipant._id,
      name: form.fullName,
      surname: form.fullName,  
      email: globalParticipant.email,
    };
    
    console.log("👉 participantInfo being sent to backend:", participantInfo);
    console.log(">>> button clicked, participant_id =", globalParticipant._id)

    const shippingWithNotes = appendShippingMethodToNotes(form);

    try {
      // added participant info to be sent to back via url params
      // added shipping inf to be sent to back in body
      const response = await axios.post(`${url}/api/stripe/checkout/cart`, {
        participantId: globalParticipant._id, 
        participantInfo,
        shippingInfo: shippingWithNotes
      })

      const { data } = response.data;

      const stripe = await stripePromise
      if (!stripe) {
        throw new Error("Stripe failed to initialize");
      }
      console.log("👉 Stripe session returned:", response.data);
      await stripe.redirectToCheckout({ sessionId: data.id })
    } catch (error) {
      console.error("Error during checkout:", error)
    }
  }

  return { handleCheckout };
}