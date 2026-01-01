import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '@/theme';
import { Paths } from '@/navigation/paths';
import { SafeScreen } from '@/components/templates';
import type { RootScreenProps } from '@/navigation/types';

import Logo from '@/theme/assets/icons/logo.svg';

function Startup({ navigation }: RootScreenProps<Paths.Startup>) {
  const { layout, gutters } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: Paths.Login }],
      });
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
        ]}
      >
        <Logo width={300} height={300} />
        <ActivityIndicator size="large" style={[gutters.marginVertical_24]} />
      </View>
    </SafeScreen>
  );
}

export default Startup;
