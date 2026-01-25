import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '@/theme';
import { SafeScreen } from '@/components/templates';
import { SvgUri } from 'react-native-svg';
import type { RootScreenProps } from '@/navigation/types';
import { Paths } from '@/navigation/paths';
import { useAuth } from '@/hooks/useAuth';
import AuthService from '@/services/api/AuthService';

const LOGO_ICON_URI = "http://localhost:3845/assets/759902660d1656037a2f5f137eb15664a7538a7c.svg";

function Login({ navigation }: RootScreenProps<Paths.Login>) {
    const { layout, gutters, fonts, colors } = useTheme();
    const { setAuth } = useAuth();

    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async () => {
        if (phone.length !== 10) {
            Alert.alert('Invalid Phone', 'Please enter a 10-digit phone number.');
            return;
        }

        setLoading(true);
        try {
            await AuthService.sendOtp(phone);
            setShowOtp(true);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to send OTP');
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
            const { user, token, isNewUser } = await AuthService.verifyOtp(phone, otp);

            if (isNewUser) {
                // Navigate to Signup for profile completion
                navigation.navigate(Paths.Signup, { phone, userId: user.id, role: user.role as 'FARMER' | 'INTERMEDIARY' });
            } else {
                // Existing user - login directly
                setAuth(user, token);
            }
        } catch (error: any) {
            Alert.alert('Login Failed', error.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeScreen>
            <KeyboardAvoidingView style={layout.flex_1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.container}>
                    {/* Brand Section */}
                    <View style={layout.itemsCenter}>
                        <View style={styles.logoCircle}>
                            <SvgUri uri={LOGO_ICON_URI} width={64} height={64} />
                        </View>
                        <Text style={[fonts.size_32, fonts.bold, { color: colors.primaryGreen, marginTop: 16 }]}>CropMart</Text>
                        <Text style={[fonts.size_16, { color: '#475467', marginTop: 8 }]}>Empowering farmers, enhancing trade</Text>
                    </View>

                    {/* Input Section */}
                    <View style={styles.formContainer}>
                        <Text style={[fonts.size_24, fonts.bold, { color: '#101828', marginBottom: 8 }]}>Welcome</Text>
                        <Text style={[fonts.size_16, { color: '#475467', marginBottom: 32 }]}>
                            {showOtp ? 'Enter the 4-digit code sent to your phone' : 'Enter your mobile number to get started'}
                        </Text>

                        {!showOtp ? (
                            <>
                                <View style={styles.inputWrapper}>
                                    <View style={styles.phonePrefix}>
                                        <Text style={[fonts.size_16, { color: '#667085' }]}>+91</Text>
                                    </View>
                                    <TextInput
                                        placeholder="Mobile number"
                                        placeholderTextColor={colors.gray200}
                                        keyboardType="phone-pad"
                                        maxLength={10}
                                        value={phone}
                                        onChangeText={setPhone}
                                        style={styles.input}
                                    />
                                </View>

                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: colors.primaryGreen }]}
                                    onPress={handleSendOtp}
                                    disabled={loading}
                                >
                                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Get OTP</Text>}
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        placeholder="Enter 4-digit OTP (Try 1234)"
                                        placeholderTextColor={colors.gray200}
                                        keyboardType="number-pad"
                                        maxLength={4}
                                        value={otp}
                                        onChangeText={setOtp}
                                        style={[styles.input, { paddingLeft: 16 }]}
                                    />
                                </View>

                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: colors.primaryGreen }]}
                                    onPress={handleVerifyOtp}
                                    disabled={loading}
                                >
                                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & Login</Text>}
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => setShowOtp(false)} style={gutters.marginTop_16}>
                                    <Text style={{ textAlign: 'center', color: colors.primaryGreen, fontWeight: 'bold' }}>Change Number</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeScreen>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingBottom: 40,
        backgroundColor: '#fff',
    },
    logoCircle: {
        width: 100, height: 100, borderRadius: 50, backgroundColor: '#F6FEF9', alignItems: 'center', justifyContent: 'center'
    },
    formContainer: {
        marginTop: 48,
    },
    inputWrapper: {
        flexDirection: 'row',
        height: 56,
        borderWidth: 1,
        borderColor: '#D0D5DD',
        borderRadius: 12,
        marginBottom: 24,
        overflow: 'hidden',
    },
    phonePrefix: {
        width: 60,
        backgroundColor: '#F9FAFB',
        alignItems: 'center',
        justifyContent: 'center',
        borderRightWidth: 1,
        borderRightColor: '#D0D5DD',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#101828',
        paddingHorizontal: 12,
    },
    button: {
        height: 56,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
});

export default Login;
