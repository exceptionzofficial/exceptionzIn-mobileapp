import React, { useState, useMemo, useEffect, useCallback } from 'react';
import DatePicker from 'react-native-date-picker';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';

const ClientDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { clientId } = route.params;
    const { getClientById, updateClient, addClientNote, deleteClient, createProjectFromClient, refreshClients } = useData();
    const { isAdmin } = useAuth();
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => getStyles(colors), [colors]);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refreshClients();
        setRefreshing(false);
    }, [refreshClients]);

    const STATUS_CONFIG = {
        new_lead: { label: 'New Lead', color: colors.info, icon: 'star-outline' },
        contacted: { label: 'Contacted', color: colors.warning, icon: 'phone-outline' },
        qualified: { label: 'Qualified', color: colors.success, icon: 'check-circle-outline' },
        converted: { label: 'Converted', color: colors.primary, icon: 'check-decagram' },
        lost: { label: 'Lost', color: colors.error, icon: 'close-circle-outline' },
    };

    const client = getClientById(clientId);
    const [newNote, setNewNote] = useState('');
    const [showStatusPicker, setShowStatusPicker] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentData, setPaymentData] = useState({
        totalAmount: '',
        paidAmount: '',
        dueDate: new Date(),
    });
    const [openConversionDatePicker, setOpenConversionDatePicker] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
    });

    useEffect(() => {
        if (client) {
            setEditForm({
                name: client.name || '',
                email: client.email || '',
                phone: client.phone || '',
                company: client.company || '',
            });
        }
    }, [client]);

    if (!client) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Icon name="alert-circle-outline" size={48} color={colors.error} />
                    <Text style={styles.errorText}>Client not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    const statusConfig = STATUS_CONFIG[client.status] || STATUS_CONFIG.new_lead;

    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        const result = await addClientNote(clientId, newNote.trim());
        if (result.success) {
            setNewNote('');
        } else {
            Alert.alert('Error', result.error);
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (newStatus === 'converted') {
            setShowStatusPicker(false);
            setShowPaymentModal(true);
        } else {
            await updateClient(clientId, { status: newStatus });
            setShowStatusPicker(false);
        }
    };

    const handleConvertWithPayment = async () => {
        const total = parseFloat(paymentData.totalAmount) || 0;
        const paid = parseFloat(paymentData.paidAmount) || 0;
        if (total <= 0) {
            Alert.alert('Error', 'Please enter a valid total amount');
            return;
        }
        await updateClient(clientId, { status: 'converted' });
        const result = await createProjectFromClient(clientId, {
            totalAmount: total,
            paidAmount: paid,
            dueAmount: total - paid,
            dueDate: paymentData.dueDate,
        });
        setShowPaymentModal(false);
        setPaymentData({ totalAmount: '', paidAmount: '', dueDate: new Date() });
        if (result.success) {
            Alert.alert('Project Created', `Project "${client.name}" has been created successfully!`, [
                { text: 'View Projects', onPress: () => navigation.navigate('Projects') },
                { text: 'Stay Here', style: 'cancel' },
            ]);
        }
    };

    const handleDelete = () => {
        Alert.alert('Delete Client', 'Are you sure you want to delete this client? This action cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive',
                onPress: async () => {
                    const result = await deleteClient(clientId);
                    if (result.success) navigation.goBack();
                    else Alert.alert('Error', result.error);
                },
            },
        ]);

    };

    const handleSave = async () => {
        const result = await updateClient(clientId, editForm);
        if (result.success) {
            setIsEditing(false);
            Alert.alert('Success', 'Client details updated');
        } else {
            Alert.alert('Error', result.error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const getDueAmount = () => {
        const total = parseFloat(paymentData.totalAmount) || 0;
        const paid = parseFloat(paymentData.paidAmount) || 0;
        return Math.max(0, total - paid);
    };

    const renderNote = ({ item }) => (
        <View style={styles.noteCard}>
            <View style={styles.noteHeader}>
                <Icon name="account-circle-outline" size={16} color={colors.primary} />
                <Text style={styles.noteAuthor}>{item.createdByName || 'Unknown'}</Text>
                <Text style={styles.noteDate}>{formatDate(item.createdAt)}</Text>
            </View>
            <Text style={styles.noteText}>{item.text}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isEditing ? 'Edit Client' : 'Client Details'}</Text>
                <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                    {isEditing ? (
                        <>
                            <TouchableOpacity style={styles.headerButton} onPress={() => setIsEditing(false)}>
                                <Icon name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.headerButton} onPress={handleSave}>
                                <Icon name="check" size={24} color={colors.primary} />
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity style={styles.headerButton} onPress={() => setIsEditing(true)}>
                                <Icon name="pencil" size={24} color={colors.primary} />
                            </TouchableOpacity>
                            {isAdmin && (
                                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                                    <Icon name="trash-can-outline" size={22} color={colors.error} />
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </View>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            >
                <View style={styles.infoCard}>
                    <View style={styles.infoHeader}>
                        <View style={[styles.avatar, { backgroundColor: statusConfig.color + '20' }]}>
                            <Text style={[styles.avatarText, { color: statusConfig.color }]}>
                                {client.name.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.infoDetails}>
                            {isEditing ? (
                                <TextInput
                                    style={styles.editNameInput}
                                    value={editForm.name}
                                    onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
                                    placeholder="Name"
                                    placeholderTextColor={colors.textMuted}
                                />
                            ) : (
                                <Text style={styles.clientName}>{client.name}</Text>
                            )}
                            {isEditing ? (
                                <TextInput
                                    style={styles.editCompanyInput}
                                    value={editForm.company}
                                    onChangeText={(text) => setEditForm(prev => ({ ...prev, company: text }))}
                                    placeholder="Company"
                                    placeholderTextColor={colors.textMuted}
                                />
                            ) : (
                                client.company && <Text style={styles.clientCompany}>{client.company}</Text>
                            )}
                        </View>
                    </View>

                    <TouchableOpacity style={styles.statusSection} onPress={() => setShowStatusPicker(!showStatusPicker)}>
                        <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '15' }]}>
                            <Icon name={statusConfig.icon} size={16} color={statusConfig.color} />
                            <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
                        </View>
                        <View style={styles.changeStatus}>
                            <Text style={styles.changeText}>Change</Text>
                            <Icon name="chevron-down" size={16} color={colors.textMuted} />
                        </View>
                    </TouchableOpacity>

                    {showStatusPicker && (
                        <View style={styles.statusPicker}>
                            {Object.entries(STATUS_CONFIG).map(([key, value]) => (
                                <TouchableOpacity
                                    key={key}
                                    style={[styles.statusOption, client.status === key && styles.statusOptionActive]}
                                    onPress={() => handleStatusChange(key)}
                                >
                                    <Icon name={value.icon} size={16} color={value.color} />
                                    <Text style={styles.statusOptionText}>{value.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    <View style={styles.contactSection}>
                        <View style={styles.contactRow}>
                            <Icon name="email-outline" size={18} color={colors.textMuted} />
                            {isEditing ? (
                                <TextInput
                                    style={styles.editContactInput}
                                    value={editForm.email}
                                    onChangeText={(text) => setEditForm(prev => ({ ...prev, email: text }))}
                                    placeholder="Email"
                                    placeholderTextColor={colors.textMuted}
                                    autoCapitalize="none"
                                />
                            ) : (
                                <Text style={styles.contactText}>{client.email || 'No email'}</Text>
                            )}
                        </View>
                        <View style={styles.contactRow}>
                            <Icon name="phone-outline" size={18} color={colors.textMuted} />
                            {isEditing ? (
                                <TextInput
                                    style={styles.editContactInput}
                                    value={editForm.phone}
                                    onChangeText={(text) => setEditForm(prev => ({ ...prev, phone: text }))}
                                    placeholder="Phone"
                                    placeholderTextColor={colors.textMuted}
                                    keyboardType="phone-pad"
                                />
                            ) : (
                                <Text style={styles.contactText}>{client.phone || 'No phone'}</Text>
                            )}
                        </View>
                        <View style={styles.contactRow}>
                            <Icon name="calendar-outline" size={18} color={colors.textMuted} />
                            <Text style={styles.contactText}>Added {formatDate(client.createdAt).split(',')[0]}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.notesSection}>
                    <Text style={styles.sectionTitle}>
                        <Icon name="note-text-outline" size={18} color={colors.text} /> Notes ({client.notes?.length || 0})
                    </Text>
                    <View style={styles.addNoteContainer}>
                        <TextInput
                            style={styles.noteInput}
                            placeholder="Add a note..."
                            placeholderTextColor={colors.textMuted}
                            value={newNote}
                            onChangeText={setNewNote}
                            multiline
                        />
                        <TouchableOpacity
                            style={[styles.addNoteButton, !newNote.trim() && styles.addNoteButtonDisabled]}
                            onPress={handleAddNote}
                            disabled={!newNote.trim()}
                        >
                            <Icon name="send" size={18} color={colors.white} />
                        </TouchableOpacity>
                    </View>
                    {client.notes && client.notes.length > 0 ? (
                        <FlatList data={[...client.notes].reverse()} renderItem={renderNote} keyExtractor={(item) => item.id} scrollEnabled={false} />
                    ) : (
                        <View style={styles.emptyNotes}>
                            <Icon name="note-outline" size={32} color={colors.textMuted} />
                            <Text style={styles.emptyNotesText}>No notes yet</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            <Modal visible={showPaymentModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Convert to Project</Text>
                            <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                                <Icon name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalSubtitle}>Enter payment details for "{client.name}"</Text>
                        <View style={styles.modalForm}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Total Amount (₹)</Text>
                                <TextInput style={styles.modalInput} placeholder="e.g. 50000" placeholderTextColor={colors.textMuted} value={paymentData.totalAmount} onChangeText={(text) => setPaymentData(prev => ({ ...prev, totalAmount: text }))} keyboardType="numeric" />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Paid Amount (₹)</Text>
                                <TextInput style={styles.modalInput} placeholder="e.g. 25000" placeholderTextColor={colors.textMuted} value={paymentData.paidAmount} onChangeText={(text) => setPaymentData(prev => ({ ...prev, paidAmount: text }))} keyboardType="numeric" />
                            </View>
                            <View style={styles.dueAmountRow}>
                                <Text style={styles.dueLabel}>Due Amount:</Text>
                                <Text style={styles.dueValue}>₹{getDueAmount().toLocaleString()}</Text>
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Due Date (Optional)</Text>
                                <TouchableOpacity onPress={() => setOpenConversionDatePicker(true)}>
                                    <View style={[styles.modalInput, { justifyContent: 'center' }]}>
                                        <Text style={{ color: colors.text }}>
                                            {paymentData.dueDate ? paymentData.dueDate.toLocaleDateString() : 'Select Date'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                                <DatePicker
                                    modal
                                    open={openConversionDatePicker}
                                    date={paymentData.dueDate || new Date()}
                                    mode="date"
                                    onConfirm={(date) => {
                                        setOpenConversionDatePicker(false);
                                        setPaymentData(prev => ({ ...prev, dueDate: date }));
                                    }}
                                    onCancel={() => {
                                        setOpenConversionDatePicker(false);
                                    }}
                                />
                            </View>
                        </View>
                        <TouchableOpacity style={styles.convertButton} onPress={handleConvertWithPayment}>
                            <Icon name="check-decagram" size={20} color={colors.white} />
                            <Text style={styles.convertButtonText}>Create Project</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl + 10, paddingBottom: SPACING.md, backgroundColor: colors.backgroundCard, borderBottomWidth: 1, borderBottomColor: colors.border },
    backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: colors.text },
    deleteButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.error + '10', alignItems: 'center', justifyContent: 'center' },
    content: { flex: 1, padding: SPACING.lg },
    errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    errorText: { fontSize: FONTS.sizes.lg, color: colors.error, marginTop: SPACING.md },
    infoCard: { backgroundColor: colors.backgroundCard, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.lg, ...SHADOWS.sm },
    infoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg },
    avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: FONTS.sizes.xxl, fontWeight: '700' },
    infoDetails: { flex: 1, marginLeft: SPACING.md },
    clientName: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: colors.text },
    clientCompany: { fontSize: FONTS.sizes.md, color: colors.textSecondary, marginTop: 2 },
    statusSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.md, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, gap: SPACING.xs },
    statusText: { fontSize: FONTS.sizes.sm, fontWeight: '600' },
    changeStatus: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
    changeText: { fontSize: FONTS.sizes.sm, color: colors.textMuted },
    statusPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, paddingVertical: SPACING.md, borderBottomWidth: 1, borderColor: colors.border },
    statusOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.backgroundLight, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, gap: SPACING.xs },
    statusOptionActive: { backgroundColor: colors.primary + '20' },
    statusOptionText: { fontSize: FONTS.sizes.sm, color: colors.text },
    contactSection: { paddingTop: SPACING.md, gap: SPACING.sm },
    contactRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
    contactText: { fontSize: FONTS.sizes.md, color: colors.text },
    notesSection: { marginBottom: SPACING.xxxl },
    sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: colors.text, marginBottom: SPACING.md },
    addNoteContainer: { flexDirection: 'row', marginBottom: SPACING.md, gap: SPACING.sm },
    noteInput: { flex: 1, backgroundColor: colors.backgroundCard, borderRadius: RADIUS.md, padding: SPACING.md, fontSize: FONTS.sizes.md, color: colors.text, borderWidth: 1, borderColor: colors.border, minHeight: 48 },
    addNoteButton: { width: 48, height: 48, borderRadius: RADIUS.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    addNoteButtonDisabled: { backgroundColor: colors.textMuted },
    noteCard: { backgroundColor: colors.backgroundCard, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: colors.border },
    noteHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm, gap: SPACING.xs },
    noteAuthor: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: colors.primary, flex: 1 },
    noteDate: { fontSize: FONTS.sizes.xs, color: colors.textMuted },
    noteText: { fontSize: FONTS.sizes.md, color: colors.text, lineHeight: 20 },
    emptyNotes: { alignItems: 'center', paddingVertical: SPACING.xl },
    emptyNotesText: { fontSize: FONTS.sizes.sm, color: colors.textMuted, marginTop: SPACING.sm },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: colors.backgroundCard, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.xl, paddingBottom: SPACING.xxxl },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
    modalTitle: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: colors.text },
    modalSubtitle: { fontSize: FONTS.sizes.md, color: colors.textSecondary, marginBottom: SPACING.xl },
    modalForm: { gap: SPACING.md },
    inputGroup: { marginBottom: SPACING.sm },
    inputLabel: { fontSize: FONTS.sizes.sm, color: colors.textSecondary, marginBottom: SPACING.xs },
    modalInput: { backgroundColor: colors.backgroundLight, borderRadius: RADIUS.md, padding: SPACING.md, fontSize: FONTS.sizes.md, color: colors.text, borderWidth: 1, borderColor: colors.border },
    dueAmountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.success + '10', borderRadius: RADIUS.md, padding: SPACING.md },
    dueLabel: { fontSize: FONTS.sizes.md, color: colors.text },
    dueValue: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: colors.success },
    convertButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: RADIUS.md, padding: SPACING.lg, marginTop: SPACING.lg, gap: SPACING.sm },
    convertButtonText: { color: colors.white, fontSize: FONTS.sizes.md, fontWeight: '600' },
    headerButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: colors.backgroundLight },
    editNameInput: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: colors.text, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 2, marginBottom: 4 },
    editCompanyInput: { fontSize: FONTS.sizes.md, color: colors.textSecondary, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 2 },
    editContactInput: { fontSize: FONTS.sizes.md, color: colors.text, flex: 1, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 2 },
});

export default ClientDetailScreen;
