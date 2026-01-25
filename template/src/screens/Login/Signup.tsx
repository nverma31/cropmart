import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useTheme } from '@/theme';
import { SafeScreen } from '@/components/templates';
import type { RootScreenProps } from '@/navigation/types';
import { Paths } from '@/navigation/paths';
import AuthService from '@/services/api/AuthService';
import { useAuth } from '@/hooks/useAuth';

function Signup({ navigation, route }: RootScreenProps<Paths.Signup>) {
    const { phone, userId, role } = route.params;
    const { layout, gutters, fonts, colors } = useTheme();
    const { setAuth } = useAuth();

    const [currentStep, setCurrentStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);

    // Profile state - common
    const [address, setAddress] = useState('');
    const [district, setDistrict] = useState('');
    const [state, setState] = useState('');
    const [pincode, setPincode] = useState('');

    // Farmer specific
    const [landHolding, setLandHolding] = useState('');

    // Intermediary specific
    const [businessName, setBusinessName] = useState('');
    const [businessType, setBusinessType] = useState('');
    const [gstNumber, setGstNumber] = useState('');

    const handleNext = () => {
        if (currentStep === 1) {
            // Validation for step 1
            if (role === 'INTERMEDIARY' && (!businessName || !businessType)) {
                Alert.alert('Required', 'Please enter business details');
                return;
            }
            setCurrentStep(2);
        }
    };

    const handleBack = () => {
        if (currentStep === 2) {
            setCurrentStep(1);
        }
    };

    const handleSubmit = async () => {
        // Validation for step 2
        if (!address || !district || !state || !pincode) {
            Alert.alert('Required', 'Please enter your address details');
            return;
        }

        setLoading(true);
        try {
            // Create profile via mock service
            await AuthService.createProfile(userId, role, {
                address,
                district,
                state,
                pincode,
                landHolding: role === 'FARMER' ? landHolding : undefined,
                businessName: role === 'INTERMEDIARY' ? businessName : undefined,
                businessType: role === 'INTERMEDIARY' ? businessType : undefined,
                gstNumber: role === 'INTERMEDIARY' ? gstNumber : undefined,
            });

            // Re-verify or just login with the user we already have
            // Since it's mock, we'll just login
            const { user, token } = await AuthService.verifyOtp(phone, '1234');
            setAuth(user, token);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create profile');
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (label: string, value: string, setValue: (t: string) => void, placeholder: string, keyboardType: 'default' | 'numeric' = 'default') => (
        <View style={gutters.marginBottom_16}>
            <Text style={[fonts.size_16, fonts.bold, { color: '#344054', marginBottom: 8 }]}>{label}</Text>
            <TextInput
                placeholder={placeholder}
                placeholderTextColor={colors.gray200}
                value={value}
                onChangeText={setValue}
                keyboardType={keyboardType}
                style={styles.input}
            />
        </View>
    );

    const renderStepContent = () => {
        if (currentStep === 1) {
            return (
                <>
                    <Text style={[fonts.size_24, fonts.bold, { color: colors.primaryGreen, marginBottom: 8 }]}>
                        {role === 'FARMER' ? 'Farmer Profile' : 'Business Details'}
                    </Text>
                    <Text style={[fonts.size_16, { color: '#475467', marginBottom: 24 }]}>
                        Let's set up your {role.toLowerCase()} account
                    </Text>

                    {role === 'FARMER' ? (
                        <>
                            {renderInput('Land Holding', landHolding, setLandHolding, 'e.g. 5 Acres')}
                        </>
                    ) : (
                        <>
                            {renderInput('Business Name', businessName, setBusinessName, 'e.g. Punjab Traders')}
                            {renderInput('Business Type', businessType, setBusinessType, 'e.g. Wholesale')}
                            {renderInput('GST Number (Optional)', gstNumber, setGstNumber, 'Enter GST number')}
                        </>
                    )}
                </>
            );
        }

        return (
            <>
                <Text style={[fonts.size_24, fonts.bold, { color: colors.primaryGreen, marginBottom: 8 }]}>Address Details</Text>
                <Text style={[fonts.size_16, { color: '#475467', marginBottom: 24 }]}>Where are you located?</Text>

                {renderInput('Address', address, setAddress, 'Enter street address')}
                {renderInput('District', district, setDistrict, 'e.g. Ludhiana')}
                {renderInput('State', state, setState, 'e.g. Punjab')}
                {renderInput('Pincode', pincode, setPincode, '6-digit pincode', 'numeric')}
            </>
        );
    };

    return (
        <SafeScreen>
            <KeyboardAvoidingView style={layout.flex_1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                {/* Header */}
                <View style={[layout.row, layout.justifyBetween, layout.itemsCenter, gutters.paddingHorizontal_32, gutters.paddingVertical_16, { backgroundColor: '#F9FAFB', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }]}>
                    <Text style={[fonts.size_16, { color: '#667085' }]}>Step {currentStep} of 2</Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${(currentStep / 2) * 100}%` }]} />
                </View>

                <ScrollView style={[layout.flex_1, { backgroundColor: '#fff' }]} contentContainerStyle={[gutters.paddingHorizontal_32, gutters.paddingVertical_24]}>
                    {renderStepContent()}
                </ScrollView>

                {/* Navigation Buttons */}
                <View style={[gutters.paddingHorizontal_32, gutters.paddingBottom_24, gutters.paddingTop_16, { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB' }]}>
                    <View style={layout.row}>
                        {currentStep === 2 && (
                            <TouchableOpacity
                                style={[styles.navButton, { flex: 1, marginRight: 8, backgroundColor: '#F9FAFB' }]}
                                onPress={handleBack}
                                disabled={loading}
                            >
                                <Text style={[fonts.size_16, fonts.bold, { color: '#344054' }]}>Back</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.navButton, { flex: 1, backgroundColor: colors.primaryGreen }]}
                            onPress={currentStep === 1 ? handleNext : handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={[fonts.size_16, fonts.bold, { color: '#fff' }]}>
                                    {currentStep === 1 ? 'Next' : 'Complete Profile'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeScreen>
    );
}

const styles = StyleSheet.create({
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
    progressBarContainer: {
        height: 4,
        backgroundColor: '#E5E7EB',
    },
    progressBar: {
        height: 4,
        backgroundColor: '#009666',
    },
    navButton: {
        height: 56,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default Signup;
