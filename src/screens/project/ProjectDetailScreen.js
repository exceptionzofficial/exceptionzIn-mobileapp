import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';

const STATUS_CONFIG = {
    planning: { label: 'Planning', color: COLORS.info, icon: 'clipboard-text-outline' },
    in_progress: { label: 'In Progress', color: COLORS.warning, icon: 'progress-clock' },
    review: { label: 'Review', color: COLORS.newLead, icon: 'file-search-outline' },
    completed: { label: 'Completed', color: COLORS.success, icon: 'check-circle-outline' },
};

const MODULE_STATUS = {
    pending: { label: 'Pending', color: COLORS.textMuted, icon: 'clock-outline' },
    in_progress: { label: 'In Progress', color: COLORS.warning, icon: 'progress-clock' },
    completed: { label: 'Completed', color: COLORS.success, icon: 'check-circle' },
};

const ProjectDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { projectId } = route.params;
    const { getProjectById, updateProject, updateProjectModule, addProjectModule, deleteProject, getClientById } = useData();
    const { isAdmin, getActiveUsers } = useAuth();

    const project = getProjectById(projectId);
    const teamMembers = getActiveUsers();

    const [showStatusPicker, setShowStatusPicker] = useState(false);
    const [newModule, setNewModule] = useState({ name: '', assignedTo: null, assignedToName: null });
    const [showAssigneePicker, setShowAssigneePicker] = useState(false);

    if (!project) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Icon name="folder-alert-outline" size={48} color={COLORS.error} />
                    <Text style={styles.errorText}>Project not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.planning;
    const client = project.clientId ? getClientById(project.clientId) : null;

    const getProgress = () => {
        if (!project.modules || project.modules.length === 0) return 0;
        const completed = project.modules.filter(m => m.status === 'completed').length;
        return Math.round((completed / project.modules.length) * 100);
    };

    const handleStatusChange = async (newStatus) => {
        await updateProject(projectId, { status: newStatus });
        setShowStatusPicker(false);
    };

    const handleModuleStatusChange = async (moduleId, newStatus) => {
        await updateProjectModule(projectId, moduleId, { status: newStatus });
    };

    const handleAddModule = async () => {
        if (!newModule.name.trim()) {
            Alert.alert('Error', 'Please enter module name');
            return;
        }
        await addProjectModule(projectId, newModule);
        setNewModule({ name: '', assignedTo: null, assignedToName: null });
    };

    const handleDelete = () => {
        Alert.alert('Delete Project', 'Are you sure? This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive',
                onPress: async () => {
                    const result = await deleteProject(projectId);
                    if (result.success) navigation.goBack();
                },
            },
        ]);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Project Details</Text>
                {isAdmin && (
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                        <Icon name="trash-can-outline" size={22} color={COLORS.error} />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Project Info */}
                <View style={styles.infoCard}>
                    <Text style={styles.projectName}>{project.name}</Text>
                    {client && (
                        <View style={styles.clientRow}>
                            <Icon name="account-outline" size={16} color={COLORS.textMuted} />
                            <Text style={styles.clientName}>{client.name}</Text>
                        </View>
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
                                    style={[styles.statusOption, project.status === key && styles.statusOptionActive]}
                                    onPress={() => handleStatusChange(key)}
                                >
                                    <Icon name={value.icon} size={16} color={value.color} />
                                    <Text style={styles.statusOptionText}>{value.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Progress */}
                    <View style={styles.progressSection}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>Overall Progress</Text>
                            <Text style={styles.progressValue}>{getProgress()}%</Text>
                        </View>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${getProgress()}%` }]} />
                        </View>
                    </View>

                    {/* Dates */}
                    <View style={styles.datesSection}>
                        <View style={styles.dateItem}>
                            <Icon name="calendar-start" size={16} color={COLORS.textMuted} />
                            <Text style={styles.dateLabel}>Start:</Text>
                            <Text style={styles.dateValue}>{formatDate(project.startDate || project.createdAt)}</Text>
                        </View>
                        <View style={styles.dateItem}>
                            <Icon name="calendar-end" size={16} color={COLORS.textMuted} />
                            <Text style={styles.dateLabel}>Due:</Text>
                            <Text style={styles.dateValue}>{formatDate(project.dueDate)}</Text>
                        </View>
                    </View>

                    {project.description && <Text style={styles.description}>{project.description}</Text>}
                </View>

                {/* Modules */}
                <View style={styles.modulesSection}>
                    <Text style={styles.sectionTitle}>
                        <Icon name="puzzle-outline" size={18} color={COLORS.text} /> Modules ({project.modules?.length || 0})
                    </Text>

                    {project.modules?.map((module) => {
                        const modStatus = MODULE_STATUS[module.status] || MODULE_STATUS.pending;
                        return (
                            <View key={module.id} style={styles.moduleCard}>
                                <View style={styles.moduleHeader}>
                                    <Icon name="puzzle-outline" size={18} color={COLORS.primary} />
                                    <View style={styles.moduleInfo}>
                                        <Text style={styles.moduleName}>{module.name}</Text>
                                        {module.assignedToName && (
                                            <Text style={styles.moduleAssignee}>{module.assignedToName}</Text>
                                        )}
                                    </View>
                                </View>
                                <View style={styles.moduleActions}>
                                    {Object.entries(MODULE_STATUS).map(([key, value]) => (
                                        <TouchableOpacity
                                            key={key}
                                            style={[styles.moduleStatusBtn, module.status === key && { backgroundColor: value.color + '20' }]}
                                            onPress={() => handleModuleStatusChange(module.id, key)}
                                        >
                                            <Icon name={value.icon} size={14} color={value.color} />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        );
                    })}

                    {/* Add Module */}
                    <View style={styles.addModuleSection}>
                        <View style={styles.inputContainer}>
                            <Icon name="plus" size={20} color={COLORS.textMuted} />
                            <TextInput
                                style={styles.input}
                                placeholder="New module name"
                                placeholderTextColor={COLORS.textMuted}
                                value={newModule.name}
                                onChangeText={(value) => setNewModule(prev => ({ ...prev, name: value }))}
                            />
                        </View>
                        <TouchableOpacity
                            style={styles.selectButton}
                            onPress={() => setShowAssigneePicker(!showAssigneePicker)}
                        >
                            <Text style={[styles.selectText, !newModule.assignedToName && styles.placeholder]}>
                                {newModule.assignedToName || 'Assign...'}
                            </Text>
                            <Icon name="chevron-down" size={16} color={COLORS.textMuted} />
                        </TouchableOpacity>
                        {showAssigneePicker && (
                            <View style={styles.pickerList}>
                                <TouchableOpacity
                                    style={styles.pickerItem}
                                    onPress={() => { setNewModule(prev => ({ ...prev, assignedTo: null, assignedToName: null })); setShowAssigneePicker(false); }}
                                >
                                    <Text style={styles.pickerItemText}>Unassigned</Text>
                                </TouchableOpacity>
                                {teamMembers.map(m => (
                                    <TouchableOpacity
                                        key={m.id}
                                        style={styles.pickerItem}
                                        onPress={() => { setNewModule(prev => ({ ...prev, assignedTo: m.id, assignedToName: m.name })); setShowAssigneePicker(false); }}
                                    >
                                        <Text style={styles.pickerItemText}>{m.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                        <TouchableOpacity style={styles.addModuleButton} onPress={handleAddModule}>
                            <Icon name="plus" size={18} color={COLORS.white} />
                            <Text style={styles.addModuleText}>Add Module</Text>
                        </TouchableOpacity>
                    </View>
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
    projectName: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
    clientRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.md },
    clientName: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
    statusSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.md, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.border },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, gap: SPACING.xs },
    statusText: { fontSize: FONTS.sizes.sm, fontWeight: '600' },
    changeStatus: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
    changeText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted },
    statusPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, paddingVertical: SPACING.md, borderBottomWidth: 1, borderColor: COLORS.border },
    statusOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundLight, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, gap: SPACING.xs },
    statusOptionActive: { backgroundColor: COLORS.primary + '20' },
    statusOptionText: { fontSize: FONTS.sizes.sm, color: COLORS.text },
    progressSection: { paddingVertical: SPACING.md },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
    progressLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted },
    progressValue: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.primary },
    progressBar: { height: 8, backgroundColor: COLORS.backgroundLight, borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
    datesSection: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.md, borderTopWidth: 1, borderColor: COLORS.border },
    dateItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
    dateLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted },
    dateValue: { fontSize: FONTS.sizes.sm, color: COLORS.text },
    description: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, lineHeight: 20, paddingTop: SPACING.md, borderTopWidth: 1, borderColor: COLORS.border },
    modulesSection: { marginBottom: SPACING.xxxl },
    sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.md },
    moduleCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOWS.sm },
    moduleHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
    moduleInfo: { flex: 1, marginLeft: SPACING.sm },
    moduleName: { fontSize: FONTS.sizes.md, color: COLORS.text, fontWeight: '500' },
    moduleAssignee: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted },
    moduleActions: { flexDirection: 'row', gap: SPACING.sm },
    moduleStatusBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.backgroundLight, alignItems: 'center', justifyContent: 'center' },
    addModuleSection: { gap: SPACING.sm },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
    input: { flex: 1, padding: SPACING.md, fontSize: FONTS.sizes.md, color: COLORS.text },
    selectButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
    selectText: { fontSize: FONTS.sizes.md, color: COLORS.text },
    placeholder: { color: COLORS.textMuted },
    pickerList: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
    pickerItem: { padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    pickerItemText: { fontSize: FONTS.sizes.md, color: COLORS.text },
    addModuleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.md, padding: SPACING.md, gap: SPACING.sm },
    addModuleText: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '600' },
});

export default ProjectDetailScreen;
