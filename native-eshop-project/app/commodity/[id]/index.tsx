import { useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';
import React from 'react';

const CommodityPage = () => {
  const { id } = useLocalSearchParams();

  return (
    <View>
      <Text>Commodity details for {id}</Text>
    </View>
  );
}

export default CommodityPage