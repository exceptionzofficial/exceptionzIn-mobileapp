import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    FlatList,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';

const STATUS_CONFIG = {
    new_lead: { label: 'New Lead', color: COLORS.newLead, icon: 'star-outline' },
    contacted: { label: 'Contacted', color: COLORS.contacted, icon: 'phone-outline' },
    qualified: { label: 'Qualified', color: COLORS.qualified, icon: 'check-circle-outline' },
    converted: { label: 'Converted', color: COLORS.converted, icon: 'check-decagram' },
    lost: { label: 'Lost', color: COLORS.lost, icon: 'close-circle-outline' },
};

const ClientDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { clientId } = route.params;
    const { getClientById, updateClient, addClientNote, deleteClient } = useData();
    const { isAdmin } = useAuth();

    const client = getClientById(clientId);
    const [newNote, setNewNote] = useState('');
    const [showStatusPicker, setShowStatusPicker] = useState(false);

    if (!client) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Icon name="alert-circle-outline" size={48} color={COLORS.error} />
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
        await updateClient(clientId, { status: newStatus });
        setShowStatusPicker(false);
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Client',
            'Are you sure you want to delete this client? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await deleteClient(clientId);
                        if (result.success) {
                            navigation.goBack();
                        } else {
                            Alert.alert('Error', result.error);
                        }
                    },
                },
            ]
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderNote = ({ item }) => (
        <View style={styles.noteCard}>
            <View style={styles.noteHeader}>
                <Icon name="account-circle-outline" size={16} color={COLORS.primary} />
                <Text style={styles.noteAuthor}>{item.createdByName || 'Unknown'}</Text>
                <Text style={styles.noteDate}>{formatDate(item.createdAt)}</Text>
            </View>
            <Text style={styles.noteText}>{item.text}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Client Details</Text>
                {isAdmin && (
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                        <Icon name="trash-can-outline" size={22} color={COLORS.error} />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Client Info Card */}
                <View style={styles.infoCard}>
                    <View style={styles.infoHeader}>
                        <View style={[styles.avatar, { backgroundColor: statusConfig.color + '20' }]}>
                            <Text style={[styles.avatarText, { color: statusConfig.color }]}>
                                {client.name.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.infoDetails}>
                            <Text style={styles.clientName}>{client.name}</Text>
                            {client.company && (
                                <Text style={styles.clientCompany}>{client.company}</Text>
                            )}
                        </View>
                    </View>

                    {/* Status */}
                    <TouchableOpacity
                        style={styles.statusSection}
                        onPress={() => setShowStatusPicker(!showStatusPicker)}
                    >
                        <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '15' }]}>
                            <Icon name={statusConfig.icon} size={16} color={statusConfig.color} />
                            <Text style={[styles.statusText, { color: statusConfig.color }]}>
                                {statusConfig.label}
                            </Text>
                        </View>
                        <View style={styles.changeStatus}>
                            <Text style={styles.changeText}>Change</Text>
                            <Icon name="chevron-down" size={16} color={COLORS.textMuted} />
                        </View>
                    </TouchableOpacity>

                    {showStatusPicker && (
                        <View style={styles.statusPicker}>
                            {Object.entries(STATUS_CONFIG).map(([key, value]) => (
                                <TouchableOpacity
                                    key={key}
                                    style={[
                                        styles.statusOption,
                                        client.status === key && styles.statusOptionActive
                                    ]}
                                    onPress={() => handleStatusChange(key)}
                                >
                                    <Icon name={value.icon} size={16} color={value.color} />
                                    <Text style={styles.statusOptionText}>{value.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Contact Info */}
                    <View style={styles.contactSection}>
                        {client.email && (
                            <View style={styles.contactRow}>
                                <Icon name="email-outline" size={18} color={COLORS.textMuted} />
                                <Text style={styles.contactText}>{client.email}</Text>
                            </View>
                        )}
                        {client.phone && (
                            <View style={styles.contactRow}>
                                <Icon name="phone-outline" size={18} color={COLORS.textMuted} />
                                <Text style={styles.contactText}>{client.phone}</Text>
                            </View>
                        )}
                        <View style={styles.contactRow}>
                            <Icon name="calendar-outline" size={18} color={COLORS.textMuted} />
                            <Text style={styles.contactText}>Added {formatDate(client.createdAt).split(',')[0]}</Text>
                        </View>
                    </View>
                </View>

                {/* Notes Section */}
                <View style={styles.notesSection}>
                    <Text style={styles.sectionTitle}>
                        <Icon name="note-text-outline" size={18} color={COLORS.text} /> Notes ({client.notes?.length || 0})
                    </Text>

                    {/* Add Note Input */}
                    <View style={styles.addNoteContainer}>
                        <TextInput
                            style={styles.noteInput}
                            placeholder="Add a note..."
                            placeholderTextColor={COLORS.textMuted}
                            value={newNote}
                            onChangeText={setNewNote}
                            multiline
                        />
                        <TouchableOpacity
                            style={[styles.addNoteButton, !newNote.trim() && styles.addNoteButtonDisabled]}
                            onPress={handleAddNote}
                            disabled={!newNote.trim()}
                        >
                            <Icon name="send" size={18} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>

                    {/* Notes List */}
                    {client.notes && client.notes.length > 0 ? (
                        <FlatList
                            data={[...client.notes].reverse()}
                            renderItem={renderNote}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                        />
                    ) : (
                        <View style={styles.emptyNotes}>
                            <Icon name="note-outline" size={32} color={COLORS.textMuted} />
                            <Text style={styles.emptyNotesText}>No notes yet</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
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
    deleteButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.error + '10',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        padding: SPACING.lg,
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        fontSize: FONTS.sizes.lg,
        color: COLORS.error,
        marginTop: SPACING.md,
    },
    infoCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        marginBottom: SPACING.lg,
        ...SHADOWS.sm,
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: FONTS.sizes.xxl,
        fontWeight: '700',
    },
    infoDetails: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    clientName: {
        fontSize: FONTS.sizes.xl,
        fontWeight: '700',
        color: COLORS.text,
    },
    clientCompany: {
        fontSize: FONTS.sizes.md,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    statusSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.md,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: COLORS.border,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.full,
        gap: SPACING.xs,
    },
    statusText: {
        fontSize: FONTS.sizes.sm,
        fontWeight: '600',
    },
    changeStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    changeText: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.textMuted,
    },
    statusPicker: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderColor: COLORS.border,
    },
    statusOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundLight,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.md,
        gap: SPACING.xs,
    },
    statusOptionActive: {
        backgroundColor: COLORS.primary + '20',
    },
    statusOptionText: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.text,
    },
    contactSection: {
        paddingTop: SPACING.md,
        gap: SPACING.sm,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    contactText: {
        fontSize: FONTS.sizes.md,
        color: COLORS.text,
    },
    notesSection: {
        marginBottom: SPACING.xxxl,
    },
    sectionTitle: {
        fontSize: FONTS.sizes.lg,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    addNoteContainer: {
        flexDirection: 'row',
        marginBottom: SPACING.md,
        gap: SPACING.sm,
    },
    noteInput: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        fontSize: FONTS.sizes.md,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.border,
        minHeight: 48,
    },
    addNoteButton: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addNoteButtonDisabled: {
        backgroundColor: COLORS.textMuted,
    },
    noteCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    noteHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
        gap: SPACING.xs,
    },
    noteAuthor: {
        fontSize: FONTS.sizes.sm,
        fontWeight: '600',
        color: COLORS.primary,
        flex: 1,
    },
    noteDate: {
        fontSize: FONTS.sizes.xs,
        color: COLORS.textMuted,
    },
    noteText: {
        fontSize: FONTS.sizes.md,
        color: COLORS.text,
        lineHeight: 20,
    },
    emptyNotes: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
    },
    emptyNotesText: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.textMuted,
        marginTop: SPACING.sm,
    },
});

export default ClientDetailScreen;
