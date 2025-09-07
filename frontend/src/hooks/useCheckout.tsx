import axios from 'axios' 
import { loadStripe } from '@stripe/stripe-js'
import { useContext } from "react";
// import { UserAuthContext } from "../../context/UserAuthContext";
import { VariablesContext } from "../context/VariablesContext";
import type { ShippingInfoType } from '../types/commerce.types';

const PUBLIC_STRIPE_KEY = import.meta.env.VITE_PUBLIC_STRIPE_KEY

const stripePromise = loadStripe(`${PUBLIC_STRIPE_KEY}`)

 export const useCheckout = () => {
  const { url, globalParticipant } = useContext(VariablesContext);

  const handleCheckout = async (form: ShippingInfoType) => {
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
    console.log(">>> button clicked, participant_id =", globalParticipant._id)

    try {
      // added participant info to be sent to back via url params
      // added shipping inf to be sent to back in body
      const response = await axios.post(`${url}/api/stripe/checkout/cart`, {
        participantId: globalParticipant._id, 
        participantInfo,
        shippingInfo: form
      })

      const { data } = response.data;

      const stripe = await stripePromise
      if (!stripe) {
        throw new Error("Stripe failed to initialize");
      }
      await stripe.redirectToCheckout({ sessionId: data.id })
    } catch (error) {
      console.error("Error during checkout:", error)
    }
  }

  return { handleCheckout };
}