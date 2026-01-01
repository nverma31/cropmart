import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useTheme } from '@/theme';
import { SafeScreen } from '@/components/templates';
import { SvgUri } from 'react-native-svg';
import type { RootScreenProps } from '@/navigation/types';
import { Paths } from '@/navigation/paths';
import { useAuth } from '@/hooks/useAuth';

const BACK_ICON_URI = "http://localhost:3845/assets/b3acbe5bd35b31f95601aca7c7045af0eb9f4b97.svg";

function Profile({ navigation }: RootScreenProps<Paths.Profile>) {
    const { layout, gutters, fonts, colors } = useTheme();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    await logout();
                    // Application.tsx will handle navigation to Login due to useAuth state change
                }
            }
        ]);
    };

    if (!user) return null;

    const InfoRow = ({ label, value }: { label: string, value: string | undefined }) => (
        <View style={styles.infoRow}>
            <Text style={[fonts.size_12, { color: '#667085', marginBottom: 4 }]}>{label}</Text>
            <Text style={[fonts.size_16, fonts.bold, { color: '#101828' }]}>{value || 'N/A'}</Text>
        </View>
    );

    return (
        <SafeScreen>
            <View style={[layout.row, layout.itemsCenter, gutters.paddingHorizontal_32, gutters.paddingVertical_24, { backgroundColor: '#F9FAFB' }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[layout.row, layout.itemsCenter]}>
                    <SvgUri uri={BACK_ICON_URI} width={20} height={20} color="#000" />
                    <Text style={[fonts.size_16, fonts.bold, gutters.marginLeft_12, { color: '#000' }]}>Back</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={[layout.flex_1, { backgroundColor: '#F9FAFB' }]} contentContainerStyle={gutters.paddingHorizontal_32}>

                <View style={[layout.itemsCenter, gutters.marginBottom_32]}>
                    <View style={styles.profileIconCircle}>
                        <Text style={{ fontSize: 32 }}>👤</Text>
                    </View>
                    <Text style={[fonts.size_24, fonts.bold, { color: '#101828', marginTop: 16 }]}>{user.name}</Text>
                    <Text style={[fonts.size_16, { color: '#667085' }]}>{user.role}</Text>
                </View>

                <View style={styles.sectionCard}>
                    <Text style={[fonts.size_16, fonts.bold, { color: colors.primaryGreen, marginBottom: 16 }]}>Personal Details</Text>
                    <InfoRow label="Phone Number" value={user.phone} />
                    <InfoRow label="User ID" value={user.id} />
                    {user.role === 'FARMER' && (
                        <>
                            <InfoRow label="Farm Location" value={user.farmLocation} />
                            <InfoRow label="Farm Size" value={user.farmSize} />
                        </>
                    )}
                </View>

                {/* Settings / Actions */}
                <View style={styles.sectionCard}>
                    <Text style={[fonts.size_16, fonts.bold, { color: colors.primaryGreen, marginBottom: 16 }]}>Settings</Text>

                    <TouchableOpacity style={styles.actionRow} onPress={() => Alert.alert('Coming Soon', 'Edit Profile is under development.')}>
                        <Text style={[fonts.size_16, { color: '#344054' }]}>Edit Profile</Text>
                        <Text style={[fonts.size_16, { color: '#98A2B3' }]}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionRow, { borderBottomWidth: 0 }]} onPress={() => Alert.alert('Coming Soon', 'Language settings are under development.')}>
                        <Text style={[fonts.size_16, { color: '#344054' }]}>Language</Text>
                        <Text style={[fonts.size_16, { color: '#98A2B3' }]}>English →</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={[fonts.size_16, fonts.bold, { color: '#D92D20' }]}>Sign Out</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeScreen>
    );
}

const styles = StyleSheet.create({
    profileIconCircle: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center'
    },
    sectionCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 24, marginBottom: 16, borderWidth: 1, borderColor: '#F2F4F7'
    },
    infoRow: {
        marginBottom: 16,
    },
    actionRow: {
        flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F2F4F7'
    },
    logoutButton: {
        height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF3F2', marginBottom: 40
    }
});

export default Profile;
