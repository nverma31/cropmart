import type { Paths } from '@/navigation/paths';
import type { StackScreenProps } from '@react-navigation/stack';

export type RootScreenProps<
  S extends keyof RootStackParamList = keyof RootStackParamList,
> = StackScreenProps<RootStackParamList, S>;

export type RootStackParamList = {
  [Paths.Example]: undefined;
  [Paths.Startup]: undefined;
  [Paths.Login]: undefined;
  [Paths.IntermediaryDashboard]: undefined;
  [Paths.FarmerHome]: undefined;
  [Paths.CreateEnquiry]: undefined;
  [Paths.OnboardFarmer]: undefined;
  [Paths.MyFarmers]: undefined;
  [Paths.Profile]: undefined;
  [Paths.Signup]: { phone: string; userId: number; role: 'FARMER' | 'INTERMEDIARY' };
};
