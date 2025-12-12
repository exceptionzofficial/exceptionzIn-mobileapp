import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Alert,
    Modal,
    StatusBar,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';

const AdminPanel = () => {
    const navigation = useNavigation();
    const { getAllUsers, createUser, blockUser, unblockUser, deleteUser, logout, refreshUsers } = useAuth();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refreshUsers();
        setRefreshing(false);
    }, [refreshUsers]);

    const users = getAllUsers().filter(u => u.role !== 'admin');
    const activeCount = users.filter(u => !u.isBlocked).length;
    const blockedCount = users.filter(u => u.isBlocked).length;

    const handleCreateUser = async () => {
        if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (newUser.password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        const result = await createUser(newUser);
        setIsLoading(false);

        if (result.success) {
            setNewUser({ name: '', email: '', password: '' });
            setShowCreateModal(false);
            Alert.alert('Success', 'User created successfully');
        } else {
            Alert.alert('Error', result.error);
        }
    };

    const handleBlockToggle = async (user) => {
        const action = user.isBlocked ? unblockUser : blockUser;
        const result = await action(user.id);
        if (!result.success) {
            Alert.alert('Error', result.error);
        }
    };

    const handleDelete = (user) => {
        Alert.alert('Delete User', `Are you sure you want to delete ${user.name}?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive',
                onPress: async () => {
                    const result = await deleteUser(user.id);
                    if (!result.success) Alert.alert('Error', result.error);
                },
            },
        ]);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const renderUser = ({ item }) => (
        <View style={[styles.userCard, item.isBlocked && styles.userCardBlocked]}>
            <View style={styles.userHeader}>
                <View style={[styles.userAvatar, item.isBlocked && styles.userAvatarBlocked]}>
                    <Text style={styles.userAvatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                </View>
                {item.isBlocked && (
                    <View style={styles.blockedBadge}>
                        <Icon name="block-helper" size={10} color={COLORS.white} />
                        <Text style={styles.blockedText}>Blocked</Text>
                    </View>
                )}
            </View>

            <View style={styles.userMeta}>
                <Icon name="calendar-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.metaText}>Joined {formatDate(item.createdAt)}</Text>
            </View>

            <View style={styles.userActions}>
                <TouchableOpacity
                    style={[styles.actionButton, item.isBlocked ? styles.unblockButton : styles.blockButton]}
                    onPress={() => handleBlockToggle(item)}
                >
                    <Icon name={item.isBlocked ? 'account-check' : 'account-cancel'} size={16} color={COLORS.white} />
                    <Text style={styles.actionText}>{item.isBlocked ? 'Unblock' : 'Block'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteActionButton} onPress={() => handleDelete(item)}>
                    <Icon name="trash-can-outline" size={16} color={COLORS.error} />
                </TouchableOpacity>
            </View>
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
                <Text style={styles.headerTitle}>Admin Panel</Text>
                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Icon name="logout" size={22} color={COLORS.error} />
                </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Icon name="account-group" size={24} color={COLORS.primary} />
                    <Text style={styles.statNumber}>{users.length}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statCard}>
                    <Icon name="account-check" size={24} color={COLORS.success} />
                    <Text style={styles.statNumber}>{activeCount}</Text>
                    <Text style={styles.statLabel}>Active</Text>
                </View>
                <View style={styles.statCard}>
                    <Icon name="account-cancel" size={24} color={COLORS.error} />
                    <Text style={styles.statNumber}>{blockedCount}</Text>
                    <Text style={styles.statLabel}>Blocked</Text>
                </View>
            </View>

            {/* Section Header */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Team Members</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => setShowCreateModal(true)}>
                    <Icon name="plus" size={18} color={COLORS.white} />
                    <Text style={styles.addButtonText}>Add User</Text>
                </TouchableOpacity>
            </View>

            {/* User List */}
            <FlatList
                data={users}
                renderItem={renderUser}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="account-multiple-outline" size={48} color={COLORS.textMuted} />
                        <Text style={styles.emptyText}>No team members yet</Text>
                    </View>
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
            />

            {/* Create User Modal */}
            <Modal visible={showCreateModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Create New User</Text>
                            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                                <Icon name="close" size={24} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Name</Text>
                            <View style={styles.inputContainer}>
                                <Icon name="account-outline" size={20} color={COLORS.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter name"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={newUser.name}
                                    onChangeText={(value) => setNewUser(prev => ({ ...prev, name: value }))}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Email</Text>
                            <View style={styles.inputContainer}>
                                <Icon name="email-outline" size={20} color={COLORS.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter email"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={newUser.email}
                                    onChangeText={(value) => setNewUser(prev => ({ ...prev, email: value }))}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Password</Text>
                            <View style={styles.inputContainer}>
                                <Icon name="lock-outline" size={20} color={COLORS.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter password"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={newUser.password}
                                    onChangeText={(value) => setNewUser(prev => ({ ...prev, password: value }))}
                                    secureTextEntry
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.createButton, isLoading && styles.createButtonDisabled]}
                            onPress={handleCreateUser}
                            disabled={isLoading}
                        >
                            <Icon name="check" size={20} color={COLORS.white} />
                            <Text style={styles.createButtonText}>{isLoading ? 'Creating...' : 'Create User'}</Text>
                        </TouchableOpacity>
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
        paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl + 10, paddingBottom: SPACING.md,
        backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    },
    backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: COLORS.text },
    logoutButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.error + '10', alignItems: 'center', justifyContent: 'center' },
    statsContainer: { flexDirection: 'row', padding: SPACING.lg, gap: SPACING.md },
    statCard: { flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center', ...SHADOWS.sm },
    statNumber: { fontSize: FONTS.sizes.xxl, fontWeight: '700', color: COLORS.text, marginTop: SPACING.sm },
    statLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
    sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: COLORS.text },
    addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, gap: SPACING.xs },
    addButtonText: { color: COLORS.white, fontSize: FONTS.sizes.sm, fontWeight: '600' },
    listContent: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
    userCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOWS.sm },
    userCardBlocked: { opacity: 0.7, borderLeftWidth: 3, borderLeftColor: COLORS.error },
    userHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
    userAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
    userAvatarBlocked: { backgroundColor: COLORS.textMuted },
    userAvatarText: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '600' },
    userInfo: { flex: 1, marginLeft: SPACING.md },
    userName: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
    userEmail: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
    blockedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.error, paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.full, gap: 2 },
    blockedText: { color: COLORS.white, fontSize: FONTS.sizes.xs, fontWeight: '600' },
    userMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.md },
    metaText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted },
    userActions: { flexDirection: 'row', gap: SPACING.sm },
    actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.sm, borderRadius: RADIUS.md, gap: SPACING.xs },
    blockButton: { backgroundColor: COLORS.warning },
    unblockButton: { backgroundColor: COLORS.success },
    actionText: { color: COLORS.white, fontSize: FONTS.sizes.sm, fontWeight: '600' },
    deleteActionButton: { width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: COLORS.error + '15', alignItems: 'center', justifyContent: 'center' },
    emptyContainer: { alignItems: 'center', paddingVertical: SPACING.xxxl },
    emptyText: { fontSize: FONTS.sizes.md, color: COLORS.textMuted, marginTop: SPACING.md },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.xl, paddingBottom: SPACING.xxxl },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl },
    modalTitle: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.text },
    inputGroup: { marginBottom: SPACING.md },
    inputLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundLight, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
    input: { flex: 1, padding: SPACING.md, fontSize: FONTS.sizes.md, color: COLORS.text },
    createButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: RADIUS.md, padding: SPACING.lg, marginTop: SPACING.lg, gap: SPACING.sm },
    createButtonDisabled: { opacity: 0.7 },
    createButtonText: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '600' },
});

export default AdminPanel;
