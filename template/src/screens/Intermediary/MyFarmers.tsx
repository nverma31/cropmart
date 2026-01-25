import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useTheme } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import { SafeScreen } from '@/components/templates';
import FarmerService from '@/services/api/FarmerService';
import { Farmer } from '@/services/api/types';
import { useFocusEffect } from '@react-navigation/native';
import type { RootScreenProps } from '@/navigation/types';
import { Paths } from '@/navigation/paths';

function MyFarmers({ navigation }: RootScreenProps<Paths.MyFarmers>) {
    const { layout, gutters, fonts, colors } = useTheme();
    const { user } = useAuth();

    const [farmers, setFarmers] = useState<Farmer[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchFarmers = async () => {
        if (!user) return;
        try {
            const data = await FarmerService.getFarmers();
            setFarmers(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchFarmers();
        }, [user])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchFarmers();
    };

    return (
        <SafeScreen>
            <View style={[layout.row, layout.justifyBetween, layout.itemsCenter, gutters.paddingHorizontal_32, gutters.paddingVertical_32, { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F2F4F7' }]}>
                <View>
                    <Text style={[fonts.size_24, fonts.bold, { color: '#101828' }]}>My Farmers</Text>
                    <Text style={[fonts.size_12, { color: '#667085' }]}>Manage your onboarding list</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate(Paths.OnboardFarmer)} style={[styles.addButton, { backgroundColor: colors.primaryGreen }]}>
                    <Text style={[fonts.size_16, fonts.bold, { color: '#fff' }]}>+ Onboard</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={[layout.flex_1, { backgroundColor: '#F9FAFB' }]}
                contentContainerStyle={[gutters.paddingHorizontal_32, gutters.paddingTop_32, gutters.paddingBottom_40]}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {loading ? (
                    <ActivityIndicator size="large" color={colors.primaryGreen} style={gutters.marginTop_24} />
                ) : farmers.length > 0 ? (
                    farmers.map((item) => (
                        <View key={item.id} style={styles.card}>
                            <View style={[layout.row, layout.justifyBetween, layout.itemsCenter]}>
                                <View style={layout.flex_1}>
                                    <Text style={[fonts.size_16, fonts.bold, { color: '#101828' }]}>Farmer ID: {item.id}</Text>
                                    <Text style={[fonts.size_12, { color: '#475467' }]}>{item.district}, {item.state}</Text>
                                </View>
                                <View style={styles.statusBadge}>
                                    <Text style={[fonts.size_12, fonts.bold, { color: '#039855' }]}>Active</Text>
                                </View>
                            </View>
                            <View style={[layout.row, gutters.marginTop_16, { borderTopWidth: 1, borderTopColor: '#F2F4F7', paddingTop: 16 }]}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[fonts.size_12, { color: '#667085' }]}>Land Holding</Text>
                                    <Text style={[fonts.size_12, fonts.bold, { color: '#344054' }]}>{item.landHolding || 'N/A'}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[fonts.size_12, { color: '#667085' }]}>Pincode</Text>
                                    <Text style={[fonts.size_12, fonts.bold, { color: '#344054' }]}>{item.pincode || 'N/A'}</Text>
                                </View>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={[fonts.size_16, fonts.bold, { color: '#101828', textAlign: 'center' }]}>No Farmers Yet</Text>
                        <Text style={[fonts.size_12, { color: '#667085', textAlign: 'center', marginTop: 8 }]}>Start by onboarding your first farmer.</Text>
                    </View>
                )}
            </ScrollView>
        </SafeScreen>
    );
}

const styles = StyleSheet.create({
    addButton: {
        paddingHorizontal: 16, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
    },
    card: {
        backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F2F4F7',
        shadowColor: '#101828', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
    },
    statusBadge: {
        backgroundColor: '#ECFDF3', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 16,
    },
    emptyState: {
        backgroundColor: '#fff', borderRadius: 16, padding: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F2F4F7', marginTop: 40
    }
});

export default MyFarmers;
