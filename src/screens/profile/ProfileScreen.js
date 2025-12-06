import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    TextInput,
    Alert,
    Switch,
    StatusBar,
    Modal,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';

// Company Bank Details
const BANK_DETAILS = {
    accountName: 'Exceptionz Technologies',
    accountNumber: '50200012345678',
    ifscCode: 'HDFC0001234',
    bankName: 'HDFC Bank',
    branch: 'Chennai Main Branch',
    upiId: 'exceptionz@hdfcbank',
};

const ProfileScreen = () => {
    const { user, logout, updateUserProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [showBankDetails, setShowBankDetails] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const [editData, setEditData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        designation: user?.designation || '',
    });
    const [profileImage, setProfileImage] = useState(user?.profileImage || null);

    const handleImagePick = async () => {
        const options = {
            mediaType: 'photo',
            quality: 0.8,
            maxWidth: 500,
            maxHeight: 500,
        };

        try {
            const result = await launchImageLibrary(options);
            if (result.assets && result.assets[0]) {
                setProfileImage(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const handleSaveProfile = async () => {
        if (!editData.name.trim()) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        // Save profile updates
        if (updateUserProfile) {
            await updateUserProfile({ ...editData, profileImage });
        }
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');
    };

    const copyToClipboard = (text, label) => {
        Clipboard.setString(text);
        Alert.alert('Copied', `${label} copied to clipboard`);
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: logout },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                >
                    <Icon name={isEditing ? 'check' : 'pencil'} size={20} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <TouchableOpacity style={styles.avatarContainer} onPress={handleImagePick}>
                        {profileImage ? (
                            <Image source={{ uri: profileImage }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </Text>
                            </View>
                        )}
                        <View style={styles.cameraIcon}>
                            <Icon name="camera" size={14} color={COLORS.white} />
                        </View>
                    </TouchableOpacity>

                    {isEditing ? (
                        <View style={styles.editForm}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Full Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editData.name}
                                    onChangeText={(text) => setEditData(prev => ({ ...prev, name: text }))}
                                    placeholder="Enter your name"
                                    placeholderTextColor={COLORS.textMuted}
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Email</Text>
                                <TextInput
                                    style={[styles.input, styles.inputDisabled]}
                                    value={editData.email}
                                    editable={false}
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Phone</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editData.phone}
                                    onChangeText={(text) => setEditData(prev => ({ ...prev, phone: text }))}
                                    placeholder="Enter phone number"
                                    placeholderTextColor={COLORS.textMuted}
                                    keyboardType="phone-pad"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Designation</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editData.designation}
                                    onChangeText={(text) => setEditData(prev => ({ ...prev, designation: text }))}
                                    placeholder="Enter designation"
                                    placeholderTextColor={COLORS.textMuted}
                                />
                            </View>
                        </View>
                    ) : (
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>{user?.name || 'User'}</Text>
                            <Text style={styles.profileEmail}>{user?.email}</Text>
                            {user?.designation && (
                                <View style={styles.designationBadge}>
                                    <Text style={styles.designationText}>{user.designation}</Text>
                                </View>
                            )}
                            {user?.role === 'admin' && (
                                <View style={styles.adminBadge}>
                                    <Icon name="shield-check" size={12} color={COLORS.white} />
                                    <Text style={styles.adminText}>Admin</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Options</Text>

                    <TouchableOpacity style={styles.menuItem} onPress={() => setShowQRCode(true)}>
                        <View style={[styles.menuIcon, { backgroundColor: COLORS.primary + '15' }]}>
                            <Icon name="qrcode" size={22} color={COLORS.primary} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuLabel}>Company QR Code</Text>
                            <Text style={styles.menuHint}>Scan to make payments</Text>
                        </View>
                        <Icon name="chevron-right" size={20} color={COLORS.textMuted} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => setShowBankDetails(true)}>
                        <View style={[styles.menuIcon, { backgroundColor: COLORS.success + '15' }]}>
                            <Icon name="bank" size={22} color={COLORS.success} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuLabel}>Bank Details</Text>
                            <Text style={styles.menuHint}>View account information</Text>
                        </View>
                        <Icon name="chevron-right" size={20} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </View>

                {/* Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Settings</Text>

                    <View style={styles.settingItem}>
                        <View style={[styles.menuIcon, { backgroundColor: COLORS.warning + '15' }]}>
                            <Icon name="bell-outline" size={22} color={COLORS.warning} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuLabel}>Push Notifications</Text>
                        </View>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
                            thumbColor={notificationsEnabled ? COLORS.primary : COLORS.textMuted}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View style={[styles.menuIcon, { backgroundColor: COLORS.text + '15' }]}>
                            <Icon name={isDarkMode ? 'weather-night' : 'white-balance-sunny'} size={22} color={COLORS.text} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuLabel}>Dark Mode</Text>
                        </View>
                        <Switch
                            value={isDarkMode}
                            onValueChange={setIsDarkMode}
                            trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
                            thumbColor={isDarkMode ? COLORS.primary : COLORS.textMuted}
                        />
                    </View>
                </View>

                {/* Other Options */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support</Text>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={[styles.menuIcon, { backgroundColor: COLORS.info + '15' }]}>
                            <Icon name="help-circle-outline" size={22} color={COLORS.info} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuLabel}>Help & Support</Text>
                        </View>
                        <Icon name="chevron-right" size={20} color={COLORS.textMuted} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={[styles.menuIcon, { backgroundColor: COLORS.newLead + '15' }]}>
                            <Icon name="information-outline" size={22} color={COLORS.newLead} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuLabel}>About App</Text>
                            <Text style={styles.menuHint}>Version 1.0.0</Text>
                        </View>
                        <Icon name="chevron-right" size={20} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Icon name="logout" size={20} color={COLORS.error} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* QR Code Modal */}
            <Modal visible={showQRCode} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Payment QR Code</Text>
                            <TouchableOpacity onPress={() => setShowQRCode(false)}>
                                <Icon name="close" size={24} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.qrContainer}>
                            <View style={styles.qrPlaceholder}>
                                <Icon name="qrcode" size={150} color={COLORS.text} />
                            </View>
                            <Text style={styles.qrHint}>Scan this QR code to make payments</Text>
                            <Text style={styles.upiId}>{BANK_DETAILS.upiId}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.copyButton}
                            onPress={() => copyToClipboard(BANK_DETAILS.upiId, 'UPI ID')}
                        >
                            <Icon name="content-copy" size={18} color={COLORS.white} />
                            <Text style={styles.copyButtonText}>Copy UPI ID</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Bank Details Modal */}
            <Modal visible={showBankDetails} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Bank Details</Text>
                            <TouchableOpacity onPress={() => setShowBankDetails(false)}>
                                <Icon name="close" size={24} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.bankDetailsContainer}>
                            <TouchableOpacity
                                style={styles.bankDetailRow}
                                onPress={() => copyToClipboard(BANK_DETAILS.accountName, 'Account Name')}
                            >
                                <Text style={styles.bankLabel}>Account Name</Text>
                                <View style={styles.bankValueRow}>
                                    <Text style={styles.bankValue}>{BANK_DETAILS.accountName}</Text>
                                    <Icon name="content-copy" size={16} color={COLORS.textMuted} />
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.bankDetailRow}
                                onPress={() => copyToClipboard(BANK_DETAILS.accountNumber, 'Account Number')}
                            >
                                <Text style={styles.bankLabel}>Account Number</Text>
                                <View style={styles.bankValueRow}>
                                    <Text style={styles.bankValue}>{BANK_DETAILS.accountNumber}</Text>
                                    <Icon name="content-copy" size={16} color={COLORS.textMuted} />
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.bankDetailRow}
                                onPress={() => copyToClipboard(BANK_DETAILS.ifscCode, 'IFSC Code')}
                            >
                                <Text style={styles.bankLabel}>IFSC Code</Text>
                                <View style={styles.bankValueRow}>
                                    <Text style={styles.bankValue}>{BANK_DETAILS.ifscCode}</Text>
                                    <Icon name="content-copy" size={16} color={COLORS.textMuted} />
                                </View>
                            </TouchableOpacity>

                            <View style={styles.bankDetailRow}>
                                <Text style={styles.bankLabel}>Bank Name</Text>
                                <Text style={styles.bankValue}>{BANK_DETAILS.bankName}</Text>
                            </View>

                            <View style={styles.bankDetailRow}>
                                <Text style={styles.bankLabel}>Branch</Text>
                                <Text style={styles.bankValue}>{BANK_DETAILS.branch}</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.bankDetailRow}
                                onPress={() => copyToClipboard(BANK_DETAILS.upiId, 'UPI ID')}
                            >
                                <Text style={styles.bankLabel}>UPI ID</Text>
                                <View style={styles.bankValueRow}>
                                    <Text style={styles.bankValue}>{BANK_DETAILS.upiId}</Text>
                                    <Icon name="content-copy" size={16} color={COLORS.textMuted} />
                                </View>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.copyHint}>Tap any field to copy</Text>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, paddingBottom: SPACING.md,
    },
    headerTitle: { fontSize: FONTS.sizes.xxl, fontWeight: '700', color: COLORS.text },
    editButton: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.white,
        alignItems: 'center', justifyContent: 'center', ...SHADOWS.sm,
    },
    content: { flex: 1, padding: SPACING.lg },
    profileCard: {
        backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SPACING.xl,
        alignItems: 'center', marginBottom: SPACING.lg, ...SHADOWS.md,
    },
    avatarContainer: { position: 'relative', marginBottom: SPACING.lg },
    avatar: { width: 100, height: 100, borderRadius: 50 },
    avatarPlaceholder: {
        width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primary,
        alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { fontSize: FONTS.sizes.xxxl, fontWeight: '700', color: COLORS.white },
    cameraIcon: {
        position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16,
        backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
        borderWidth: 3, borderColor: COLORS.white,
    },
    profileInfo: { alignItems: 'center' },
    profileName: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.text },
    profileEmail: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, marginTop: SPACING.xs },
    designationBadge: {
        backgroundColor: COLORS.backgroundLight, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
        borderRadius: RADIUS.full, marginTop: SPACING.sm,
    },
    designationText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
    adminBadge: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full,
        marginTop: SPACING.sm, gap: SPACING.xs,
    },
    adminText: { fontSize: FONTS.sizes.xs, color: COLORS.white, fontWeight: '600' },
    editForm: { width: '100%' },
    inputGroup: { marginBottom: SPACING.md },
    inputLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.xs },
    input: {
        backgroundColor: COLORS.backgroundLight, borderRadius: RADIUS.md, padding: SPACING.md,
        fontSize: FONTS.sizes.md, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border,
    },
    inputDisabled: { backgroundColor: COLORS.backgroundDark, color: COLORS.textMuted },
    section: { marginBottom: SPACING.lg },
    sectionTitle: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.md },
    menuItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOWS.sm,
    },
    settingItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOWS.sm,
    },
    menuIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    menuContent: { flex: 1, marginLeft: SPACING.md },
    menuLabel: { fontSize: FONTS.sizes.md, fontWeight: '500', color: COLORS.text },
    menuHint: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, marginTop: 2 },
    logoutButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.error + '10',
        borderRadius: RADIUS.lg, padding: SPACING.lg, gap: SPACING.sm,
    },
    logoutText: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.error },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: {
        backgroundColor: COLORS.white, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
        padding: SPACING.xl, paddingBottom: SPACING.xxxl,
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl },
    modalTitle: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.text },
    qrContainer: { alignItems: 'center', paddingVertical: SPACING.xl },
    qrPlaceholder: {
        width: 200, height: 200, backgroundColor: COLORS.backgroundLight, borderRadius: RADIUS.lg,
        alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg,
    },
    qrHint: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
    upiId: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.primary },
    copyButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary,
        borderRadius: RADIUS.md, padding: SPACING.md, gap: SPACING.sm,
    },
    copyButtonText: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '600' },
    bankDetailsContainer: { marginBottom: SPACING.lg },
    bankDetailRow: { paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    bankLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, marginBottom: SPACING.xs },
    bankValue: { fontSize: FONTS.sizes.md, fontWeight: '500', color: COLORS.text },
    bankValueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    copyHint: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, textAlign: 'center' },
});

export default ProfileScreen;
