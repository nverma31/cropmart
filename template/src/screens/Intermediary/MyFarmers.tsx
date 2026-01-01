import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useTheme } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import { SafeScreen } from '@/components/templates';
import FarmerService from '@/services/api/FarmerService';
import { FarmerProfile } from '@/services/api/types';
import { useFocusEffect } from '@react-navigation/native';
import type { RootScreenProps } from '@/navigation/types';
import { Paths } from '@/navigation/paths';
import { SvgUri } from 'react-native-svg';

const FARMER_ICON_URI = "http://localhost:3845/assets/dd8e078553b51fb6c1a1709df8fd7ef187e7bd74.svg"; // Reusing icon

function MyFarmers({ navigation }: RootScreenProps<Paths.MyFarmers>) { // Need to add MyFarmers to Paths!
    const { layout, gutters, fonts, colors } = useTheme();
    const { user } = useAuth();

    const [farmers, setFarmers] = useState<FarmerProfile[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFarmers = async () => {
        if (!user) return;
        try {
            const data = await FarmerService.getMyFarmers(user.id);
            setFarmers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchFarmers();
        }, [user])
    );

    const renderItem = ({ item }: { item: FarmerProfile }) => (
        <View style={styles.card}>
            <View style={[layout.row, layout.itemsCenter]}>
                <View style={[styles.avatarStats, { backgroundColor: '#E0F2FE' }]}>
                    <Text style={[fonts.size_16, fonts.bold, { color: '#026AA2' }]}>
                        {item.name.charAt(0)}
                    </Text>
                </View>
                <View style={gutters.marginLeft_12}>
                    <Text style={[fonts.size_16, fonts.bold, { color: '#101828' }]}>{item.name}</Text>
                    <Text style={[fonts.size_14, { color: '#475467' }]}>{item.location}</Text>
                </View>
            </View>
            <View style={[layout.row, layout.justifyBetween, gutters.marginTop_12, { paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F2F4F7' }]}>
                <View>
                    <Text style={[fonts.size_12, { color: '#667085' }]}>Farm Size</Text>
                    <Text style={[fonts.size_14, fonts.bold, { color: '#344054' }]}>{item.farmSize}</Text>
                </View>
                <View>
                    <Text style={[fonts.size_12, { color: '#667085' }]}>Phone</Text>
                    <Text style={[fonts.size_14, fonts.bold, { color: '#344054' }]}>{item.phone}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeScreen>
            <View style={[layout.row, layout.itemsCenter, gutters.paddingHorizontal_16, gutters.paddingVertical_16, { borderBottomWidth: 1, borderBottomColor: '#F2F4F7' }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={gutters.marginRight_16}>
                    <Text style={[fonts.size_24, { color: '#101828' }]}>←</Text>
                </TouchableOpacity>
                <Text style={[fonts.size_16, fonts.bold, { color: '#101828' }]}>My Farmers</Text>
            </View>

            <View style={[layout.flex_1, { backgroundColor: '#F9FAFB', padding: 16 }]}>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: colors.primaryGreen }]}
                    onPress={() => navigation.navigate(Paths.OnboardFarmer)}
                >
                    <Text style={[fonts.size_16, fonts.bold, { color: '#fff' }]}>+ Onboard New Farmer</Text>
                </TouchableOpacity>

                {loading ? (
                    <ActivityIndicator size="large" color={colors.primaryGreen} />
                ) : (
                    <FlatList
                        data={farmers}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ paddingBottom: 24 }}
                    />
                )}
            </View>
        </SafeScreen>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F2F4F7',
    },
    avatarStats: {
        width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    },
    addButton: {
        height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 24,
    },
});

export default MyFarmers;
