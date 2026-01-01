import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/theme';
import { Enquiry } from '@/services/api/types';

interface EnquiryListProps {
    enquiries: Enquiry[];
    onPressItem?: (enquiry: Enquiry) => void;
    layout: any;
    gutters: any;
    fonts: any;
}

const EnquiryList = ({ enquiries, onPressItem, layout, gutters, fonts }: EnquiryListProps) => {

    const renderItem = ({ item }: { item: Enquiry }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onPressItem && onPressItem(item)}
            disabled={!onPressItem}
        >
            <View style={[layout.row, layout.justifyBetween, gutters.marginBottom_12]}>
                <View>
                    <Text style={[fonts.size_16, fonts.bold, styles.productText]}>{item.product}</Text>
                    <Text style={[fonts.size_12, styles.farmerText]}>{item.farmerName}</Text>
                </View>
                <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                    <Text style={[fonts.size_12, fonts.bold, getStatusTextStyle(item.status)]}>{item.status}</Text>
                </View>
            </View>

            <View style={[layout.row, layout.justifyBetween]}>
                <View>
                    <Text style={[fonts.size_12, styles.label]}>Quantity</Text>
                    <Text style={[fonts.size_16, fonts.bold, styles.value]}>{item.quantity}</Text>
                </View>
                <View>
                    <Text style={[fonts.size_12, styles.label]}>Price</Text>
                    <Text style={[fonts.size_16, fonts.bold, styles.value]}>{item.expectedPrice}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[fonts.size_12, styles.label]}>Payment</Text>
                    <Text style={[fonts.size_12, fonts.bold, { color: item.paymentStatus === 'PAID' ? '#12B76A' : '#F79009' }]}>
                        {item.paymentStatus}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <FlatList
            data={enquiries}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            scrollEnabled={false} // Since we use it inside a ScrollView usually
        />
    );
};

const getStatusStyle = (status: string) => {
    switch (status) {
        case 'CREATED': return { backgroundColor: '#EFF8FF' };
        case 'IN_PROGRESS': return { backgroundColor: '#FFFAEB' };
        case 'CONFIRMED': return { backgroundColor: '#ECFDF3' };
        default: return { backgroundColor: '#F2F4F7' };
    }
};

const getStatusTextStyle = (status: string) => {
    switch (status) {
        case 'CREATED': return { color: '#2E90FA' };
        case 'IN_PROGRESS': return { color: '#B54708' };
        case 'CONFIRMED': return { color: '#039855' };
        default: return { color: '#344054' };
    }
};

const styles = StyleSheet.create({
    listContent: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F2F4F7',
        shadowColor: '#101828',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    productText: {
        color: '#101828',
    },
    farmerText: {
        color: '#667085',
        marginTop: 4,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 16,
        alignSelf: 'flex-start',
    },
    label: {
        color: '#667085',
        marginBottom: 4,
    },
    value: {
        color: '#344054',
    },
});

export default EnquiryList;
