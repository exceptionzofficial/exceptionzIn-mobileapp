import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';

const ClientScreen = () => {
    const navigation = useNavigation();
    const { clients } = useData();
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => getStyles(colors), [colors]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const STATUS_CONFIG = {
        new_lead: { label: 'New Lead', color: colors.info, icon: 'star-outline' },
        contacted: { label: 'Contacted', color: colors.warning, icon: 'phone-outline' },
        qualified: { label: 'Qualified', color: colors.success, icon: 'check-circle-outline' },
        converted: { label: 'Converted', color: colors.primary, icon: 'check-decagram' },
        lost: { label: 'Lost', color: colors.error, icon: 'close-circle-outline' },
    };

    const filteredClients = clients.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.company?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || client.status === filterStatus;
        return matchesSearch && matchesFilter;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const getStatusStats = () => {
        const stats = { all: clients.length };
        Object.keys(STATUS_CONFIG).forEach(status => {
            stats[status] = clients.filter(c => c.status === status).length;
        });
        return stats;
    };

    const stats = getStatusStats();

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const renderStatusFilter = () => (
        <View style={styles.filterContainer}>
            <TouchableOpacity
                style={[styles.filterChip, filterStatus === 'all' && styles.filterChipActive]}
                onPress={() => setFilterStatus('all')}
            >
                <Text style={[styles.filterText, filterStatus === 'all' && styles.filterTextActive]}>
                    All ({stats.all})
                </Text>
            </TouchableOpacity>
            {Object.entries(STATUS_CONFIG).map(([key, value]) => (
                <TouchableOpacity
                    key={key}
                    style={[
                        styles.filterChip,
                        filterStatus === key && styles.filterChipActive,
                    ]}
                    onPress={() => setFilterStatus(key)}
                >
                    <Icon name={value.icon} size={14} color={filterStatus === key ? colors.white : value.color} />
                    <Text style={[styles.filterText, filterStatus === key && styles.filterTextActive]}>
                        {stats[key]}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderClient = ({ item }) => {
        const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.new_lead;

        return (
            <TouchableOpacity
                style={styles.clientCard}
                onPress={() => navigation.navigate('ClientDetail', { clientId: item.id })}
            >
                <View style={styles.clientHeader}>
                    <View style={[styles.clientAvatar, { backgroundColor: statusConfig.color + '20' }]}>
                        <Text style={[styles.clientAvatarText, { color: statusConfig.color }]}>
                            {item.name.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.clientInfo}>
                        <Text style={styles.clientName}>{item.name}</Text>
                        {item.company && (
                            <Text style={styles.clientCompany}>{item.company}</Text>
                        )}
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '15' }]}>
                        <Icon name={statusConfig.icon} size={12} color={statusConfig.color} />
                        <Text style={[styles.statusText, { color: statusConfig.color }]}>
                            {statusConfig.label}
                        </Text>
                    </View>
                </View>

                <View style={styles.clientDetails}>
                    {item.email && (
                        <View style={styles.detailRow}>
                            <Icon name="email-outline" size={14} color={colors.textMuted} />
                            <Text style={styles.detailText}>{item.email}</Text>
                        </View>
                    )}
                    {item.phone && (
                        <View style={styles.detailRow}>
                            <Icon name="phone-outline" size={14} color={colors.textMuted} />
                            <Text style={styles.detailText}>{item.phone}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.clientFooter}>
                    <View style={styles.footerItem}>
                        <Icon name="note-text-outline" size={14} color={colors.textMuted} />
                        <Text style={styles.footerText}>{item.notes?.length || 0} notes</Text>
                    </View>
                    <Text style={styles.dateText}>Added {formatDate(item.createdAt)}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Icon name="account-group-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Clients Yet</Text>
            <Text style={styles.emptyText}>Add your first client to start tracking leads</Text>
            <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('AddClient')}
            >
                <Icon name="plus" size={18} color={colors.white} />
                <Text style={styles.emptyButtonText}>Add Client</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Clients</Text>
                <Text style={styles.headerSubtitle}>{clients.length} total clients</Text>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Icon name="magnify" size={20} color={colors.textMuted} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search clients..."
                    placeholderTextColor={colors.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Icon name="close-circle" size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Status Filter */}
            {renderStatusFilter()}

            {/* Client List */}
            <FlatList
                data={filteredClients}
                renderItem={renderClient}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmpty}
            />

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddClient')}
            >
                <Icon name="plus" size={24} color={colors.white} />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.md,
    },
    headerTitle: {
        fontSize: FONTS.sizes.xxl,
        fontWeight: '700',
        color: colors.text,
    },
    headerSubtitle: {
        fontSize: FONTS.sizes.sm,
        color: colors.textSecondary,
        marginTop: SPACING.xs,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundCard,
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
        paddingHorizontal: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    searchInput: {
        flex: 1,
        padding: SPACING.md,
        fontSize: FONTS.sizes.md,
        color: colors.text,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.full,
        backgroundColor: colors.backgroundCard,
        borderWidth: 1,
        borderColor: colors.border,
        gap: SPACING.xs,
    },
    filterChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    filterText: {
        fontSize: FONTS.sizes.sm,
        color: colors.textSecondary,
    },
    filterTextActive: {
        color: colors.white,
        fontWeight: '600',
    },
    listContent: {
        padding: SPACING.lg,
        paddingBottom: 100,
    },
    clientCard: {
        backgroundColor: colors.backgroundCard,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        ...SHADOWS.sm,
    },
    clientHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    clientAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    clientAvatarText: {
        fontSize: FONTS.sizes.lg,
        fontWeight: '700',
    },
    clientInfo: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    clientName: {
        fontSize: FONTS.sizes.md,
        fontWeight: '600',
        color: colors.text,
    },
    clientCompany: {
        fontSize: FONTS.sizes.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.full,
        gap: SPACING.xs,
    },
    statusText: {
        fontSize: FONTS.sizes.xs,
        fontWeight: '600',
    },
    clientDetails: {
        marginBottom: SPACING.md,
        gap: SPACING.xs,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    detailText: {
        fontSize: FONTS.sizes.sm,
        color: colors.textSecondary,
    },
    clientFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    footerText: {
        fontSize: FONTS.sizes.sm,
        color: colors.textMuted,
    },
    dateText: {
        fontSize: FONTS.sizes.xs,
        color: colors.textMuted,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xxxl * 2,
    },
    emptyTitle: {
        fontSize: FONTS.sizes.lg,
        fontWeight: '600',
        color: colors.text,
        marginTop: SPACING.lg,
        marginBottom: SPACING.sm,
    },
    emptyText: {
        fontSize: FONTS.sizes.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.md,
        gap: SPACING.sm,
    },
    emptyButtonText: {
        color: colors.white,
        fontSize: FONTS.sizes.md,
        fontWeight: '600',
    },
    fab: {
        position: 'absolute',
        bottom: SPACING.xl,
        right: SPACING.xl,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.lg,
    },
});

export default ClientScreen;
