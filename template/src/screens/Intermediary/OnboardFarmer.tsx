import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useTheme } from '@/theme';
import { SafeScreen } from '@/components/templates';
import { SvgUri } from 'react-native-svg';
import type { RootScreenProps } from '@/navigation/types';
import { Paths } from '@/navigation/paths';

const BACK_ICON_URI = "http://localhost:3845/assets/b3acbe5bd35b31f95601aca7c7045af0eb9f4b97.svg";
const FARMER_ONBOARD_ICON_URI = "http://localhost:3845/assets/226f25c9ac284bc8b949ac8a919adf29eca66a62.svg";

function OnboardFarmer({ navigation }: RootScreenProps<Paths.OnboardFarmer>) {
    const { layout, gutters, fonts, colors } = useTheme();

    const renderInput = (label: string, placeholder: string, multiline?: boolean) => (
        <View style={gutters.marginBottom_16}>
            <Text style={[fonts.size_16, fonts.bold, { color: '#344054', marginBottom: 8 }]}>{label}</Text>
            <TextInput
                placeholder={placeholder}
                placeholderTextColor={colors.gray200}
                multiline={multiline}
                style={[styles.input, multiline && { height: 100, textAlignVertical: 'top', paddingTop: 12 }]}
            />
        </View>
    );

    return (
        <SafeScreen>
            {/* Back Header */}
            <View style={[layout.row, layout.itemsCenter, gutters.paddingHorizontal_32, gutters.paddingVertical_24, { backgroundColor: '#F9FAFB' }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[layout.row, layout.itemsCenter]}>
                    <SvgUri uri={BACK_ICON_URI} width={20} height={20} color="#000" />
                    <Text style={[fonts.size_16, fonts.bold, gutters.marginLeft_12, { color: '#000' }]}>Back to Home</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={[layout.flex_1, { backgroundColor: '#F9FAFB' }]} contentContainerStyle={gutters.paddingBottom_40}>

                {/* Header Section */}
                <View style={[layout.itemsCenter, gutters.paddingHorizontal_32, gutters.marginBottom_32]}>
                    <View style={styles.headerIconCircle}>
                        <SvgUri uri={FARMER_ONBOARD_ICON_URI} width={32} height={32} />
                    </View>
                    <Text style={[fonts.size_32, fonts.bold, { color: colors.primaryGreen, textAlign: 'center' }]}>Onboard New Farmer</Text>
                    <Text style={[fonts.size_16, { color: '#475467', textAlign: 'center', marginTop: 8 }]}>Add a farmer to your network</Text>
                </View>

                {/* Form Section */}
                <View style={styles.formCard}>
                    {renderInput("Farmer's Full Name *", "Enter farmer's full name")}
                    {renderInput("Phone Number *", "+1 (555) 123-4567")}
                    {renderInput("Farm Location *", "City, State")}
                    {renderInput("Farm Size (acres) *", "e.g., 50")}
                    {renderInput("Primary Crop Types *", "e.g., Wheat, Corn, Soybeans", true)}

                    {/* Note Section */}
                    <View style={styles.noteBox}>
                        <Text style={[fonts.size_14, { color: '#1C398E', lineHeight: 20 }]}>
                            Note: The farmer will receive an SMS with login credentials to access their account.
                        </Text>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, { backgroundColor: colors.primaryGreen }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={[fonts.size_16, fonts.bold, { color: '#fff' }]}>Onboard Farmer</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeScreen>
    );
}

const styles = StyleSheet.create({
    headerIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#DCFCE7',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        marginHorizontal: 32,
        borderWidth: 1,
        borderColor: '#F2F4F7',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#D0D5DD',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#101828',
        backgroundColor: '#fff',
    },
    noteBox: {
        backgroundColor: '#EFF6FF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    submitButton: {
        height: 56,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default OnboardFarmer;
