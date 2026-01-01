import type { RootStackParamList } from '@/navigation/types';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Paths } from '@/navigation/paths';
import { useTheme } from '@/theme';

import { CreateEnquiry, Example, FarmerHome, IntermediaryDashboard, Login, MyFarmers, OnboardFarmer, Profile, Signup } from '@/screens';
import { AuthProvider, useAuth } from '@/hooks/useAuth';

const Stack = createStackNavigator<RootStackParamList>();

function MainNavigator() {
  const { variant } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const userRole = user?.role;

  return (
    <Stack.Navigator key={variant} screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Unauthenticated Stack
        <Stack.Group>
          <Stack.Screen component={Login} name={Paths.Login} />
          <Stack.Screen component={Signup} name={Paths.Signup} />
        </Stack.Group>
      ) : (
        // Authenticated Stack based on Role
        <Stack.Group>
          {userRole === 'INTERMEDIARY' ? (
            <>
              <Stack.Screen component={IntermediaryDashboard} name={Paths.IntermediaryDashboard} />
              <Stack.Screen component={CreateEnquiry} name={Paths.CreateEnquiry} />
              <Stack.Screen component={OnboardFarmer} name={Paths.OnboardFarmer} />
              <Stack.Screen component={MyFarmers} name={Paths.MyFarmers} />
            </>
          ) : (
            <Stack.Screen component={FarmerHome} name={Paths.FarmerHome} />
          )}
          <Stack.Screen component={Example} name={Paths.Example} />
          <Stack.Screen component={Profile} name={Paths.Profile} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}

function ApplicationNavigator() {
  const { navigationTheme } = useTheme();

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer theme={navigationTheme}>
          <MainNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default ApplicationNavigator;
