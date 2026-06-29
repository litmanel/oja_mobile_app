import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/auth.store';
import PhoneEntryScreen from '../screens/auth/PhoneEntryScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import BarcodeScannerScreen from '../screens/scanner/BarcodeScannerScreen';
import ScanResultScreen from '../screens/scanner/ScanResultScreen';

// ── Placeholder screens for Phase 2 ──
const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>{name} Screen</Text>
  </View>
);

const VendorOnboardingScreen = () => <PlaceholderScreen name="Vendor Onboarding" />;
const VendorHomeScreen = () => <PlaceholderScreen name="Vendor Home" />;
const BuyerHomeScreen = () => <PlaceholderScreen name="Buyer Home" />;

// ── Navigation types ──
type AuthStackParamList = {
  PhoneEntry: undefined;
  OTP: { phoneNumber: string; email: string };
};

type RootStackParamList = {
  MainTabs: undefined;
  BarcodeScanner: {
    onScanned?: (data: string, type: string) => void;
    title?: string;
    barcodeTypes?: string[];
  };
  ScanResult: { data: string; type: string };
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="PhoneEntry" component={PhoneEntryScreen} />
      <AuthStack.Screen name="OTP" component={OTPScreen} />
    </AuthStack.Navigator>
  );
}

function VendorTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#BF360C',
        tabBarInactiveTintColor: '#A08878',
        tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#D4C0A8' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={VendorHomeScreen}
        options={{ tabBarLabel: 'Home', tabBarIcon: () => <Text>🏠</Text> }}
      />
      <Tab.Screen
        name="ScanTab"
        children={() => <PlaceholderScreen name="Scan" />}
        options={{ tabBarLabel: 'Scan', tabBarIcon: () => <Text>📷</Text> }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('BarcodeScanner', {
              onScanned: (data: string, type: string) => {
                navigation.navigate('ScanResult', { data, type });
              },
            });
          },
        })}
      />
      <Tab.Screen
        name="Profile"
        children={() => <PlaceholderScreen name="Profile" />}
        options={{ tabBarLabel: 'Profile', tabBarIcon: () => <Text>👤</Text> }}
      />
    </Tab.Navigator>
  );
}

function BuyerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#BF360C',
        tabBarInactiveTintColor: '#A08878',
        tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#D4C0A8' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={BuyerHomeScreen}
        options={{ tabBarLabel: 'Home', tabBarIcon: () => <Text>🏠</Text> }}
      />
      <Tab.Screen
        name="Search"
        children={() => <PlaceholderScreen name="Search" />}
        options={{ tabBarLabel: 'Search', tabBarIcon: () => <Text>🔍</Text> }}
      />
      <Tab.Screen
        name="ScanTab"
        children={() => <PlaceholderScreen name="Scan" />}
        options={{ tabBarLabel: 'Scan', tabBarIcon: () => <Text>📷</Text> }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('BarcodeScanner', {
              onScanned: (data: string, type: string) => {
                navigation.navigate('ScanResult', { data, type });
              },
            });
          },
        })}
      />
      <Tab.Screen
        name="Profile"
        children={() => <PlaceholderScreen name="Profile" />}
        options={{ tabBarLabel: 'Profile', tabBarIcon: () => <Text>👤</Text> }}
      />
    </Tab.Navigator>
  );
}

function VendorNavigator() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="MainTabs" component={VendorTabs} />
      <RootStack.Screen
        name="BarcodeScanner"
        component={BarcodeScannerScreen}
        options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
      />
      <RootStack.Screen name="ScanResult" component={ScanResultScreen} />
    </RootStack.Navigator>
  );
}

function BuyerNavigator() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="MainTabs" component={BuyerTabs} />
      <RootStack.Screen
        name="BarcodeScanner"
        component={BarcodeScannerScreen}
        options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
      />
      <RootStack.Screen name="ScanResult" component={ScanResultScreen} />
    </RootStack.Navigator>
  );
}

// ── Loading screen while checking SecureStore ──
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#059669" />
    </View>
  );
}

export default function RootNavigator() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isNewVendor = useAuthStore((s) => s.isNewVendor);
  const role = useAuthStore((s) => s.role);
  const loadTokens = useAuthStore((s) => s.loadTokens);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {!accessToken ? (
        <AuthNavigator />
      ) : isNewVendor ? (
        // Phase 2: Vendor onboarding flow
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="PhoneEntry" component={VendorOnboardingScreen} />
        </AuthStack.Navigator>
      ) : role === 'buyer' ? (
        <BuyerNavigator />
      ) : (
        <VendorNavigator />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
