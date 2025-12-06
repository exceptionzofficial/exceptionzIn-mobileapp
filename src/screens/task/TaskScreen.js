import React, { useState } from 'react';
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
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';

const STATUS_CONFIG = {
    todo: { label: 'To Do', color: COLORS.info, icon: 'checkbox-blank-circle-outline' },
    in_progress: { label: 'In Progress', color: COLORS.warning, icon: 'progress-clock' },
    done: { label: 'Done', color: COLORS.success, icon: 'check-circle' },
};

const PRIORITY_CONFIG = {
    high: { label: 'High', color: COLORS.error, icon: 'arrow-up-bold' },
    medium: { label: 'Medium', color: COLORS.warning, icon: 'minus' },
    low: { label: 'Low', color: COLORS.success, icon: 'arrow-down-bold' },
};

const TaskScreen = () => {
    const navigation = useNavigation();
    const { tasks, getProjectById } = useData();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showMyTasks, setShowMyTasks] = useState(false);

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || task.status === filterStatus;
        const matchesMy = !showMyTasks || task.assignedTo === user?.id;
        return matchesSearch && matchesFilter && matchesMy;
    }).sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const isOverdue = (dueDate) => {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date();
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const renderStatusFilter = () => (
        <View style={styles.filterRow}>
            <TouchableOpacity
                style={[styles.filterChip, filterStatus === 'all' && styles.filterChipActive]}
                onPress={() => setFilterStatus('all')}
            >
                <Text style={[styles.filterText, filterStatus === 'all' && styles.filterTextActive]}>
                    All ({tasks.length})
                </Text>
            </TouchableOpacity>
            {Object.entries(STATUS_CONFIG).map(([key, value]) => (
                <TouchableOpacity
                    key={key}
                    style={[styles.filterChip, filterStatus === key && styles.filterChipActive]}
                    onPress={() => setFilterStatus(key)}
                >
                    <Icon name={value.icon} size={14} color={filterStatus === key ? COLORS.white : value.color} />
                    <Text style={[styles.filterText, filterStatus === key && styles.filterTextActive]}>
                        {tasks.filter(t => t.status === key).length}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderTask = ({ item }) => {
        const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.todo;
        const priorityConfig = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.medium;
        const project = item.projectId ? getProjectById(item.projectId) : null;
        const overdue = item.status !== 'done' && isOverdue(item.dueDate);

        return (
            <TouchableOpacity
                style={[styles.taskCard, overdue && styles.taskCardOverdue]}
                onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
            >
                <View style={styles.taskHeader}>
                    <View style={[styles.priorityIndicator, { backgroundColor: priorityConfig.color }]} />
                    <View style={styles.taskInfo}>
                        <Text style={styles.taskTitle}>{item.title}</Text>
                        {project && (
                            <View style={styles.projectRow}>
                                <Icon name="folder-outline" size={12} color={COLORS.textMuted} />
                                <Text style={styles.projectName}>{project.name}</Text>
                            </View>
                        )}
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '15' }]}>
                        <Icon name={statusConfig.icon} size={12} color={statusConfig.color} />
                        <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
                    </View>
                </View>

                {item.description && (
                    <Text style={styles.taskDescription} numberOfLines={2}>{item.description}</Text>
                )}

                <View style={styles.taskFooter}>
                    <View style={styles.footerLeft}>
                        <View style={[styles.priorityBadge, { backgroundColor: priorityConfig.color + '15' }]}>
                            <Icon name={priorityConfig.icon} size={10} color={priorityConfig.color} />
                            <Text style={[styles.priorityText, { color: priorityConfig.color }]}>{priorityConfig.label}</Text>
                        </View>
                        {item.assignedToName && (
                            <View style={styles.assigneeRow}>
                                <Icon name="account-outline" size={12} color={COLORS.textMuted} />
                                <Text style={styles.assigneeName}>{item.assignedToName}</Text>
                            </View>
                        )}
                    </View>
                    {item.dueDate && (
                        <View style={[styles.dueDate, overdue && styles.dueDateOverdue]}>
                            <Icon name={overdue ? 'alert-outline' : 'calendar-outline'} size={12} color={overdue ? COLORS.error : COLORS.textMuted} />
                            <Text style={[styles.dueDateText, overdue && styles.dueDateTextOverdue]}>
                                {formatDate(item.dueDate)}
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Icon name="checkbox-marked-circle-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Tasks Yet</Text>
            <Text style={styles.emptyText}>Create your first task to get started</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate('AddTask')}>
                <Icon name="plus" size={18} color={COLORS.white} />
                <Text style={styles.emptyButtonText}>Create Task</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.headerTitle}>Tasks</Text>
                        <Text style={styles.headerSubtitle}>{tasks.length} total tasks</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.myTasksToggle, showMyTasks && styles.myTasksToggleActive]}
                        onPress={() => setShowMyTasks(!showMyTasks)}
                    >
                        <Icon name="account-check-outline" size={18} color={showMyTasks ? COLORS.white : COLORS.primary} />
                        <Text style={[styles.myTasksText, showMyTasks && styles.myTasksTextActive]}>My Tasks</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Icon name="magnify" size={20} color={COLORS.textMuted} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search tasks..."
                    placeholderTextColor={COLORS.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Icon name="close-circle" size={18} color={COLORS.textMuted} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Filter */}
            {renderStatusFilter()}

            {/* Task List */}
            <FlatList
                data={filteredTasks}
                renderItem={renderTask}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmpty}
            />

            {/* FAB */}
            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddTask')}>
                <Icon name="plus" size={24} color={COLORS.white} />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, paddingBottom: SPACING.md },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { fontSize: FONTS.sizes.xxl, fontWeight: '700', color: COLORS.text },
    headerSubtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: SPACING.xs },
    myTasksToggle: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
        borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.primary, gap: SPACING.xs,
    },
    myTasksToggleActive: { backgroundColor: COLORS.primary },
    myTasksText: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '500' },
    myTasksTextActive: { color: COLORS.white },
    searchContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
        marginHorizontal: SPACING.lg, marginBottom: SPACING.md, paddingHorizontal: SPACING.md,
        borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border,
    },
    searchInput: { flex: 1, padding: SPACING.md, fontSize: FONTS.sizes.md, color: COLORS.text },
    filterRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, marginBottom: SPACING.md, flexWrap: 'wrap', gap: SPACING.sm },
    filterChip: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
        borderRadius: RADIUS.full, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.xs,
    },
    filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    filterText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
    filterTextActive: { color: COLORS.white, fontWeight: '600' },
    listContent: { padding: SPACING.lg, paddingBottom: 100 },
    taskCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOWS.sm },
    taskCardOverdue: { borderLeftWidth: 3, borderLeftColor: COLORS.error },
    taskHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm },
    priorityIndicator: { width: 4, height: 24, borderRadius: 2, marginRight: SPACING.sm },
    taskInfo: { flex: 1, marginRight: SPACING.sm },
    taskTitle: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
    projectRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: 2 },
    projectName: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, gap: SPACING.xs },
    statusText: { fontSize: FONTS.sizes.xs, fontWeight: '600' },
    taskDescription: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 18, marginBottom: SPACING.md },
    taskFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border },
    footerLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
    priorityBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.sm, gap: 2 },
    priorityText: { fontSize: FONTS.sizes.xs, fontWeight: '600' },
    assigneeRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
    assigneeName: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
    dueDate: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
    dueDateOverdue: {},
    dueDateText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
    dueDateTextOverdue: { color: COLORS.error, fontWeight: '600' },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.xxxl * 2 },
    emptyTitle: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: COLORS.text, marginTop: SPACING.lg, marginBottom: SPACING.sm },
    emptyText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.xl },
    emptyButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.md, gap: SPACING.sm },
    emptyButtonText: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '600' },
    fab: { position: 'absolute', bottom: SPACING.xl, right: SPACING.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', ...SHADOWS.lg },
});

export default TaskScreen;
