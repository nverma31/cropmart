import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useTheme } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import { SafeScreen } from '@/components/templates';
import EnquiryList from '@/components/organisms/EnquiryList';
import EnquiryService from '@/services/api/EnquiryService';
import { PurchaseEnquiry } from '@/services/api/types';
import { SvgUri } from 'react-native-svg';

import type { RootScreenProps } from '@/navigation/types';
import { Paths } from '@/navigation/paths';
import { useFocusEffect } from '@react-navigation/native';

const EMPTY_STATE_ICON_URI = "http://localhost:3845/assets/cc361d11040d0dd6f337df5cb5940351deb2ae30.svg";

function IntermediaryDashboard({ navigation }: RootScreenProps<Paths.IntermediaryDashboard>) {
    const { layout, gutters, fonts, colors } = useTheme();
    const { user } = useAuth();

    const [enquiries, setEnquiries] = useState<PurchaseEnquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchEnquiries = async () => {
        if (!user) return;
        try {
            const data = await EnquiryService.getEnquiries();
            setEnquiries(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchEnquiries();
        }, [user])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchEnquiries();
    };

    return (
        <SafeScreen>
            {/* Header */}
            <View style={[layout.row, layout.justifyBetween, layout.itemsCenter, gutters.paddingHorizontal_32, gutters.paddingVertical_32, { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F2F4F7' }]}>
                <View>
                    <Text style={[fonts.size_24, fonts.bold, { color: '#101828' }]}>Dashboard</Text>
                    <Text style={[fonts.size_12, { color: '#667085' }]}>Welcome back, {user?.name}</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate(Paths.Profile)}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#EAECF0', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 20 }}>👤</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={[layout.flex_1, { backgroundColor: '#F9FAFB' }]}
                contentContainerStyle={[gutters.paddingHorizontal_32, gutters.paddingTop_32, gutters.paddingBottom_40]}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >

                {/* Actions Row */}
                <View style={[layout.row, layout.justifyBetween, gutters.marginBottom_24]}>
                    <TouchableOpacity
                        style={[styles.primaryButton, { backgroundColor: colors.primaryGreen, flex: 1, marginRight: 8 }]}
                        onPress={() => navigation.navigate(Paths.CreateEnquiry)}
                    >
                        <Text style={[fonts.size_16, fonts.bold, { color: '#fff' }]}>+ New Enquiry</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.secondaryButton, { borderColor: colors.primaryGreen, flex: 1, marginLeft: 8 }]}
                        onPress={() => navigation.navigate(Paths.MyFarmers)}
                    >
                        <Text style={[fonts.size_16, fonts.bold, { color: colors.primaryGreen }]}>+ Add Farmer</Text>
                    </TouchableOpacity>
                </View>

                {/* Section Title */}
                <Text style={[fonts.size_16, fonts.bold, { color: '#101828', marginBottom: 16 }]}>Recent Enquiries</Text>

                {loading ? (
                    <ActivityIndicator size="large" color={colors.primaryGreen} style={gutters.marginTop_24} />
                ) : enquiries.length > 0 ? (
                    <EnquiryList
                        enquiries={enquiries}
                        layout={layout}
                        gutters={gutters}
                        fonts={fonts}
                    />
                ) : (
                    /* Empty State */
                    <View style={styles.emptyStateCard}>
                        <View style={styles.iconCircle}>
                            <SvgUri uri={EMPTY_STATE_ICON_URI} width={40} height={40} />
                        </View>
                        <Text style={[fonts.size_16, fonts.bold, { color: '#101828', textAlign: 'center', marginBottom: 8 }]}>
                            No Enquiries Yet
                        </Text>
                        <Text style={[fonts.size_12, { color: '#475467', textAlign: 'center' }]}>
                            Create a purchase enquiry to see it here.
                        </Text>
                    </View>
                )}

            </ScrollView>
        </SafeScreen>
    );
}

const styles = StyleSheet.create({
    emptyStateCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#F2F4F7',
    },
    iconCircle: {
        width: 60, height: 60, borderRadius: 30, backgroundColor: '#F2F4F7',
        alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    },
    primaryButton: {
        height: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
    },
    secondaryButton: {
        height: 48, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center',
    },
});

export default IntermediaryDashboard;
