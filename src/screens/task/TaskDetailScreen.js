import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';

const TaskDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { taskId } = route.params;
    const { getTaskById, updateTask, addTaskComment, deleteTask, getProjectById } = useData();
    const { isAdmin, user } = useAuth();
    const { colors } = useTheme();
    const styles = useMemo(() => getStyles(colors), [colors]);

    const task = getTaskById(taskId);
    const project = task?.projectId ? getProjectById(task.projectId) : null;
    const [newComment, setNewComment] = useState('');
    const [showStatusPicker, setShowStatusPicker] = useState(false);

    const STATUS_CONFIG = {
        pending: { label: 'Pending', color: colors.textMuted, icon: 'clock-outline' },
        in_progress: { label: 'In Progress', color: colors.warning, icon: 'progress-clock' },
        completed: { label: 'Completed', color: colors.success, icon: 'check-circle' },
    };

    const PRIORITY_CONFIG = {
        low: { label: 'Low', color: colors.success },
        medium: { label: 'Medium', color: colors.warning },
        high: { label: 'High', color: colors.error },
    };

    if (!task) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Icon name="alert-circle-outline" size={48} color={colors.error} />
                    <Text style={styles.errorText}>Task not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
    const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

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
        Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive',
                onPress: async () => {
                    const result = await deleteTask(taskId);
                    if (result.success) navigation.goBack();
                    else Alert.alert('Error', result.error);
                },
            },
        ]);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        const date = new Date(dateString);
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const renderComment = ({ item }) => (
        <View style={styles.commentCard}>
            <View style={styles.commentHeader}>
                <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>{(item.createdByName || 'U').charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.commentInfo}>
                    <Text style={styles.commentAuthor}>{item.createdByName || 'Unknown'}</Text>
                    <Text style={styles.commentDate}>{formatDate(item.createdAt)}</Text>
                </View>
            </View>
            <Text style={styles.commentText}>{item.text}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Task Details</Text>
                {isAdmin && (
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                        <Icon name="trash-can-outline" size={22} color={colors.error} />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={[styles.taskCard, isOverdue && styles.taskCardOverdue]}>
                    <Text style={styles.taskTitle}>{task.title}</Text>

                    {project && (
                        <TouchableOpacity style={styles.projectLink} onPress={() => navigation.navigate('ProjectDetail', { projectId: project.id })}>
                            <Icon name="folder-outline" size={16} color={colors.primary} />
                            <Text style={styles.projectLinkText}>{project.name}</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.statusSection} onPress={() => setShowStatusPicker(!showStatusPicker)}>
                        <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '15' }]}>
                            <Icon name={statusConfig.icon} size={16} color={statusConfig.color} />
                            <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
                        </View>
                        <Icon name="chevron-down" size={20} color={colors.textMuted} />
                    </TouchableOpacity>

                    {showStatusPicker && (
                        <View style={styles.statusPicker}>
                            {Object.entries(STATUS_CONFIG).map(([key, value]) => (
                                <TouchableOpacity
                                    key={key}
                                    style={[styles.statusOption, task.status === key && styles.statusOptionActive]}
                                    onPress={() => handleStatusChange(key)}
                                >
                                    <Icon name={value.icon} size={16} color={value.color} />
                                    <Text style={styles.statusOptionText}>{value.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    <View style={styles.detailsGrid}>
                        <View style={styles.detailRow}>
                            <Icon name="account-outline" size={18} color={colors.textMuted} />
                            <Text style={styles.detailLabel}>Assigned to:</Text>
                            <Text style={styles.detailValue}>{task.assignedToName || 'Unassigned'}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Icon name="calendar-outline" size={18} color={isOverdue ? colors.error : colors.textMuted} />
                            <Text style={styles.detailLabel}>Due date:</Text>
                            <Text style={[styles.detailValue, isOverdue && { color: colors.error }]}>{formatDate(task.dueDate)}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Icon name="flag" size={18} color={priorityConfig.color} />
                            <Text style={styles.detailLabel}>Priority:</Text>
                            <View style={[styles.priorityBadge, { backgroundColor: priorityConfig.color + '15' }]}>
                                <Text style={[styles.priorityText, { color: priorityConfig.color }]}>{priorityConfig.label}</Text>
                            </View>
                        </View>
                    </View>

                    {task.description && (
                        <View style={styles.descriptionSection}>
                            <Text style={styles.descriptionTitle}>Description</Text>
                            <Text style={styles.descriptionText}>{task.description}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.commentsSection}>
                    <Text style={styles.sectionTitle}>
                        <Icon name="comment-text-outline" size={18} color={colors.text} /> Comments ({task.comments?.length || 0})
                    </Text>
                    <View style={styles.addCommentContainer}>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Add a comment..."
                            placeholderTextColor={colors.textMuted}
                            value={newComment}
                            onChangeText={setNewComment}
                            multiline
                        />
                        <TouchableOpacity
                            style={[styles.addCommentButton, !newComment.trim() && styles.addCommentButtonDisabled]}
                            onPress={handleAddComment}
                            disabled={!newComment.trim()}
                        >
                            <Icon name="send" size={18} color={colors.white} />
                        </TouchableOpacity>
                    </View>
                    {task.comments && task.comments.length > 0 ? (
                        <FlatList data={[...task.comments].reverse()} renderItem={renderComment} keyExtractor={(item) => item.id} scrollEnabled={false} />
                    ) : (
                        <View style={styles.emptyComments}>
                            <Icon name="comment-outline" size={32} color={colors.textMuted} />
                            <Text style={styles.emptyCommentsText}>No comments yet</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
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
    taskCard: { backgroundColor: colors.backgroundCard, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.lg, ...SHADOWS.sm },
    taskCardOverdue: { borderLeftWidth: 4, borderLeftColor: colors.error },
    taskTitle: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: colors.text, marginBottom: SPACING.md },
    projectLink: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.md },
    projectLinkText: { fontSize: FONTS.sizes.sm, color: colors.primary },
    statusSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.md, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, gap: SPACING.xs },
    statusText: { fontSize: FONTS.sizes.sm, fontWeight: '600' },
    statusPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, paddingVertical: SPACING.md, borderBottomWidth: 1, borderColor: colors.border },
    statusOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.backgroundLight, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, gap: SPACING.xs },
    statusOptionActive: { backgroundColor: colors.primary + '20' },
    statusOptionText: { fontSize: FONTS.sizes.sm, color: colors.text },
    detailsGrid: { paddingTop: SPACING.md, gap: SPACING.sm },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
    detailLabel: { fontSize: FONTS.sizes.sm, color: colors.textMuted, flex: 1 },
    detailValue: { fontSize: FONTS.sizes.sm, color: colors.text, fontWeight: '500' },
    priorityBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.sm },
    priorityText: { fontSize: FONTS.sizes.xs, fontWeight: '600' },
    descriptionSection: { marginTop: SPACING.lg, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: colors.border },
    descriptionTitle: { fontSize: FONTS.sizes.md, fontWeight: '600', color: colors.text, marginBottom: SPACING.sm },
    descriptionText: { fontSize: FONTS.sizes.md, color: colors.textSecondary, lineHeight: 22 },
    commentsSection: { marginBottom: SPACING.xxxl },
    sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: colors.text, marginBottom: SPACING.md },
    addCommentContainer: { flexDirection: 'row', marginBottom: SPACING.md, gap: SPACING.sm },
    commentInput: { flex: 1, backgroundColor: colors.backgroundCard, borderRadius: RADIUS.md, padding: SPACING.md, fontSize: FONTS.sizes.md, color: colors.text, borderWidth: 1, borderColor: colors.border, minHeight: 48 },
    addCommentButton: { width: 48, height: 48, borderRadius: RADIUS.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    addCommentButtonDisabled: { backgroundColor: colors.textMuted },
    commentCard: { backgroundColor: colors.backgroundCard, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: colors.border },
    commentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
    commentAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary + '20', alignItems: 'center', justifyContent: 'center' },
    commentAvatarText: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: colors.primary },
    commentInfo: { flex: 1, marginLeft: SPACING.sm },
    commentAuthor: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: colors.text },
    commentDate: { fontSize: FONTS.sizes.xs, color: colors.textMuted },
    commentText: { fontSize: FONTS.sizes.md, color: colors.text, lineHeight: 20 },
    emptyComments: { alignItems: 'center', paddingVertical: SPACING.xl },
    emptyCommentsText: { fontSize: FONTS.sizes.sm, color: colors.textMuted, marginTop: SPACING.sm },
});

export default TaskDetailScreen;
