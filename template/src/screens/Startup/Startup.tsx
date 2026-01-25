import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useTheme } from '@/theme';
import { Paths } from '@/navigation/paths';
import { SafeScreen } from '@/components/templates';
import type { RootScreenProps } from '@/navigation/types';

function Startup({ navigation }: RootScreenProps<Paths.Startup>) {
  const { layout, colors, fonts } = useTheme();

  useEffect(() => {
    // Only used in the unauthenticated stack to transition to Login
    const timer = setTimeout(() => {
      navigation.replace(Paths.Login);
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeScreen>
      <View
        style={[
          layout.flex_1,
          layout.col,
          layout.itemsCenter,
          layout.justifyCenter,
          { backgroundColor: '#fff' }
        ]}
      >
        <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#F6FEF9', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <Text style={[fonts.bold, { color: colors.primaryGreen, fontSize: 40 }]}>CM</Text>
        </View>
        <Text style={[fonts.size_24, fonts.bold, { color: colors.primaryGreen, marginBottom: 8 }]}>CropMart</Text>
        <ActivityIndicator size="large" color={colors.primaryGreen} />
      </View>
    </SafeScreen>
  );
}

export default Startup;
