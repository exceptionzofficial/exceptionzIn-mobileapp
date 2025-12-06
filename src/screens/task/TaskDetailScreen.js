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
    todo: { label: 'To Do', color: COLORS.info, icon: 'checkbox-blank-circle-outline' },
    in_progress: { label: 'In Progress', color: COLORS.warning, icon: 'progress-clock' },
    done: { label: 'Done', color: COLORS.success, icon: 'check-circle' },
};

const PRIORITY_CONFIG = {
    high: { label: 'High', color: COLORS.error, icon: 'arrow-up-bold' },
    medium: { label: 'Medium', color: COLORS.warning, icon: 'minus' },
    low: { label: 'Low', color: COLORS.success, icon: 'arrow-down-bold' },
};

const TaskDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { taskId } = route.params;
    const { getTaskById, updateTask, addTaskComment, deleteTask, getProjectById } = useData();
    const { isAdmin } = useAuth();

    const task = getTaskById(taskId);
    const [newComment, setNewComment] = useState('');
    const [showStatusPicker, setShowStatusPicker] = useState(false);

    if (!task) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Icon name="alert-circle-outline" size={48} color={COLORS.error} />
                    <Text style={styles.errorText}>Task not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
    const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
    const project = task.projectId ? getProjectById(task.projectId) : null;

    const isOverdue = task.dueDate && task.status !== 'done' && new Date(task.dueDate) < new Date();

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        const result = await addTaskComment(taskId, newComment.trim());
        if (result.success) {
            setNewComment('');
        } else {
            Alert.alert('Error', result.error);
        }
    };

    const handleStatusChange = async (newStatus) => {
        await updateTask(taskId, { status: newStatus });
        setShowStatusPicker(false);
    };

    const handleDelete = () => {
        Alert.alert('Delete Task', 'Are you sure? This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive',
                onPress: async () => {
                    const result = await deleteTask(taskId);
                    if (result.success) navigation.goBack();
                },
            },
        ]);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const renderComment = ({ item }) => (
        <View style={styles.commentCard}>
            <View style={styles.commentHeader}>
                <Icon name="account-circle-outline" size={16} color={COLORS.primary} />
                <Text style={styles.commentAuthor}>{item.createdByName || 'Unknown'}</Text>
                <Text style={styles.commentDate}>{formatDate(item.createdAt)}</Text>
            </View>
            <Text style={styles.commentText}>{item.text}</Text>
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
                <Text style={styles.headerTitle}>Task Details</Text>
                {isAdmin && (
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                        <Icon name="trash-can-outline" size={22} color={COLORS.error} />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Task Info */}
                <View style={[styles.infoCard, isOverdue && styles.infoCardOverdue]}>
                    <View style={styles.taskHeader}>
                        <View style={[styles.priorityIndicator, { backgroundColor: priorityConfig.color }]} />
                        <Text style={styles.taskTitle}>{task.title}</Text>
                    </View>

                    {project && (
                        <TouchableOpacity style={styles.projectLink}>
                            <Icon name="folder-outline" size={16} color={COLORS.primary} />
                            <Text style={styles.projectName}>{project.name}</Text>
                            <Icon name="chevron-right" size={16} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    )}

                    {/* Status */}
                    <TouchableOpacity style={styles.statusSection} onPress={() => setShowStatusPicker(!showStatusPicker)}>
                        <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '15' }]}>
                            <Icon name={statusConfig.icon} size={16} color={statusConfig.color} />
                            <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
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
                                    style={[styles.statusOption, task.status === key && styles.statusOptionActive]}
                                    onPress={() => handleStatusChange(key)}
                                    derstanding>
                                    <Icon name={value.icon} size={16} color={value.color} />
                                    <Text style={styles.statusOptionText}>{value.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Details */}
                    <View style={styles.detailsSection}>
                        <View style={styles.detailRow}>
                            <Icon name="flag-outline" size={18} color={COLORS.textMuted} />
                            <Text style={styles.detailLabel}>Priority:</Text>
                            <View style={[styles.priorityBadge, { backgroundColor: priorityConfig.color + '15' }]}>
                                <Icon name={priorityConfig.icon} size={12} color={priorityConfig.color} />
                                <Text style={[styles.priorityBadgeText, { color: priorityConfig.color }]}>{priorityConfig.label}</Text>
                            </View>
                        </View>

                        {task.assignedToName && (
                            <View style={styles.detailRow}>
                                <Icon name="account-outline" size={18} color={COLORS.textMuted} />
                                <Text style={styles.detailLabel}>Assigned to:</Text>
                                <Text style={styles.detailValue}>{task.assignedToName}</Text>
                            </View>
                        )}

                        <View style={styles.detailRow}>
                            <Icon name={isOverdue ? 'alert-outline' : 'calendar-outline'} size={18} color={isOverdue ? COLORS.error : COLORS.textMuted} />
                            <Text style={[styles.detailLabel, isOverdue && { color: COLORS.error }]}>Due:</Text>
                            <Text style={[styles.detailValue, isOverdue && { color: COLORS.error, fontWeight: '600' }]}>
                                {task.dueDate ? formatDate(task.dueDate).split(',')[0] : 'Not set'}
                            </Text>
                        </View>
                    </View>

                    {task.description && (
                        <View style={styles.descriptionSection}>
                            <Text style={styles.descriptionLabel}>Description</Text>
                            <Text style={styles.descriptionText}>{task.description}</Text>
                        </View>
                    )}
                </View>

                {/* Comments */}
                <View style={styles.commentsSection}>
                    <Text style={styles.sectionTitle}>
                        <Icon name="comment-text-outline" size={18} color={COLORS.text} /> Comments ({task.comments?.length || 0})
                    </Text>

                    <View style={styles.addCommentContainer}>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Add a comment..."
                            placeholderTextColor={COLORS.textMuted}
                            value={newComment}
                            onChangeText={setNewComment}
                            multiline
                        />
                        <TouchableOpacity
                            style={[styles.addCommentButton, !newComment.trim() && styles.addCommentButtonDisabled]}
                            onPress={handleAddComment}
                            disabled={!newComment.trim()}
                        >
                            <Icon name="send" size={18} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>

                    {task.comments && task.comments.length > 0 ? (
                        <FlatList
                            data={[...task.comments].reverse()}
                            renderItem={renderComment}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                        />
                    ) : (
                        <View style={styles.emptyComments}>
                            <Icon name="comment-outline" size={32} color={COLORS.textMuted} />
                            <Text style={styles.emptyCommentsText}>No comments yet</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
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
    deleteButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.error + '10', alignItems: 'center', justifyContent: 'center' },
    content: { flex: 1, padding: SPACING.lg },
    errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    errorText: { fontSize: FONTS.sizes.lg, color: COLORS.error, marginTop: SPACING.md },
    infoCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.lg, ...SHADOWS.sm },
    infoCardOverdue: { borderLeftWidth: 3, borderLeftColor: COLORS.error },
    taskHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
    priorityIndicator: { width: 4, height: 28, borderRadius: 2, marginRight: SPACING.md },
    taskTitle: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.text, flex: 1 },
    projectLink: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundLight, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, gap: SPACING.sm },
    projectName: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.primary, fontWeight: '500' },
    statusSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.md, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.border },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, gap: SPACING.xs },
    statusText: { fontSize: FONTS.sizes.sm, fontWeight: '600' },
    changeStatus: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
    changeText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted },
    statusPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, paddingVertical: SPACING.md, borderBottomWidth: 1, borderColor: COLORS.border },
    statusOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundLight, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, gap: SPACING.xs },
    statusOptionActive: { backgroundColor: COLORS.primary + '20' },
    statusOptionText: { fontSize: FONTS.sizes.sm, color: COLORS.text },
    detailsSection: { paddingVertical: SPACING.md, gap: SPACING.sm },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
    detailLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted },
    detailValue: { fontSize: FONTS.sizes.sm, color: COLORS.text },
    priorityBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.sm, gap: 2 },
    priorityBadgeText: { fontSize: FONTS.sizes.xs, fontWeight: '600' },
    descriptionSection: { paddingTop: SPACING.md, borderTopWidth: 1, borderColor: COLORS.border },
    descriptionLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, marginBottom: SPACING.sm },
    descriptionText: { fontSize: FONTS.sizes.md, color: COLORS.text, lineHeight: 22 },
    commentsSection: { marginBottom: SPACING.xxxl },
    sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.md },
    addCommentContainer: { flexDirection: 'row', marginBottom: SPACING.md, gap: SPACING.sm },
    commentInput: { flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.md, fontSize: FONTS.sizes.md, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, minHeight: 48 },
    addCommentButton: { width: 48, height: 48, borderRadius: RADIUS.md, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
    addCommentButtonDisabled: { backgroundColor: COLORS.textMuted },
    commentCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
    commentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm, gap: SPACING.xs },
    commentAuthor: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.primary, flex: 1 },
    commentDate: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
    commentText: { fontSize: FONTS.sizes.md, color: COLORS.text, lineHeight: 20 },
    emptyComments: { alignItems: 'center', paddingVertical: SPACING.xl },
    emptyCommentsText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, marginTop: SPACING.sm },
});

export default TaskDetailScreen;
