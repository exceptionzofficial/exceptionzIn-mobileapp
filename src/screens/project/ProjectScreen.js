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

const ProjectScreen = () => {
    const navigation = useNavigation();
    const { projects, getClientById } = useData();
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => getStyles(colors), [colors]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const STATUS_CONFIG = {
        planning: { label: 'Planning', color: colors.info, icon: 'clipboard-text-outline' },
        in_progress: { label: 'In Progress', color: colors.warning, icon: 'progress-clock' },
        review: { label: 'Review', color: '#7C3AED', icon: 'file-search-outline' },
        completed: { label: 'Completed', color: colors.success, icon: 'check-circle-outline' },
    };

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
        return matchesSearch && matchesFilter;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const getProjectProgress = (project) => {
        if (!project.modules || project.modules.length === 0) return 0;
        const completed = project.modules.filter(m => m.status === 'completed').length;
        return Math.round((completed / project.modules.length) * 100);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
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
                    All ({projects.length})
                </Text>
            </TouchableOpacity>
            {Object.entries(STATUS_CONFIG).map(([key, value]) => (
                <TouchableOpacity
                    key={key}
                    style={[styles.filterChip, filterStatus === key && styles.filterChipActive]}
                    onPress={() => setFilterStatus(key)}
                >
                    <Icon name={value.icon} size={14} color={filterStatus === key ? colors.white : value.color} />
                    <Text style={[styles.filterText, filterStatus === key && styles.filterTextActive]}>
                        {projects.filter(p => p.status === key).length}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderProject = ({ item }) => {
        const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.planning;
        const client = item.clientId ? getClientById(item.clientId) : null;
        const progress = getProjectProgress(item);

        return (
            <TouchableOpacity
                style={styles.projectCard}
                onPress={() => navigation.navigate('ProjectDetail', { projectId: item.id })}
            >
                <View style={styles.projectHeader}>
                    <View style={styles.projectInfo}>
                        <Text style={styles.projectName}>{item.name}</Text>
                        {client && (
                            <View style={styles.clientRow}>
                                <Icon name="account-outline" size={14} color={colors.textMuted} />
                                <Text style={styles.clientName}>{client.name}</Text>
                            </View>
                        )}
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '15' }]}>
                        <Icon name={statusConfig.icon} size={12} color={statusConfig.color} />
                        <Text style={[styles.statusText, { color: statusConfig.color }]}>
                            {statusConfig.label}
                        </Text>
                    </View>
                </View>

                {item.description && (
                    <Text style={styles.projectDescription} numberOfLines={2}>
                        {item.description}
                    </Text>
                )}

                {/* Progress Bar */}
                <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>Progress</Text>
                        <Text style={styles.progressValue}>{progress}%</Text>
                    </View>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                </View>

                <View style={styles.projectFooter}>
                    <View style={styles.footerItem}>
                        <Icon name="puzzle-outline" size={14} color={colors.textMuted} />
                        <Text style={styles.footerText}>{item.modules?.length || 0} modules</Text>
                    </View>
                    {item.dueDate && (
                        <View style={styles.footerItem}>
                            <Icon name="calendar-outline" size={14} color={colors.textMuted} />
                            <Text style={styles.footerText}>Due {formatDate(item.dueDate)}</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Icon name="folder-open-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Projects Yet</Text>
            <Text style={styles.emptyText}>Create your first project to get started</Text>
            <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('AddProject')}
            >
                <Icon name="plus" size={18} color={colors.white} />
                <Text style={styles.emptyButtonText}>Create Project</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Projects</Text>
                <Text style={styles.headerSubtitle}>{projects.length} total projects</Text>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Icon name="magnify" size={20} color={colors.textMuted} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search projects..."
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

            {/* Project List */}
            <FlatList
                data={filteredProjects}
                renderItem={renderProject}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmpty}
            />

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddProject')}
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
    projectCard: {
        backgroundColor: colors.backgroundCard,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        ...SHADOWS.sm,
    },
    projectHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.sm,
    },
    projectInfo: {
        flex: 1,
        marginRight: SPACING.sm,
    },
    projectName: {
        fontSize: FONTS.sizes.lg,
        fontWeight: '600',
        color: colors.text,
    },
    clientRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.xs,
        gap: SPACING.xs,
    },
    clientName: {
        fontSize: FONTS.sizes.sm,
        color: colors.textSecondary,
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
    projectDescription: {
        fontSize: FONTS.sizes.sm,
        color: colors.textSecondary,
        marginBottom: SPACING.md,
        lineHeight: 18,
    },
    progressSection: {
        marginBottom: SPACING.md,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.xs,
    },
    progressLabel: {
        fontSize: FONTS.sizes.sm,
        color: colors.textMuted,
    },
    progressValue: {
        fontSize: FONTS.sizes.sm,
        fontWeight: '600',
        color: colors.primary,
    },
    progressBar: {
        height: 6,
        backgroundColor: colors.backgroundLight,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 3,
    },
    projectFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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

export default ProjectScreen;
