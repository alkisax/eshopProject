// native-eshop-project\app\shipping-info\index.tsx
import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { useCheckoutNative } from '@/hooks/useCheckout'

type ShippingInfoType = {
  shippingEmail: string
  fullName: string
  addressLine1: string
  addressLine2: string
  city: string
  postalCode: string
  country: string
  phone: string
  notes: string
  shippingMethod: 'courier' | 'boxnow' | 'pickup'
}

const ShippingInfoScreen = () => {

  const { handleCheckout } = useCheckoutNative()

  const [form, setForm] = useState<ShippingInfoType>({
    shippingEmail: '',
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    country: '',
    phone: '',
    notes: '',
    shippingMethod: 'pickup',
  })

  const handleChange = (field: keyof ShippingInfoType, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    console.log('🚀 Checkout form submitted', form)
    await handleCheckout(form)
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Διεύθυνση Αποστολής</Text>

      {/* === Address & Contact Section === */}
      <View style={styles.formSection}>
        <CustomInput
          label="Email"
          value={form.shippingEmail}
          onChangeText={(v) => handleChange('shippingEmail', v)}
        />
        <CustomInput
          label="Ονοματεπώνυμο"
          value={form.fullName}
          onChangeText={(v) => handleChange('fullName', v)}
        />
        <CustomInput
          label="Διεύθυνση"
          value={form.addressLine1}
          onChangeText={(v) => handleChange('addressLine1', v)}
        />
        <CustomInput
          label="Διεύθυνση (2η γραμμή)"
          value={form.addressLine2}
          onChangeText={(v) => handleChange('addressLine2', v)}
        />
        <CustomInput
          label="Πόλη"
          value={form.city}
          onChangeText={(v) => handleChange('city', v)}
        />
        <CustomInput
          label="Τ.Κ."
          value={form.postalCode}
          onChangeText={(v) => handleChange('postalCode', v)}
        />
        <CustomInput
          label="Χώρα"
          value={form.country}
          onChangeText={(v) => handleChange('country', v)}
        />
        <CustomInput
          label="Τηλέφωνο"
          value={form.phone}
          onChangeText={(v) => handleChange('phone', v)}
          keyboardType="phone-pad"
        />
        <CustomInput
          label="Σημειώσεις"
          value={form.notes}
          onChangeText={(v) => handleChange('notes', v)}
          multiline
        />
      </View>

      {/* === Shipping Method Section === */}
      <View style={styles.methodSection}>
        <Text style={styles.subtitle}>Τρόπος Αποστολής</Text>

        <RadioButton
          label="Αποστολή με Courier: 3,50 €"
          selected={form.shippingMethod === 'courier'}
          onPress={() => handleChange('shippingMethod', 'courier')}
        />
        <RadioButton
          label="BOX NOW Lockers | 2,50 €"
          selected={form.shippingMethod === 'boxnow'}
          onPress={() => handleChange('shippingMethod', 'boxnow')}
        />
        <RadioButton
          label="Παραλαβή από το κατάστημα: 0 €"
          selected={form.shippingMethod === 'pickup'}
          onPress={() => handleChange('shippingMethod', 'pickup')}
        />
      </View>

      {/* === Submit Button === */}
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Πληρωμή μέσω Stripe</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

/* === Reusable Input component === */
const CustomInput = ({
  label,
  value,
  onChangeText,
  ...props
}: {
  label: string
  value: string
  onChangeText: (v: string) => void
  [key: string]: any
}) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={label}
      {...props}
    />
  </View>
)

/* === Simple Radio Button component === */
const RadioButton = ({
  label,
  selected,
  onPress,
}: {
  label: string
  selected: boolean
  onPress: () => void
}) => (
  <TouchableOpacity
    style={styles.radioRow}
    activeOpacity={0.7}
    onPress={onPress}
  >
    <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
      {selected && <View style={styles.radioInner} />}
    </View>
    <Text style={styles.radioLabel}>{label}</Text>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffdf7',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4a3f35',
    marginBottom: 16,
    textAlign: 'center',
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    backgroundColor: '#fafafa',
  },
  methodSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    elevation: 2,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#4a3f35',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#48C4CF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioOuterSelected: {
    borderColor: '#48C4CF',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#48C4CF',
  },
  radioLabel: {
    fontSize: 15,
    color: '#333',
  },
  submitBtn: {
    marginTop: 24,
    backgroundColor: '#48C4CF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})

export default ShippingInfoScreen
