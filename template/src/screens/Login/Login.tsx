import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '@/theme';
// import { useAuth } from '@/hooks/useAuth'; // Not used directly, we use AuthService then setUser
import { useAuth } from '@/hooks/useAuth';
import AuthService from '@/services/api/AuthService';
import { SafeScreen } from '@/components/templates';
import Logo from '@/theme/assets/icons/logo.svg';
import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';

function Login({ navigation }: RootScreenProps<Paths.Login>) {
    const { layout, gutters, fonts, colors } = useTheme();
    const { setUser } = useAuth();

    // State
    const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async () => {
        if (phone.length < 10) {
            Alert.alert('Invalid Phone', 'Please enter a valid phone number.');
            return;
        }

        setLoading(true);
        try {
            await AuthService.sendOtp(phone);
            setStep('OTP');
        } catch (error) {
            Alert.alert('Error', 'Failed to send OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 4) {
            Alert.alert('Invalid OTP', 'Please enter the 4-digit OTP (1234).');
            return;
        }

        setLoading(true);
        try {
            const { user, isNewUser } = await AuthService.verifyOtp(phone, otp);

            if (isNewUser) {
                navigation.navigate(Paths.Signup, { phone });
            } else if (user) {
                setUser(user);
            }
        } catch (error: any) {
            Alert.alert('Login Failed', error.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeScreen>
            <View style={[layout.flex_1, layout.col, gutters.paddingHorizontal_32, gutters.paddingTop_40, { backgroundColor: '#fff' }]}>
                {/* Logo */}
                <View style={[layout.itemsCenter, gutters.marginBottom_32]}>
                    <Logo width={123} height={82} />
                </View>

                {/* Header */}
                <View style={[layout.itemsCenter, gutters.marginBottom_24]}>
                    <Text style={[fonts.size_32, fonts.bold, fonts.gray800]}>Welcome Back</Text>
                    <Text style={[fonts.size_16, fonts.gray400, gutters.marginTop_12]}>
                        {step === 'PHONE' ? 'Sign in to your Cropmart account' : `Enter OTP sent to ${phone}`}
                    </Text>
                </View>

                {/* Form Fields */}
                <View style={[gutters.marginBottom_32]}>
                    {step === 'PHONE' ? (
                        <View>
                            <Text style={[fonts.size_16, fonts.bold, fonts.gray800, gutters.marginBottom_12]}>Phone Number</Text>
                            <TextInput
                                placeholder="9876543210"
                                placeholderTextColor={colors.gray200}
                                style={styles.input}
                                keyboardType="phone-pad"
                                value={phone}
                                onChangeText={setPhone}
                                maxLength={10}
                            />
                        </View>
                    ) : (
                        <View>
                            <Text style={[fonts.size_16, fonts.bold, fonts.gray800, gutters.marginBottom_12]}>One Time Password (OTP)</Text>
                            <TextInput
                                placeholder="1234"
                                placeholderTextColor={colors.gray200}
                                style={[styles.input, { letterSpacing: 8, fontSize: 24, textAlign: 'center' }]}
                                keyboardType="number-pad"
                                value={otp}
                                onChangeText={setOtp}
                                maxLength={4}
                            />
                            <TouchableOpacity onPress={() => setStep('PHONE')} style={[gutters.marginTop_12, layout.itemsEnd]}>
                                <Text style={[fonts.size_12, { color: colors.primaryGreen }]}>Change Number?</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.signInButton, { backgroundColor: colors.primaryGreen, opacity: loading ? 0.7 : 1 }]}
                    onPress={step === 'PHONE' ? handleSendOtp : handleVerifyOtp}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={[fonts.size_16, fonts.bold, fonts.gray50]}>
                            {step === 'PHONE' ? 'Get OTP' : 'Verify & Login'}
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Mock Info / Footer */}
                <View style={[gutters.marginTop_40, layout.itemsCenter]}>
                    <Text style={[fonts.size_12, fonts.gray400, { textAlign: 'center' }]}>
                        For Testing: Use '1234' as OTP.{'\n'}
                        Ends with 1111 : Farmer{'\n'}
                        Ends with 2222 : Intermediary
                    </Text>
                </View>
            </View>
        </SafeScreen>
    );
}

const styles = StyleSheet.create({
    input: {
        height: 56,
        borderWidth: 1,
        borderColor: '#EFEFEF',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 18,
        color: '#303030',
        backgroundColor: '#fff',
    },
    signInButton: {
        height: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default Login;
