import React, { useState, useMemo } from 'react';
import DatePicker from 'react-native-date-picker';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';

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
    const { colors } = useTheme();
    const styles = useMemo(() => getStyles(colors), [colors]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        status: 'new_lead',
        source: 'direct',
        notes: '',
        followUpDate: new Date(),
    });
    const [openDatePicker, setOpenDatePicker] = useState(false);
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
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-left" size={24} color={colors.text} />
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
                                <Icon name="account-outline" size={20} color={colors.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter client name"
                                    placeholderTextColor={colors.textMuted}
                                    value={formData.name}
                                    onChangeText={(value) => updateField('name', value)}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <View style={styles.inputContainer}>
                                <Icon name="email-outline" size={20} color={colors.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter email address"
                                    placeholderTextColor={colors.textMuted}
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
                                <Icon name="phone-outline" size={20} color={colors.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter phone number"
                                    placeholderTextColor={colors.textMuted}
                                    value={formData.phone}
                                    onChangeText={(value) => updateField('phone', value)}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Company</Text>
                            <View style={styles.inputContainer}>
                                <Icon name="office-building-outline" size={20} color={colors.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter company name"
                                    placeholderTextColor={colors.textMuted}
                                    value={formData.company}
                                    onChangeText={(value) => updateField('company', value)}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Follow Up Date</Text>
                            <TouchableOpacity
                                style={styles.inputContainer}
                                onPress={() => setOpenDatePicker(true)}
                            >
                                <Icon name="calendar" size={20} color={colors.textMuted} />
                                <Text style={[styles.input, { paddingVertical: SPACING.md }]}>
                                    {formData.followUpDate.toLocaleDateString()}
                                </Text>
                            </TouchableOpacity>
                            <DatePicker
                                modal
                                open={openDatePicker}
                                date={formData.followUpDate}
                                mode="date"
                                onConfirm={(date) => {
                                    setOpenDatePicker(false);
                                    updateField('followUpDate', date);
                                }}
                                onCancel={() => {
                                    setOpenDatePicker(false);
                                }}
                            />
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
                                        color={formData.status === option.key ? colors.white : colors.textSecondary}
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
                                        color={formData.source === option.key ? colors.white : colors.textSecondary}
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
                            placeholderTextColor={colors.textMuted}
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
                        <Icon name="check" size={20} color={colors.white} />
                        <Text style={styles.submitButtonText}>
                            {isLoading ? 'Adding...' : 'Add Client'}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
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
        backgroundColor: colors.backgroundCard,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
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
        color: colors.text,
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
        color: colors.text,
        marginBottom: SPACING.md,
    },
    inputGroup: {
        marginBottom: SPACING.md,
    },
    label: {
        fontSize: FONTS.sizes.sm,
        color: colors.textSecondary,
        marginBottom: SPACING.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundCard,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    input: {
        flex: 1,
        padding: SPACING.md,
        fontSize: FONTS.sizes.md,
        color: colors.text,
    },
    textArea: {
        backgroundColor: colors.backgroundCard,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        fontSize: FONTS.sizes.md,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
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
        backgroundColor: colors.backgroundCard,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: colors.border,
        gap: SPACING.xs,
    },
    optionButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    optionText: {
        fontSize: FONTS.sizes.sm,
        color: colors.textSecondary,
    },
    optionTextActive: {
        color: colors.white,
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
        backgroundColor: colors.backgroundCard,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: colors.border,
        gap: SPACING.xs,
    },
    sourceButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    sourceText: {
        fontSize: FONTS.sizes.sm,
        color: colors.textSecondary,
    },
    sourceTextActive: {
        color: colors.white,
        fontWeight: '600',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        borderRadius: RADIUS.md,
        padding: SPACING.lg,
        marginTop: SPACING.lg,
        gap: SPACING.sm,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: colors.white,
        fontSize: FONTS.sizes.lg,
        fontWeight: '600',
    },
});

export default AddClientScreen;