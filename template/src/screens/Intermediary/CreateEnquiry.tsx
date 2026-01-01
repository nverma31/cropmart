import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useTheme } from '@/theme';
import { SafeScreen } from '@/components/templates';
import { SvgUri } from 'react-native-svg';
import type { RootScreenProps } from '@/navigation/types';
import { Paths } from '@/navigation/paths';
import { useAuth } from '@/hooks/useAuth';
import FarmerService from '@/services/api/FarmerService';
import EnquiryService from '@/services/api/EnquiryService';
import { FarmerProfile } from '@/services/api/types';
import { launchCamera, launchImageLibrary, type ImagePickerResponse } from 'react-native-image-picker';

const BACK_ICON_URI = "http://localhost:3845/assets/b3acbe5bd35b31f95601aca7c7045af0eb9f4b97.svg";

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

type Step = 1 | 2 | 3 | 4 | 5 | 6;

function CreateEnquiry({ navigation }: RootScreenProps<Paths.CreateEnquiry>) {
    const { layout, gutters, fonts, colors } = useTheme();
    const { user } = useAuth();

    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [myFarmers, setMyFarmers] = useState<FarmerProfile[]>([]);
    const [loadingFarmers, setLoadingFarmers] = useState(true);
    const [selectedFarmerIds, setSelectedFarmerIds] = useState<string[]>([]);

    // Auto-populated fields
    const [kaLinkedId] = useState(user?.kaId || user?.linkedKaId || 'N/A');
    const [date] = useState(new Date().toISOString());

    // Mandatory fields
    const [location, setLocation] = useState('');
    const [state, setState] = useState('');
    const [commodity, setCommodity] = useState('');
    const [quantityMT, setQuantityMT] = useState('');
    const [rateMT, setRateMT] = useState('');
    const [cdPercent, setCdPercent] = useState('');
    const [bagPacking, setBagPacking] = useState('');
    const [financePercent, setFinancePercent] = useState('');

    // Optional fields
    const [gstPercent, setGstPercent] = useState('');
    const [purchaseDays, setPurchaseDays] = useState('');
    const [purchaseConditions, setPurchaseConditions] = useState('');
    const [paymentConditions, setPaymentConditions] = useState('');
    const [qcParameters, setQcParameters] = useState('');
    const [pickupLocation, setPickupLocation] = useState('');
    const [qcParametersFarmer, setQcParametersFarmer] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [remarks, setRemarks] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [showStateDropdown, setShowStateDropdown] = useState(false);

    useEffect(() => {
        fetchFarmers();
    }, []);

    const fetchFarmers = async () => {
        if (!user) return;
        try {
            const data = await FarmerService.getMyFarmers(user.id);
            setMyFarmers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingFarmers(false);
        }
    };

    const toggleFarmerSelection = (id: string) => {
        if (selectedFarmerIds.includes(id)) {
            setSelectedFarmerIds(prev => prev.filter(fid => fid !== id));
        } else {
            setSelectedFarmerIds(prev => [...prev, id]);
        }
    };

    const handleSelectAll = () => {
        if (selectedFarmerIds.length === myFarmers.length) {
            setSelectedFarmerIds([]);
        } else {
            setSelectedFarmerIds(myFarmers.map(f => f.id));
        }
    };

    const handleImagePick = () => {
        if (images.length >= 2) {
            Alert.alert('Limit Reached', 'Maximum 2 images allowed');
            return;
        }

        Alert.alert('Select Image', 'Choose image source', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Camera', onPress: () => pickImage('camera') },
            { text: 'Gallery', onPress: () => pickImage('gallery') }
        ]);
    };

    const pickImage = (source: 'camera' | 'gallery') => {
        const options = {
            mediaType: 'photo' as const,
            maxWidth: 1024,
            maxHeight: 1024,
            quality: 0.8,
        };

        const picker = source === 'camera' ? launchCamera : launchImageLibrary;

        picker(options, (response: ImagePickerResponse) => {
            if (response.didCancel) {
                return;
            }
            if (response.errorCode) {
                Alert.alert('Error', response.errorMessage || 'Failed to pick image');
                return;
            }
            if (response.assets && response.assets[0].uri) {
                setImages(prev => [...prev, response.assets![0].uri!]);
            }
        });
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const validateStep = (): boolean => {
        switch (currentStep) {
            case 1:
                if (selectedFarmerIds.length === 0) {
                    Alert.alert('Error', 'Please select at least one farmer');
                    return false;
                }
                return true;
            case 2:
                if (!location || !state || !commodity) {
                    Alert.alert('Error', 'Please fill all required fields');
                    return false;
                }
                return true;
            case 3:
                if (!quantityMT || !rateMT || !cdPercent || !bagPacking || !financePercent) {
                    Alert.alert('Error', 'Please fill all required fields');
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (validateStep() && currentStep < 6) {
            setCurrentStep((currentStep + 1) as Step);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((currentStep - 1) as Step);
        }
    };

    const handleSubmit = async () => {
        if (!validateStep()) return;

        setSubmitting(true);
        try {
            await EnquiryService.createBulkEnquiries({
                // Legacy fields
                product: commodity,
                quantity: `${quantityMT} MT`,
                expectedPrice: `₹${rateMT}/MT`,

                // Comprehensive fields
                kaLinkedId,
                date,
                location,
                state,
                commodity,
                quantityMT,
                rateMT,
                cdPercent,
                bagPacking,
                financePercent,
                gstPercent: gstPercent || undefined,
                purchaseDays: purchaseDays || undefined,
                purchaseConditions: purchaseConditions || undefined,
                paymentConditions: paymentConditions || undefined,
                qcParameters: qcParameters || undefined,
                pickupLocation: pickupLocation || undefined,
                qcParametersFarmer: qcParametersFarmer || undefined,
                images: images.length > 0 ? images : undefined,
                remarks: remarks || undefined,

                farmerIds: selectedFarmerIds,
                createdById: user!.id,
            });

            Alert.alert('Success', `Created enquiries for ${selectedFarmerIds.length} farmers!`, [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to create enquiries.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderInput = (label: string, value: string, setValue: (t: string) => void, placeholder: string, keyboardType: 'default' | 'numeric' | 'email-address' = 'default', required = true) => (
        <View style={gutters.marginBottom_16}>
            <Text style={[fonts.size_16, fonts.bold, { color: '#344054', marginBottom: 8 }]}>
                {label} {required && <Text style={{ color: '#DC2626' }}>*</Text>}
            </Text>
            <TextInput
                placeholder={placeholder}
                placeholderTextColor={colors.gray200}
                value={value}
                onChangeText={setValue}
                keyboardType={keyboardType}
                style={styles.input}
                multiline={label.includes('Conditions') || label.includes('Parameters') || label.includes('Remarks')}
                numberOfLines={label.includes('Conditions') || label.includes('Parameters') || label.includes('Remarks') ? 3 : 1}
            />
        </View>
    );

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <>
                        <View style={[layout.row, layout.justifyBetween, gutters.marginBottom_16]}>
                            <Text style={[fonts.size_16, fonts.bold, { color: '#101828' }]}>Select Farmers ({selectedFarmerIds.length})</Text>
                            <TouchableOpacity onPress={handleSelectAll}>
                                <Text style={[fonts.size_12, fonts.bold, { color: colors.primaryGreen }]}>
                                    {selectedFarmerIds.length === myFarmers.length ? 'Deselect All' : 'Select All'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {loadingFarmers ? (
                            <ActivityIndicator />
                        ) : myFarmers.length === 0 ? (
                            <Text style={[fonts.size_12, { color: '#667085' }]}>No farmers onboarded yet.</Text>
                        ) : (
                            <View>
                                {myFarmers.map(farmer => {
                                    const isSelected = selectedFarmerIds.includes(farmer.id);
                                    return (
                                        <TouchableOpacity
                                            key={farmer.id}
                                            onPress={() => toggleFarmerSelection(farmer.id)}
                                            style={[styles.farmerRow, isSelected && styles.farmerRowSelected]}
                                        >
                                            <View style={[styles.checkbox, isSelected && { backgroundColor: colors.primaryGreen, borderColor: colors.primaryGreen }]}>
                                                {isSelected && <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>}
                                            </View>
                                            <View style={gutters.marginLeft_12}>
                                                <Text style={[fonts.size_16, { color: '#101828' }]}>{farmer.name}</Text>
                                                <Text style={[fonts.size_12, { color: '#667085' }]}>{farmer.location} • {farmer.farmSize}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                    </>
                );

            case 2:
                return (
                    <>
                        <Text style={[fonts.size_24, fonts.bold, { color: colors.primaryGreen, marginBottom: 8 }]}>Basic Details</Text>
                        <Text style={[fonts.size_16, { color: '#475467', marginBottom: 24 }]}>Order information</Text>

                        <View style={gutters.marginBottom_16}>
                            <Text style={[fonts.size_16, fonts.bold, { color: '#344054', marginBottom: 8 }]}>KA Linked ID (Auto)</Text>
                            <TextInput value={kaLinkedId} editable={false} style={[styles.input, { backgroundColor: '#F9FAFB' }]} />
                        </View>

                        <View style={gutters.marginBottom_16}>
                            <Text style={[fonts.size_16, fonts.bold, { color: '#344054', marginBottom: 8 }]}>Date (Auto)</Text>
                            <TextInput value={new Date(date).toLocaleDateString()} editable={false} style={[styles.input, { backgroundColor: '#F9FAFB' }]} />
                        </View>

                        {renderInput('Location', location, setLocation, 'e.g. Mandi Yard, Sector 12')}

                        <View style={gutters.marginBottom_16}>
                            <Text style={[fonts.size_16, fonts.bold, { color: '#344054', marginBottom: 8 }]}>
                                State <Text style={{ color: '#DC2626' }}>*</Text>
                            </Text>
                            <TouchableOpacity onPress={() => setShowStateDropdown(!showStateDropdown)} style={styles.input}>
                                <Text style={{ color: state ? '#101828' : colors.gray200 }}>
                                    {state || 'Select state'}
                                </Text>
                            </TouchableOpacity>
                            {showStateDropdown && (
                                <View style={styles.dropdown}>
                                    <ScrollView style={{ maxHeight: 200 }}>
                                        {INDIAN_STATES.map(s => (
                                            <TouchableOpacity
                                                key={s}
                                                onPress={() => { setState(s); setShowStateDropdown(false); }}
                                                style={styles.dropdownItem}
                                            >
                                                <Text style={fonts.size_16}>{s}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>

                        {renderInput('Commodity', commodity, setCommodity, 'e.g. Wheat, Rice')}
                    </>
                );

            case 3:
                return (
                    <>
                        <Text style={[fonts.size_24, fonts.bold, { color: colors.primaryGreen, marginBottom: 8 }]}>Quantity & Pricing</Text>
                        <Text style={[fonts.size_16, { color: '#475467', marginBottom: 24 }]}>Financial details</Text>

                        {renderInput('Quantity (MT)', quantityMT, setQuantityMT, 'e.g. 100', 'numeric')}
                        {renderInput('Rate/MT (₹)', rateMT, setRateMT, 'e.g. 2500', 'numeric')}
                        {renderInput('CD %', cdPercent, setCdPercent, 'e.g. 2', 'numeric')}
                        {renderInput('Bag/Packing', bagPacking, setBagPacking, 'e.g. 50kg HDPE Bags')}
                        {renderInput('Finance %', financePercent, setFinancePercent, 'e.g. 10', 'numeric')}
                    </>
                );

            case 4:
                return (
                    <>
                        <Text style={[fonts.size_24, fonts.bold, { color: colors.primaryGreen, marginBottom: 8 }]}>Purchase Terms</Text>
                        <Text style={[fonts.size_16, { color: '#475467', marginBottom: 24 }]}>Conditions & timeline (Optional)</Text>

                        {renderInput('GST %', gstPercent, setGstPercent, 'e.g. 5', 'numeric', false)}
                        {renderInput('Purchase Days (Completion)', purchaseDays, setPurchaseDays, 'e.g. 15', 'numeric', false)}
                        {renderInput('Purchase Conditions', purchaseConditions, setPurchaseConditions, 'If delivered and rejected...', 'default', false)}
                        {renderInput('Payment Conditions', paymentConditions, setPaymentConditions, 'Enter payment terms', 'default', false)}
                    </>
                );

            case 5:
                return (
                    <>
                        <Text style={[fonts.size_24, fonts.bold, { color: colors.primaryGreen, marginBottom: 8 }]}>Quality Control</Text>
                        <Text style={[fonts.size_16, { color: '#475467', marginBottom: 24 }]}>QC Parameters (Optional)</Text>

                        {renderInput('QC Parameters', qcParameters, setQcParameters, 'e.g. Moisture < 12%', 'default', false)}
                        {renderInput('Pickup Location', pickupLocation, setPickupLocation, 'e.g. Warehouse A, Gate 3', 'default', false)}
                        {renderInput('QC Parameters (Farmer)', qcParametersFarmer, setQcParametersFarmer, 'Farmer-specific parameters', 'default', false)}
                    </>
                );

            case 6:
                return (
                    <>
                        <Text style={[fonts.size_24, fonts.bold, { color: colors.primaryGreen, marginBottom: 8 }]}>Documentation</Text>
                        <Text style={[fonts.size_16, { color: '#475467', marginBottom: 24 }]}>Images & remarks (Optional)</Text>

                        <View style={gutters.marginBottom_16}>
                            <Text style={[fonts.size_16, fonts.bold, { color: '#344054', marginBottom: 8 }]}>Pictures (Max 2)</Text>
                            <View style={layout.row}>
                                {images.map((uri, index) => (
                                    <View key={index} style={styles.imageContainer}>
                                        <Image source={{ uri }} style={styles.image} />
                                        <TouchableOpacity onPress={() => removeImage(index)} style={styles.removeBtn}>
                                            <Text style={{ color: '#fff', fontSize: 16 }}>×</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                {images.length < 2 && (
                                    <TouchableOpacity onPress={handleImagePick} style={styles.imagePlaceholder}>
                                        <Text style={{ fontSize: 32, color: '#9CA3AF' }}>+</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {renderInput('Remarks', remarks, setRemarks, 'Additional notes', 'default', false)}
                    </>
                );
        }
    };

    return (
        <SafeScreen>
            <KeyboardAvoidingView style={layout.flex_1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                {/* Header */}
                <View style={[layout.row, layout.itemsCenter, gutters.paddingHorizontal_32, gutters.paddingVertical_24, { backgroundColor: '#F9FAFB' }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[layout.row, layout.itemsCenter]}>
                        <SvgUri uri={BACK_ICON_URI} width={20} height={20} color="#000" />
                        <Text style={[fonts.size_16, fonts.bold, gutters.marginLeft_12, { color: '#000' }]}>Cancel</Text>
                    </TouchableOpacity>
                </View>

                {/* Progress */}
                <View style={[gutters.paddingHorizontal_32, gutters.paddingVertical_16, { backgroundColor: '#F9FAFB', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }]}>
                    <Text style={[fonts.size_16, { color: '#667085' }]}>Step {currentStep} of 6</Text>
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${(currentStep / 6) * 100}%` }]} />
                    </View>
                </View>

                <ScrollView style={[layout.flex_1, { backgroundColor: '#F9FAFB' }]} contentContainerStyle={gutters.paddingBottom_40}>
                    <View style={styles.sectionCard}>
                        {renderStepContent()}
                    </View>
                </ScrollView>

                {/* Navigation */}
                <View style={[gutters.paddingHorizontal_32, gutters.paddingBottom_24, gutters.paddingTop_16, { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB' }]}>
                    <View style={layout.row}>
                        {currentStep > 1 && (
                            <TouchableOpacity style={[styles.navButton, { flex: 1, marginRight: 8, backgroundColor: '#F9FAFB' }]} onPress={handleBack} disabled={submitting}>
                                <Text style={[fonts.size_16, fonts.bold, { color: '#344054' }]}>Back</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.navButton, { flex: 1, backgroundColor: colors.primaryGreen, marginLeft: currentStep > 1 ? 8 : 0 }]}
                            onPress={currentStep === 6 ? handleSubmit : handleNext}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={[fonts.size_16, fonts.bold, { color: '#fff' }]}>
                                    {currentStep === 6 ? `Send to ${selectedFarmerIds.length} Farmers` : 'Next'}
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
    sectionCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        marginHorizontal: 32,
        marginTop: 24,
        borderWidth: 1,
        borderColor: '#F2F4F7',
    },
    input: {
        minHeight: 50,
        borderWidth: 1,
        borderColor: '#D0D5DD',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#101828',
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    farmerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
    },
    farmerRowSelected: {
        backgroundColor: '#F6FEF9',
    },
    checkbox: {
        width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: '#D0D5DD', alignItems: 'center', justifyContent: 'center'
    },
    dropdown: {
        position: 'absolute',
        top: 80,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#D0D5DD',
        borderRadius: 12,
        zIndex: 1000,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    dropdownItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F4F7',
    },
    progressBarContainer: {
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        marginTop: 8,
    },
    progressBar: {
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
    imageContainer: {
        width: 100,
        height: 100,
        marginRight: 12,
        position: 'relative',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    removeBtn: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#DC2626',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imagePlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 8,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#D0D5DD',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default CreateEnquiry;
