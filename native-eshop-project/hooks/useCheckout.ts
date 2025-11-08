// native-eshop-project\hooks\useCheckout.ts
import axios from 'axios'
import * as WebBrowser from 'expo-web-browser'
import { useContext } from 'react'
import { VariablesContext } from '@/context/VariablesContext'
import type { ShippingInfoType } from '@/types/commerce.types'

export const useCheckoutNative = () => {
  const { url, globalParticipant } = useContext(VariablesContext)

  const handleCheckout = async (form: ShippingInfoType) => {
    if (!globalParticipant?._id) {
      console.error('No participant found')
      return
    }

    const participantInfo = {
      _id: globalParticipant._id,
      name: form.fullName,
      surname: form.fullName,
      email: globalParticipant.email,
    }

    try {
      console.log('💳 Creating checkout session...')
      const response = await axios.post(`${url}/api/stripe/checkout/cart`, {
        participantId: globalParticipant._id,
        participantInfo,
        shippingInfo: form,
      })

      const { data } = response.data
      const checkoutUrl = data.url || data.sessionUrl || null

      if (!checkoutUrl) {
        console.error('No checkout URL returned from backend')
        return
      }

      console.log('🌐 Opening Stripe checkout URL:', checkoutUrl)
      await WebBrowser.openBrowserAsync(checkoutUrl)
    } catch (error) {
      console.error('Error during checkout:', error)
    }
  }

  return { handleCheckout }
}
