import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import type { AdminDrawerParamList } from '../navigation/types';
import { Platform } from 'react-native';
import { signOut } from '../auth';

const tabs: Array<{ label: string; route: keyof AdminDrawerParamList }> = [
  { label: 'Dashboard', route: 'Dashboard' },
  { label: 'Orders', route: 'Orders' },
  { label: 'Products', route: 'Products' },
];

type Props = DrawerContentComponentProps;

export default function AdminSidebar({ navigation, state }: Props) {
  const activeRouteName = state.routeNames[state.index];

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Kuddles Admin</Text>

      <View style={styles.menu}>
        {tabs.map((t) => {
          const active = activeRouteName === t.route;
          return (
            <Pressable
              key={t.route}
              onPress={() => navigation.navigate(t.route as never)}
              style={[styles.item, active && styles.itemActive]}
            >
              <Text style={[styles.itemText, active && styles.itemTextActive]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
  <Text style={styles.footerText}>admin@kuddles.com</Text>
        <Pressable
          onPress={() => {
            signOut();
            if (Platform.OS === 'web') {
              window.location.reload();
            }
          }}
          style={styles.logout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 28,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E9E9EE',
  },
  brand: { fontSize: 18, fontWeight: '700', marginBottom: 18 },
  menu: { gap: 8 },
  item: { paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10 },
  itemActive: { backgroundColor: '#EAF2FF' },
  itemText: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  itemTextActive: { color: '#2563EB' },
  footer: { marginTop: 'auto', paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#F0F0F4' },
  footerText: { color: '#6B7280', fontSize: 12 },
  
  logout: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  logoutText: {
    color: '#DC2626', // red-600
    fontWeight: '600',
    fontSize: 14,
  },
  
});
