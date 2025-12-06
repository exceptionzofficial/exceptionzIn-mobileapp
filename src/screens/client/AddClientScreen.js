import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useData } from '../../context/DataContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';

const STATUS_OPTIONS = [
    { key: 'new_lead', label: 'New Lead', icon: 'star-outline' },
    { key: 'contacted', label: 'Contacted', icon: 'phone-outline' },
    { key: 'qualified', label: 'Qualified', icon: 'check-circle-outline' },
    { key: 'converted', label: 'Converted', icon: 'check-decagram' },
    { key: 'lost', label: 'Lost', icon: 'close-circle-outline' },
];

const SOURCE_OPTIONS = [
    { key: 'direct', label: 'Direct', icon: 'account' },
    { key: 'referral', label: 'Referral', icon: 'account-group' },
    { key: 'website', label: 'Website', icon: 'web' },
    { key: 'social_media', label: 'Social', icon: 'instagram' },
    { key: 'advertisement', label: 'Ads', icon: 'bullhorn' },
    { key: 'other', label: 'Other', icon: 'dots-horizontal' },
];

const AddClientScreen = () => {
    const navigation = useNavigation();
    const { addClient } = useData();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        status: 'new_lead',
        source: 'direct',
        notes: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            Alert.alert('Error', 'Please enter client name');
            return;
        }

        setIsLoading(true);
        const result = await addClient(formData);
        setIsLoading(false);

        if (result.success) {
            Alert.alert('Success', 'Client added successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert('Error', result.error);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-left" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Add Client</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Basic Info */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Basic Information</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Name *</Text>
                            <View style={styles.inputContainer}>
                                <Icon name="account-outline" size={20} color={COLORS.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter client name"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={formData.name}
                                    onChangeText={(value) => updateField('name', value)}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <View style={styles.inputContainer}>
                                <Icon name="email-outline" size={20} color={COLORS.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter email address"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={formData.email}
                                    onChangeText={(value) => updateField('email', value)}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone</Text>
                            <View style={styles.inputContainer}>
                                <Icon name="phone-outline" size={20} color={COLORS.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter phone number"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={formData.phone}
                                    onChangeText={(value) => updateField('phone', value)}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Company</Text>
                            <View style={styles.inputContainer}>
                                <Icon name="office-building-outline" size={20} color={COLORS.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter company name"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={formData.company}
                                    onChangeText={(value) => updateField('company', value)}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Status */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Client Status</Text>
                        <View style={styles.optionsGrid}>
                            {STATUS_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option.key}
                                    style={[
                                        styles.optionButton,
                                        formData.status === option.key && styles.optionButtonActive
                                    ]}
                                    onPress={() => updateField('status', option.key)}
                                >
                                    <Icon
                                        name={option.icon}
                                        size={18}
                                        color={formData.status === option.key ? COLORS.white : COLORS.textSecondary}
                                    />
                                    <Text style={[
                                        styles.optionText,
                                        formData.status === option.key && styles.optionTextActive
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Source */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Lead Source</Text>
                        <View style={styles.optionsRow}>
                            {SOURCE_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option.key}
                                    style={[
                                        styles.sourceButton,
                                        formData.source === option.key && styles.sourceButtonActive
                                    ]}
                                    onPress={() => updateField('source', option.key)}
                                >
                                    <Icon
                                        name={option.icon}
                                        size={16}
                                        color={formData.source === option.key ? COLORS.white : COLORS.textSecondary}
                                    />
                                    <Text style={[
                                        styles.sourceText,
                                        formData.source === option.key && styles.sourceTextActive
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Notes */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Initial Notes</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Add notes about this client..."
                            placeholderTextColor={COLORS.textMuted}
                            value={formData.notes}
                            onChangeText={(value) => updateField('notes', value)}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        <Icon name="check" size={20} color={COLORS.white} />
                        <Text style={styles.submitButtonText}>
                            {isLoading ? 'Adding...' : 'Add Client'}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    flex: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.xl + 10,
        paddingBottom: SPACING.md,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: FONTS.sizes.lg,
        fontWeight: '600',
        color: COLORS.text,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xxxl,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: FONTS.sizes.md,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    inputGroup: {
        marginBottom: SPACING.md,
    },
    label: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    input: {
        flex: 1,
        padding: SPACING.md,
        fontSize: FONTS.sizes.md,
        color: COLORS.text,
    },
    textArea: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        fontSize: FONTS.sizes.md,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.border,
        height: 120,
        textAlignVertical: 'top',
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: SPACING.xs,
    },
    optionButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    optionText: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.textSecondary,
    },
    optionTextActive: {
        color: COLORS.white,
        fontWeight: '600',
    },
    optionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    sourceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: SPACING.xs,
    },
    sourceButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    sourceText: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.textSecondary,
    },
    sourceTextActive: {
        color: COLORS.white,
        fontWeight: '600',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        borderRadius: RADIUS.md,
        padding: SPACING.lg,
        marginTop: SPACING.lg,
        gap: SPACING.sm,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: COLORS.white,
        fontSize: FONTS.sizes.lg,
        fontWeight: '600',
    },
});

export default AddClientScreen;
