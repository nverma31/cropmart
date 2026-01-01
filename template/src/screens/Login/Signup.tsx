import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '@/theme';
import { SafeScreen } from '@/components/templates';
import type { RootScreenProps } from '@/navigation/types';
import { Paths } from '@/navigation/paths';
import AuthService from '@/services/api/AuthService';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/services/api/types';

type Step = 1 | 2 | 3 | 4 | 5 | 6;

function Signup({ navigation, route }: RootScreenProps<Paths.Signup>) {
    const { phone } = route.params;
    const { layout, gutters, fonts, colors } = useTheme();
    const { setUser } = useAuth();

    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [loading, setLoading] = useState(false);

    // Form state
    const [role, setRole] = useState<Role>('FARMER');
    const [name, setName] = useState('');
    const [fatherName, setFatherName] = useState('');
    const [idProofType, setIdProofType] = useState<'PAN' | 'AADHAR' | 'KISAN_PATRA'>('AADHAR');
    const [idProofNumber, setIdProofNumber] = useState('');
    const [district, setDistrict] = useState('');
    const [tehsil, setTehsil] = useState('');
    const [commodity, setCommodity] = useState('');
    const [landHolding, setLandHolding] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [ifsc, setIfsc] = useState('');
    const [nomineeName, setNomineeName] = useState('');
    const [nomineeRelation, setNomineeRelation] = useState('');
    const [nomineeContact, setNomineeContact] = useState('');
    const [email, setEmail] = useState('');
    const [linkedKaId, setLinkedKaId] = useState('');

    // Intermediary-specific fields
    const [experience, setExperience] = useState('');
    const [rating, setRating] = useState('');

    const handleSkip = async () => {
        // Skip and login with minimal info
        setLoading(true);
        try {
            const response = await AuthService.register({
                name: name || 'User',
                phone,
                role,
                profileCompleted: false,
            });
            if (response.user) {
                setUser(response.user);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (currentStep < 6) {
            setCurrentStep((currentStep + 1) as Step);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((currentStep - 1) as Step);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await AuthService.register({
                name: name || 'User',
                phone,
                role,
                fatherName: fatherName || undefined,
                idProof: idProofNumber ? { type: idProofType, number: idProofNumber } : undefined,
                district: district || undefined,
                tehsil: tehsil || undefined,
                commodity: commodity || undefined,
                landHolding: role === 'FARMER' ? (landHolding || undefined) : undefined,
                accountDetails: (bankName && accountNumber && ifsc) ? { bankName, accountNumber, ifsc } : undefined,
                nomineeDetails: (nomineeName && nomineeRelation) ? { name: nomineeName, relation: nomineeRelation, contact: nomineeContact } : undefined,
                email: email || undefined,
                linkedKaId: role === 'FARMER' ? (linkedKaId || undefined) : undefined,
                farmLocation: role === 'FARMER' && district && tehsil ? `${district}, ${tehsil}` : undefined,
                // Intermediary-specific
                experience: role === 'INTERMEDIARY' ? (experience || undefined) : undefined,
                rating: role === 'INTERMEDIARY' && rating ? parseFloat(rating) : undefined,
                kaId: role === 'INTERMEDIARY' ? (linkedKaId || undefined) : undefined,
                profileCompleted: true,
            });

            if (response.user) {
                setUser(response.user);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (label: string, value: string, setValue: (t: string) => void, placeholder: string, keyboardType: 'default' | 'numeric' | 'email-address' | 'phone-pad' = 'default') => (
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
        switch (currentStep) {
            case 1:
                return (
                    <>
                        <Text style={[fonts.size_24, fonts.bold, { color: colors.primaryGreen, marginBottom: 8 }]}>Basic Information</Text>
                        <Text style={[fonts.size_16, { color: '#475467', marginBottom: 24 }]}>Let's start with the basics</Text>

                        <View style={gutters.marginBottom_16}>
                            <Text style={[fonts.size_16, fonts.bold, { color: '#344054', marginBottom: 8 }]}>I am a...</Text>
                            <View style={layout.row}>
                                <TouchableOpacity
                                    style={[styles.roleButton, role === 'FARMER' && styles.roleButtonSelected]}
                                    onPress={() => setRole('FARMER')}
                                >
                                    <Text style={[styles.roleText, role === 'FARMER' && styles.roleTextSelected]}>Farmer</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.roleButton, role === 'INTERMEDIARY' && styles.roleButtonSelected]}
                                    onPress={() => setRole('INTERMEDIARY')}
                                >
                                    <Text style={[styles.roleText, role === 'INTERMEDIARY' && styles.roleTextSelected]}>Intermediary</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {renderInput('Full Name', name, setName, 'e.g. Ramesh Kumar')}
                        {renderInput('Father\'s Name', fatherName, setFatherName, 'e.g. Suresh Kumar')}
                    </>
                );
            case 2:
                return (
                    <>
                        <Text style={[fonts.size_24, fonts.bold, { color: colors.primaryGreen, marginBottom: 8 }]}>Identity Verification</Text>
                        <Text style={[fonts.size_16, { color: '#475467', marginBottom: 24 }]}>Government-issued ID (Optional)</Text>

                        <View style={gutters.marginBottom_16}>
                            <Text style={[fonts.size_16, fonts.bold, { color: '#344054', marginBottom: 8 }]}>ID Type</Text>
                            <View style={layout.row}>
                                {(['AADHAR', 'PAN', 'KISAN_PATRA'] as const).map(type => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[styles.idButton, idProofType === type && styles.idButtonSelected]}
                                        onPress={() => setIdProofType(type)}
                                    >
                                        <Text style={[styles.idText, idProofType === type && styles.idTextSelected]}>
                                            {type === 'KISAN_PATRA' ? 'Kisan' : type}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {renderInput('ID Number', idProofNumber, setIdProofNumber, 'Enter ID number')}
                    </>
                );
            case 3:
                return (
                    <>
                        <Text style={[fonts.size_24, fonts.bold, { color: colors.primaryGreen, marginBottom: 8 }]}>Location Details</Text>
                        <Text style={[fonts.size_16, { color: '#475467', marginBottom: 24 }]}>
                            {role === 'FARMER' ? 'Where is your farm located?' : 'Your operating location'}
                        </Text>

                        {renderInput('District', district, setDistrict, 'e.g. Ludhiana')}
                        {renderInput('Tehsil/Block', tehsil, setTehsil, 'e.g. Payal')}
                    </>
                );
            case 4:
                return (
                    <>
                        {role === 'FARMER' ? (
                            <>
                                <Text style={[fonts.size_24, fonts.bold, { color: colors.primaryGreen, marginBottom: 8 }]}>Agricultural Details</Text>
                                <Text style={[fonts.size_16, { color: '#475467', marginBottom: 24 }]}>Tell us about your farming</Text>

                                {renderInput('Primary Commodity/Crop', commodity, setCommodity, 'e.g. Wheat, Rice')}
                                {renderInput('Land Holding', landHolding, setLandHolding, 'e.g. 5 Acres', 'numeric')}
                            </>
                        ) : (
                            <>
                                <Text style={[fonts.size_24, fonts.bold, { color: colors.primaryGreen, marginBottom: 8 }]}>Professional Details</Text>
                                <Text style={[fonts.size_16, { color: '#475467', marginBottom: 24 }]}>Your trading experience</Text>

                                {renderInput('Primary Commodity/Product', commodity, setCommodity, 'e.g. Wheat, Rice, Pulses')}
                                {renderInput('Experience (Years)', experience, setExperience, 'e.g. 5', 'numeric')}
                                {renderInput('Rating (1-5)', rating, setRating, 'e.g. 4.5', 'numeric')}
                            </>
                        )}
                    </>
                );
            case 5:
                return (
                    <>
                        <Text style={[fonts.size_24, fonts.bold, { color: colors.primaryGreen, marginBottom: 8 }]}>Financial Details</Text>
                        <Text style={[fonts.size_16, { color: '#475467', marginBottom: 24 }]}>Bank account & nominee (Optional)</Text>

                        {renderInput('Bank Name', bankName, setBankName, 'e.g. State Bank of India')}
                        {renderInput('Account Number', accountNumber, setAccountNumber, 'Enter account number', 'numeric')}
                        {renderInput('IFSC Code', ifsc, setIfsc, 'e.g. SBIN0001234')}

                        <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 16 }} />

                        {renderInput('Nominee Name', nomineeName, setNomineeName, 'e.g. Sunita Devi')}
                        {renderInput('Relation', nomineeRelation, setNomineeRelation, 'e.g. Wife, Son')}
                        {renderInput('Nominee Contact', nomineeContact, setNomineeContact, 'Enter mobile number', 'phone-pad')}
                    </>
                );
            case 6:
                return (
                    <>
                        <Text style={[fonts.size_24, fonts.bold, { color: colors.primaryGreen, marginBottom: 8 }]}>Contact Details</Text>
                        <Text style={[fonts.size_16, { color: '#475467', marginBottom: 24 }]}>Additional contact information</Text>

                        {renderInput('Email Address', email, setEmail, `e.g. ${role.toLowerCase()}@example.com`, 'email-address')}
                        {renderInput(role === 'FARMER' ? 'Linked KA ID' : 'KA ID', linkedKaId, setLinkedKaId, 'Enter KA ID if available')}
                    </>
                );
        }
    };

    return (
        <SafeScreen>
            <KeyboardAvoidingView style={layout.flex_1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                {/* Header */}
                <View style={[layout.row, layout.justifyBetween, layout.itemsCenter, gutters.paddingHorizontal_32, gutters.paddingVertical_16, { backgroundColor: '#F9FAFB', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }]}>
                    <Text style={[fonts.size_16, { color: '#667085' }]}>Step {currentStep} of 6</Text>
                    <TouchableOpacity onPress={handleSkip} disabled={loading}>
                        <Text style={[fonts.size_16, fonts.bold, { color: colors.primaryGreen }]}>Skip for Now</Text>
                    </TouchableOpacity>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${(currentStep / 6) * 100}%` }]} />
                </View>

                <ScrollView style={[layout.flex_1, { backgroundColor: '#fff' }]} contentContainerStyle={[gutters.paddingHorizontal_32, gutters.paddingVertical_24]}>
                    {renderStepContent()}
                </ScrollView>

                {/* Navigation Buttons */}
                <View style={[gutters.paddingHorizontal_32, gutters.paddingBottom_24, gutters.paddingTop_16, { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB' }]}>
                    <View style={layout.row}>
                        {currentStep > 1 && (
                            <TouchableOpacity
                                style={[styles.navButton, { flex: 1, marginRight: 8, backgroundColor: '#F9FAFB' }]}
                                onPress={handleBack}
                                disabled={loading}
                            >
                                <Text style={[fonts.size_16, fonts.bold, { color: '#344054' }]}>Back</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.navButton, { flex: 1, backgroundColor: colors.primaryGreen, marginLeft: currentStep > 1 ? 8 : 0 }]}
                            onPress={currentStep === 6 ? handleSubmit : handleNext}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={[fonts.size_16, fonts.bold, { color: '#fff' }]}>
                                    {currentStep === 6 ? 'Complete' : 'Next'}
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
    roleButton: {
        flex: 1,
        height: 48,
        borderWidth: 1,
        borderColor: '#D0D5DD',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    roleButtonSelected: {
        borderColor: '#009666',
        backgroundColor: '#F6FEF9',
    },
    roleText: {
        fontSize: 16,
        color: '#344054',
        fontWeight: '500',
    },
    roleTextSelected: {
        color: '#009666',
        fontWeight: '700',
    },
    idButton: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: '#D0D5DD',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    idButtonSelected: {
        borderColor: '#009666',
        backgroundColor: '#F6FEF9',
    },
    idText: {
        fontSize: 14,
        color: '#344054',
        fontWeight: '500',
    },
    idTextSelected: {
        color: '#009666',
        fontWeight: '700',
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
