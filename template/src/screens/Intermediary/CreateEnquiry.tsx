import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '@/theme';
import { SafeScreen } from '@/components/templates';
import { SvgUri } from 'react-native-svg';
import type { RootScreenProps } from '@/navigation/types';
import { Paths } from '@/navigation/paths';
import FarmerService from '@/services/api/FarmerService';
import EnquiryService from '@/services/api/EnquiryService';
import { Farmer } from '@/services/api/types';

const BACK_ICON_URI = "http://localhost:3845/assets/b3acbe5bd35b31f95601aca7c7045af0eb9f4b97.svg";

function CreateEnquiry({ navigation }: RootScreenProps<Paths.CreateEnquiry>) {
    const { layout, gutters, fonts, colors } = useTheme();

    const [currentStep, setCurrentStep] = useState<1 | 2>(1);
    const [loadingFarmers, setLoadingFarmers] = useState(true);
    const [farmers, setFarmers] = useState<Farmer[]>([]);
    const [selectedFarmerId, setSelectedFarmerId] = useState<number | null>(null);

    // Form fields
    const [productType, setProductType] = useState('');
    const [quantity, setQuantity] = useState('');
    const [quantityUnit, setQuantityUnit] = useState('Quintal');
    const [expectedPrice, setExpectedPrice] = useState('');
    const [location, setLocation] = useState('');
    const [state, setState] = useState('');
    const [notes, setNotes] = useState('');

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchFarmers();
    }, []);

    const fetchFarmers = async () => {
        try {
            const data = await FarmerService.getFarmers();
            setFarmers(data || []);
        } catch (error) {
            console.error('Failed to fetch farmers', error);
        } finally {
            setLoadingFarmers(false);
        }
    };

    const handleNext = () => {
        if (!selectedFarmerId) {
            Alert.alert('Required', 'Please select a farmer first');
            return;
        }
        setCurrentStep(2);
    };

    const handleBack = () => {
        setCurrentStep(1);
    };

    const handleSubmit = async () => {
        if (!productType || !quantity || !expectedPrice || !quantityUnit) {
            Alert.alert('Required', 'Please fill all mandatory fields');
            return;
        }

        setSubmitting(true);
        try {
            await EnquiryService.createEnquiry({
                farmerId: selectedFarmerId!,
                productType,
                quantity: Number(quantity),
                quantityUnit,
                expectedPrice: Number(expectedPrice),
                location: location || undefined,
                state: state || undefined,
                notes: notes || undefined,
            });

            Alert.alert('Success', 'Enquiry created successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to create enquiry');
        } finally {
            setSubmitting(false);
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
                    <Text style={[fonts.size_16, fonts.bold, gutters.marginBottom_16]}>Select Farmer</Text>
                    {loadingFarmers ? (
                        <ActivityIndicator />
                    ) : farmers.length === 0 ? (
                        <Text style={fonts.gray400}>No farmers found. Please onboard a farmer first.</Text>
                    ) : (
                        <View>
                            {farmers.map(farmer => (
                                <TouchableOpacity
                                    key={farmer.id}
                                    style={[styles.farmerCard, selectedFarmerId === farmer.id && styles.farmerCardSelected]}
                                    onPress={() => setSelectedFarmerId(farmer.id)}
                                >
                                    <View style={[styles.radio, selectedFarmerId === farmer.id && { borderColor: colors.primaryGreen, borderWidth: 6 }]} />
                                    <View style={gutters.marginLeft_12}>
                                        <Text style={[fonts.size_16, fonts.bold]}>Farmer ID: {farmer.id}</Text>
                                        <Text style={[fonts.size_12, fonts.gray400]}>{farmer.district}, {farmer.state}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </>
            );
        }

        return (
            <>
                <Text style={[fonts.size_16, fonts.bold, gutters.marginBottom_16]}>Enquiry Details</Text>

                {renderInput('Product Type', productType, setProductType, 'e.g. Wheat')}

                <View style={layout.row}>
                    <View style={{ flex: 2, marginRight: 8 }}>
                        {renderInput('Quantity', quantity, setQuantity, 'e.g. 50', 'numeric')}
                    </View>
                    <View style={{ flex: 1.5 }}>
                        {renderInput('Unit', quantityUnit, setQuantityUnit, 'Quintal/MT/Kg')}
                    </View>
                </View>

                {renderInput('Expected Price (₹)', expectedPrice, setExpectedPrice, 'e.g. 2100', 'numeric')}
                {renderInput('Location (Optional)', location, setLocation, 'Enter pickup location')}
                {renderInput('State (Optional)', state, setState, 'e.g. Punjab')}

                <View style={gutters.marginBottom_16}>
                    <Text style={[fonts.size_16, fonts.bold, { color: '#344054', marginBottom: 8 }]}>Notes (Optional)</Text>
                    <TextInput
                        placeholder="Any special instructions..."
                        placeholderTextColor={colors.gray200}
                        value={notes}
                        onChangeText={setNotes}
                        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                        multiline
                    />
                </View>
            </>
        );
    };

    return (
        <SafeScreen>
            <KeyboardAvoidingView style={layout.flex_1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                {/* Header */}
                <View style={[layout.row, layout.itemsCenter, gutters.paddingHorizontal_32, gutters.paddingVertical_24, { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F2F4F7' }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[layout.row, layout.itemsCenter]}>
                        <SvgUri uri={BACK_ICON_URI} width={20} height={20} />
                        <Text style={[fonts.size_16, fonts.bold, gutters.marginLeft_12]}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={[fonts.size_16, fonts.bold, { marginLeft: 40 }]}>New Enquiry</Text>
                </View>

                {/* Progress */}
                <View style={[gutters.paddingHorizontal_32, gutters.paddingVertical_12, { backgroundColor: '#F9FAFB' }]}>
                    <Text style={[fonts.size_12, fonts.gray400]}>Step {currentStep} of 2</Text>
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressLine, { width: `${(currentStep / 2) * 100}%` }]} />
                    </View>
                </View>

                <ScrollView style={[layout.flex_1, { backgroundColor: '#fff' }]} contentContainerStyle={[gutters.paddingHorizontal_32, gutters.paddingVertical_24]}>
                    {renderStepContent()}
                </ScrollView>

                {/* Navigation */}
                <View style={[gutters.paddingHorizontal_32, gutters.paddingBottom_24, gutters.paddingTop_16, { borderTopWidth: 1, borderTopColor: '#F2F4F7' }]}>
                    <View style={layout.row}>
                        {currentStep === 2 && (
                            <TouchableOpacity
                                style={[styles.navButton, { flex: 1, marginRight: 8, backgroundColor: '#F9FAFB' }]}
                                onPress={handleBack}
                                disabled={submitting}
                            >
                                <Text style={[fonts.size_16, fonts.bold, { color: '#344054' }]}>Back</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.navButton, { flex: 1, backgroundColor: colors.primaryGreen }]}
                            onPress={currentStep === 1 ? handleNext : handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={[fonts.size_16, fonts.bold, { color: '#fff' }]}>
                                    {currentStep === 1 ? 'Next' : 'Create Enquiry'}
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
    farmerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderWidth: 1,
        borderColor: '#E4E7EC',
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    farmerCardSelected: {
        borderColor: '#009666',
        backgroundColor: '#F6FEF9',
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#D0D5DD',
    },
    progressContainer: {
        height: 4,
        backgroundColor: '#E4E7EC',
        borderRadius: 2,
        marginTop: 8,
    },
    progressLine: {
        height: 4,
        backgroundColor: '#009666',
        borderRadius: 2,
    },
    navButton: {
        height: 56,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default CreateEnquiry;
