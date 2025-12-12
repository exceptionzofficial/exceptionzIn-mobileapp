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
    Image,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';

const TABS = ['Overview', 'Timeline', 'Financials', 'Documents'];

const ProjectDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { projectId } = route.params;
    const { getProjectById, updateProject, updateProjectModule, addProjectModule, deleteProject, getClientById, refreshProjects } = useData();
    const { isAdmin, getActiveUsers } = useAuth();
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refreshProjects();
        setRefreshing(false);
    }, [refreshProjects]);

    const project = getProjectById(projectId);
    const teamMembers = getActiveUsers();

    const STATUS_CONFIG = {
        planning: { label: 'PLANNING', color: colors.info },
        in_progress: { label: 'IN PROGRESS', color: colors.warning },
        review: { label: 'REVIEW', color: colors.primary },
        completed: { label: 'COMPLETED', color: colors.success },
        finishing: { label: 'FINISHING', color: colors.primary },
    };

    const MODULE_STATUS = {
        pending: { label: 'Pending', color: colors.textMuted },
        in_progress: { label: 'In Progress', color: colors.warning },
        completed: { label: 'Completed', color: colors.success },
    };

    const [activeTab, setActiveTab] = useState('Overview');
    const [showStatusPicker, setShowStatusPicker] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        description: '',
        totalAmount: '',
        paidAmount: '',
        dueDate: new Date(),
    });
    const [openDatePicker, setOpenDatePicker] = useState(false);
    const [newModule, setNewModule] = useState({ name: '', assignedTo: null, assignedToName: null, estimatedDays: '' });

    useEffect(() => {
        if (project) {
            setEditForm({
                description: project.description || '',
                totalAmount: project.financials?.totalAmount?.toString() || '0',
                paidAmount: project.financials?.paidAmount?.toString() || '0',
                dueDate: (project.financials?.dueDate && !isNaN(new Date(project.financials.dueDate).getTime())) ? new Date(project.financials.dueDate) : new Date(),
            });
        }
    }, [project]);

    if (!project) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Icon name="folder-alert-outline" size={48} color={colors.error} />
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

    const handleSave = async () => {
        const total = parseFloat(editForm.totalAmount) || 0;
        const paid = parseFloat(editForm.paidAmount) || 0;

        const updates = {
            description: editForm.description,
            financials: {
                totalAmount: total,
                paidAmount: paid, // Allow manual override or auto-calc? Let's assume manual
                dueAmount: total - paid,
                dueDate: editForm.dueDate,
            }
        };

        const result = await updateProject(projectId, updates);
        if (result.success) {
            setIsEditing(false);
            Alert.alert('Success', 'Project details updated successfully');
        } else {
            Alert.alert('Error', result.error);
        }
    };

    const handleAddModule = async () => {
        if (!newModule.name.trim()) {
            Alert.alert('Error', 'Please enter module name');
            return;
        }
        await addProjectModule(projectId, { ...newModule, estimatedDays: parseInt(newModule.estimatedDays) || 0 });
        setNewModule({ name: '', assignedTo: null, assignedToName: null, estimatedDays: '' });
    };

    const handleDelete = () => {
        Alert.alert('Delete Project', 'Are you sure? This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: async () => { const result = await deleteProject(projectId); if (result.success) navigation.goBack(); } },
        ]);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatCurrency = (amount) => `₹${(amount || 0).toLocaleString()}`;

    const renderOverviewTab = () => (
        <View style={styles.tabContent}>
            <View style={styles.scopeCard}>
                <View style={styles.scopeHeader}>
                    <Icon name="file-document-outline" size={20} color={colors.primary} />
                    <Text style={styles.scopeTitle}>Project Scope</Text>
                </View>
                {isEditing ? (
                    <TextInput
                        style={styles.editInputMultiline}
                        value={editForm.description}
                        onChangeText={(text) => setEditForm(prev => ({ ...prev, description: text }))}
                        multiline
                        textAlignVertical="top"
                    />
                ) : (
                    <Text style={styles.scopeText}>{project.description || 'No project scope defined yet.'}</Text>
                )}
            </View>

            <View style={styles.activityCard}>
                <View style={styles.activityHeader}>
                    <Icon name="clock-outline" size={20} color={colors.white} />
                    <Text style={styles.activityTitle}>Recent Activity</Text>
                </View>
                {project.activities && project.activities.length > 0 ? (
                    project.activities.slice(0, 3).map((activity, index) => (
                        <View key={activity.id || index} style={styles.activityItem}>
                            <View style={styles.activityDot} />
                            <View style={styles.activityInfo}>
                                <Text style={styles.activityItemTitle}>{activity.title}</Text>
                                <Text style={styles.activityDescription}>{activity.description}</Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noActivityText}>No recent activity</Text>
                )}
            </View>

            <View style={styles.modulesSection}>
                <Text style={styles.sectionTitle}><Icon name="puzzle-outline" size={18} color={colors.text} /> Modules ({project.modules?.length || 0})</Text>
                {project.modules?.map((module) => {
                    const modStatus = MODULE_STATUS[module.status] || MODULE_STATUS.pending;
                    return (
                        <View key={module.id} style={styles.moduleCard}>
                            <View style={styles.moduleHeader}>
                                <Icon name="puzzle-outline" size={18} color={colors.primary} />
                                <View style={styles.moduleInfo}>
                                    <Text style={styles.moduleName}>{module.name}</Text>
                                    {module.assignedToName && <Text style={styles.moduleAssignee}>{module.assignedToName}</Text>}
                                </View>
                            </View>
                            <View style={styles.moduleActions}>
                                {Object.entries(MODULE_STATUS).map(([key, value]) => (
                                    <TouchableOpacity key={key} style={[styles.moduleStatusBtn, module.status === key && { backgroundColor: value.color + '20' }]} onPress={() => handleModuleStatusChange(module.id, key)}>
                                        <Icon name={key === 'completed' ? 'check-circle' : key === 'in_progress' ? 'progress-clock' : 'clock-outline'} size={14} color={value.color} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    );
                })}
                <View style={styles.addModuleSection}>
                    <View style={styles.inputContainer}>
                        <TextInput style={styles.input} placeholder="New module name" placeholderTextColor={colors.textMuted} value={newModule.name} onChangeText={(value) => setNewModule(prev => ({ ...prev, name: value }))} />
                    </View>
                    <TouchableOpacity style={styles.addModuleButton} onPress={handleAddModule}>
                        <Icon name="plus" size={18} color={colors.white} />
                        <Text style={styles.addModuleText}>Add</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderTimelineTab = () => (
        <View style={styles.tabContent}>
            <View style={styles.timelineContainer}>
                {project.modules && project.modules.length > 0 ? (
                    project.modules.map((module, index) => {
                        const isLeft = index % 2 === 0;
                        const modStatus = MODULE_STATUS[module.status] || MODULE_STATUS.pending;
                        return (
                            <View key={module.id} style={styles.timelineRow}>
                                {isLeft ? (
                                    <>
                                        <View style={styles.timelineCardLeft}>
                                            <Text style={styles.timelineModuleName}>{module.name}</Text>
                                            <Text style={styles.timelineDate}>{formatDate(module.createdAt)}</Text>
                                            <View style={[styles.timelineStatus, { backgroundColor: modStatus.color + '15' }]}>
                                                <Text style={[styles.timelineStatusText, { color: modStatus.color }]}>{modStatus.label}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.timelineCenter}>
                                            <View style={[styles.timelineDot, { backgroundColor: modStatus.color }]}>
                                                <Icon name={module.status === 'completed' ? 'check' : 'clock-outline'} size={14} color={colors.white} />
                                            </View>
                                            {index < project.modules.length - 1 && <View style={styles.timelineLine} />}
                                        </View>
                                        <View style={styles.timelineCardRight} />
                                    </>
                                ) : (
                                    <>
                                        <View style={styles.timelineCardLeft} />
                                        <View style={styles.timelineCenter}>
                                            <View style={[styles.timelineDot, { backgroundColor: modStatus.color }]}>
                                                <Icon name={module.status === 'completed' ? 'check' : 'clock-outline'} size={14} color={colors.white} />
                                            </View>
                                            {index < project.modules.length - 1 && <View style={styles.timelineLine} />}
                                        </View>
                                        <View style={styles.timelineCardRight}>
                                            <Text style={styles.timelineModuleName}>{module.name}</Text>
                                            <Text style={styles.timelineDate}>{formatDate(module.createdAt)}</Text>
                                            <View style={[styles.timelineStatus, { backgroundColor: modStatus.color + '15' }]}>
                                                <Text style={[styles.timelineStatusText, { color: modStatus.color }]}>{modStatus.label}</Text>
                                            </View>
                                        </View>
                                    </>
                                )}
                            </View>
                        );
                    })
                ) : (
                    <View style={styles.emptyState}>
                        <Icon name="timeline-clock-outline" size={48} color={colors.textMuted} />
                        <Text style={styles.emptyStateText}>No modules in timeline</Text>
                    </View>
                )}
            </View>
        </View>
    );

    const renderFinancialsTab = () => {
        const financials = project.financials || { totalAmount: 0, paidAmount: 0, dueAmount: 0, dueDate: null };
        const dueAmount = financials.totalAmount - financials.paidAmount;
        const paidPercentage = financials.totalAmount > 0 ? Math.round((financials.paidAmount / financials.totalAmount) * 100) : 0;
        return (
            <View style={styles.tabContent}>
                <View style={styles.financialCards}>
                    <View style={[styles.financialCard, { backgroundColor: colors.primary + '10' }]}>
                        <Icon name="cash" size={24} color={colors.primary} />
                        <Text style={styles.financialLabel}>Total Amount</Text>
                        {isEditing ? (
                            <TextInput
                                style={[styles.editInput, { color: colors.primary }]}
                                value={editForm.totalAmount}
                                onChangeText={(text) => setEditForm(prev => ({ ...prev, totalAmount: text }))}
                                keyboardType="numeric"
                            />
                        ) : (
                            <Text style={[styles.financialValue, { color: colors.primary }]}>{formatCurrency(financials.totalAmount)}</Text>
                        )}
                    </View>
                    <View style={[styles.financialCard, { backgroundColor: colors.success + '10' }]}>
                        <Icon name="check-circle" size={24} color={colors.success} />
                        <Text style={styles.financialLabel}>Paid Amount</Text>
                        {isEditing ? (
                            <TextInput
                                style={[styles.editInput, { color: colors.success }]}
                                value={editForm.paidAmount}
                                onChangeText={(text) => setEditForm(prev => ({ ...prev, paidAmount: text }))}
                                keyboardType="numeric"
                            />
                        ) : (
                            <Text style={[styles.financialValue, { color: colors.success }]}>{formatCurrency(financials.paidAmount)}</Text>
                        )}
                    </View>
                </View>
                <View style={styles.financialCards}>
                    <View style={[styles.financialCard, { backgroundColor: colors.error + '10' }]}>
                        <Icon name="clock-alert" size={24} color={colors.error} />
                        <Text style={styles.financialLabel}>Due Amount</Text>
                        <Text style={[styles.financialValue, { color: colors.error }]}>{formatCurrency(dueAmount)}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.financialCard, { backgroundColor: colors.warning + '10' }]}
                        onPress={() => isEditing && setOpenDatePicker(true)}
                        disabled={!isEditing}
                    >
                        <Icon name="calendar-clock" size={24} color={colors.warning} />
                        <Text style={styles.financialLabel}>Due Date</Text>
                        {isEditing ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                <Text style={[styles.financialValue, { color: colors.warning }]}>{editForm.dueDate?.toLocaleDateString()}</Text>
                                <Icon name="pencil" size={14} color={colors.warning} />
                            </View>
                        ) : (
                            <Text style={[styles.financialValue, { color: colors.warning }]}>{formatDate(financials.dueDate)}</Text>
                        )}
                    </TouchableOpacity>
                    <DatePicker
                        modal
                        open={openDatePicker}
                        date={editForm.dueDate}
                        mode="date"
                        onConfirm={(date) => {
                            setOpenDatePicker(false);
                            setEditForm(prev => ({ ...prev, dueDate: date }));
                        }}
                        onCancel={() => {
                            setOpenDatePicker(false);
                        }}
                    />
                </View>
                <View style={styles.paymentProgress}>
                    <View style={styles.paymentProgressHeader}>
                        <Text style={styles.paymentProgressLabel}>Payment Progress</Text>
                        <Text style={styles.paymentProgressValue}>{paidPercentage}%</Text>
                    </View>
                    <View style={styles.paymentProgressBar}>
                        <View style={[styles.paymentProgressFill, { width: `${paidPercentage}%` }]} />
                    </View>
                </View>
            </View>
        );
    };

    const renderDocumentsTab = () => (
        <View style={styles.tabContent}>
            {project.documents && project.documents.length > 0 ? (
                project.documents.map((doc, index) => (
                    <View key={doc.id || index} style={styles.documentCard}>
                        <Icon name="file-document" size={24} color={colors.primary} />
                        <View style={styles.documentInfo}>
                            <Text style={styles.documentName}>{doc.name}</Text>
                            <Text style={styles.documentDate}>Uploaded {formatDate(doc.uploadedAt)}</Text>
                        </View>
                        <TouchableOpacity style={styles.documentAction}>
                            <Icon name="download" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                ))
            ) : (
                <View style={styles.emptyState}>
                    <Icon name="file-document-outline" size={48} color={colors.textMuted} />
                    <Text style={styles.emptyStateText}>No documents yet</Text>
                    <TouchableOpacity style={styles.uploadButton}>
                        <Icon name="upload" size={18} color={colors.white} />
                        <Text style={styles.uploadButtonText}>Upload Document</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Overview': return renderOverviewTab();
            case 'Timeline': return renderTimelineTab();
            case 'Financials': return renderFinancialsTab();
            case 'Documents': return renderDocumentsTab();
            default: return renderOverviewTab();
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={20} color={colors.primary} />
                    <Text style={styles.backText}>Back to Projects</Text>
                </TouchableOpacity>
                {isEditing ? (
                    <View style={{ flexDirection: 'row', gap: SPACING.md }}>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                        <Icon name="pencil" size={16} color={colors.primary} />
                        <Text style={styles.editButtonText}>Edit Project</Text>
                    </TouchableOpacity>
                )}
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
                <View style={styles.heroCard}>
                    <Image source={{ uri: project.imageUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400' }} style={styles.heroImage} />
                    <Text style={styles.projectName}>{project.name}</Text>
                    {project.location && (
                        <View style={styles.locationRow}>
                            <Icon name="map-marker-outline" size={16} color={colors.textSecondary} />
                            <Text style={styles.locationText}>{project.location}</Text>
                        </View>
                    )}
                    <TouchableOpacity style={[styles.statusBadge, { backgroundColor: statusConfig.color }]} onPress={() => setShowStatusPicker(!showStatusPicker)}>
                        <Text style={styles.statusBadgeText}>{statusConfig.label}</Text>
                    </TouchableOpacity>

                    {showStatusPicker && (
                        <View style={styles.statusPicker}>
                            {Object.entries(STATUS_CONFIG).map(([key, value]) => (
                                <TouchableOpacity key={key} style={[styles.statusOption, project.status === key && styles.statusOptionActive]} onPress={() => handleStatusChange(key)}>
                                    <Text style={styles.statusOptionText}>{value.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}><Text style={styles.infoLabel}>CLIENT</Text><Text style={styles.infoValue}>{client?.name || 'N/A'}</Text></View>
                        <View style={styles.infoItem}><Text style={styles.infoLabel}>DEADLINE</Text><Text style={styles.infoValue}>{formatDate(project.dueDate)}</Text></View>
                        <View style={styles.infoItem}><Text style={styles.infoLabel}>BUDGET</Text><Text style={styles.infoValue}>{formatCurrency(project.financials?.totalAmount)}</Text></View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>PROGRESS</Text>
                            <View style={styles.progressContainer}>
                                <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${getProgress()}%` }]} /></View>
                                <Text style={styles.progressText}>{getProgress()}%</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.tabsContainer}>
                    {TABS.map((tab) => (
                        <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
                            <Icon name={tab === 'Overview' ? 'view-grid-outline' : tab === 'Timeline' ? 'calendar-clock' : tab === 'Financials' ? 'currency-usd' : 'file-document-outline'} size={16} color={activeTab === tab ? colors.primary : colors.textMuted} />
                            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {renderTabContent()}
            </ScrollView>
        </SafeAreaView>
    );
};

const getStyles = (colors, isDark) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl + 10, paddingBottom: SPACING.md, backgroundColor: colors.backgroundCard, borderBottomWidth: 1, borderBottomColor: colors.border },
    backButton: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
    backText: { fontSize: FONTS.sizes.sm, color: colors.primary },
    editButton: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, borderWidth: 1, borderColor: colors.primary, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
    editButtonText: { fontSize: FONTS.sizes.sm, color: colors.primary },
    content: { flex: 1 },
    errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    errorText: { fontSize: FONTS.sizes.lg, color: colors.error, marginTop: SPACING.md },
    heroCard: { backgroundColor: colors.backgroundCard, margin: SPACING.lg, borderRadius: RADIUS.lg, padding: SPACING.lg, ...SHADOWS.md },
    heroImage: { width: '100%', height: 150, borderRadius: RADIUS.md, marginBottom: SPACING.md },
    projectName: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: colors.text },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: SPACING.xs },
    locationText: { fontSize: FONTS.sizes.sm, color: colors.textSecondary },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.sm, marginTop: SPACING.md },
    statusBadgeText: { color: colors.white, fontSize: FONTS.sizes.xs, fontWeight: '700' },
    statusPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.md },
    statusOption: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, backgroundColor: colors.backgroundLight, borderRadius: RADIUS.sm },
    statusOptionActive: { backgroundColor: colors.primary + '20' },
    statusOptionText: { fontSize: FONTS.sizes.xs, color: colors.text },
    infoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: SPACING.lg, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: SPACING.md },
    infoItem: { width: '50%', marginBottom: SPACING.md },
    infoLabel: { fontSize: FONTS.sizes.xs, color: colors.textMuted, marginBottom: 2 },
    infoValue: { fontSize: FONTS.sizes.md, color: colors.text, fontWeight: '600' },
    progressContainer: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
    progressBar: { flex: 1, height: 8, backgroundColor: colors.backgroundLight, borderRadius: 4 },
    progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
    progressText: { fontSize: FONTS.sizes.sm, color: colors.primary, fontWeight: '600' },
    tabsContainer: { flexDirection: 'row', backgroundColor: colors.backgroundCard, marginHorizontal: SPACING.lg, borderRadius: RADIUS.md, padding: SPACING.xs, ...SHADOWS.sm },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, paddingVertical: SPACING.md },
    tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
    tabText: { fontSize: FONTS.sizes.xs, color: colors.textMuted },
    tabTextActive: { color: colors.primary, fontWeight: '600' },
    tabContent: { padding: SPACING.lg },
    scopeCard: { backgroundColor: colors.backgroundCard, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOWS.sm },
    scopeHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
    scopeTitle: { fontSize: FONTS.sizes.md, fontWeight: '600', color: colors.text },
    scopeText: { fontSize: FONTS.sizes.sm, color: colors.textSecondary, lineHeight: 20 },
    activityCard: { backgroundColor: isDark ? '#1E293B' : '#2D3748', borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md },
    activityHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
    activityTitle: { fontSize: FONTS.sizes.md, fontWeight: '600', color: colors.white },
    activityItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.md },
    activityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.error, marginTop: 4, marginRight: SPACING.sm },
    activityInfo: { flex: 1 },
    activityItemTitle: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: colors.white },
    activityDescription: { fontSize: FONTS.sizes.xs, color: '#94A3B8', marginTop: 2 },
    noActivityText: { fontSize: FONTS.sizes.sm, color: '#94A3B8' },
    modulesSection: { marginTop: SPACING.md },
    sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: colors.text, marginBottom: SPACING.md },
    moduleCard: { backgroundColor: colors.backgroundCard, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOWS.sm },
    moduleHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
    moduleInfo: { flex: 1, marginLeft: SPACING.sm },
    moduleName: { fontSize: FONTS.sizes.md, color: colors.text, fontWeight: '500' },
    moduleAssignee: { fontSize: FONTS.sizes.sm, color: colors.textMuted },
    moduleActions: { flexDirection: 'row', gap: SPACING.sm },
    moduleStatusBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.backgroundLight, alignItems: 'center', justifyContent: 'center' },
    addModuleSection: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
    inputContainer: { flex: 1, backgroundColor: colors.backgroundCard, borderRadius: RADIUS.md, borderWidth: 1, borderColor: colors.border },
    input: { padding: SPACING.md, fontSize: FONTS.sizes.md, color: colors.text },
    addModuleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: RADIUS.md, paddingHorizontal: SPACING.lg, gap: SPACING.xs },
    addModuleText: { color: colors.white, fontSize: FONTS.sizes.sm, fontWeight: '600' },
    timelineContainer: { paddingVertical: SPACING.md },
    timelineRow: { flexDirection: 'row', minHeight: 100 },
    timelineCardLeft: { flex: 1, paddingRight: SPACING.md, alignItems: 'flex-end' },
    timelineCardRight: { flex: 1, paddingLeft: SPACING.md },
    timelineCenter: { width: 40, alignItems: 'center' },
    timelineDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    timelineLine: { width: 2, flex: 1, backgroundColor: colors.border, marginVertical: SPACING.xs },
    timelineModuleName: { fontSize: FONTS.sizes.md, fontWeight: '600', color: colors.text },
    timelineDate: { fontSize: FONTS.sizes.xs, color: colors.textMuted, marginTop: 2 },
    timelineStatus: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.sm, marginTop: SPACING.xs, alignSelf: 'flex-start' },
    timelineStatusText: { fontSize: FONTS.sizes.xs, fontWeight: '600' },
    financialCards: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
    financialCard: { flex: 1, borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center' },
    financialLabel: { fontSize: FONTS.sizes.xs, color: colors.textSecondary, marginTop: SPACING.sm },
    financialValue: { fontSize: FONTS.sizes.lg, fontWeight: '700', marginTop: SPACING.xs },
    paymentProgress: { backgroundColor: colors.backgroundCard, borderRadius: RADIUS.lg, padding: SPACING.lg, ...SHADOWS.sm },
    paymentProgressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
    paymentProgressLabel: { fontSize: FONTS.sizes.md, color: colors.text },
    paymentProgressValue: { fontSize: FONTS.sizes.md, fontWeight: '600', color: colors.success },
    paymentProgressBar: { height: 10, backgroundColor: colors.backgroundLight, borderRadius: 5 },
    paymentProgressFill: { height: '100%', backgroundColor: colors.success, borderRadius: 5 },
    documentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.backgroundCard, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOWS.sm },
    documentInfo: { flex: 1, marginLeft: SPACING.md },
    documentName: { fontSize: FONTS.sizes.md, color: colors.text, fontWeight: '500' },
    documentDate: { fontSize: FONTS.sizes.xs, color: colors.textMuted },
    documentAction: { padding: SPACING.sm },
    emptyState: { alignItems: 'center', paddingVertical: SPACING.xxxl },
    emptyStateText: { fontSize: FONTS.sizes.md, color: colors.textMuted, marginTop: SPACING.md },
    uploadButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, borderRadius: RADIUS.md, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, marginTop: SPACING.lg, gap: SPACING.sm },
    uploadButtonText: { color: colors.white, fontSize: FONTS.sizes.md, fontWeight: '600' },
    editInputMultiline: { backgroundColor: colors.backgroundLight, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: colors.border, minHeight: 100, fontSize: FONTS.sizes.sm, color: colors.text },
    editInput: { backgroundColor: colors.backgroundLight, borderRadius: RADIUS.sm, padding: SPACING.xs, borderWidth: 1, borderColor: colors.border, minWidth: 80, textAlign: 'center', fontSize: FONTS.sizes.lg, fontWeight: '700' },
    cancelButton: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
    cancelButtonText: { fontSize: FONTS.sizes.sm, color: colors.textMuted },
    saveButton: { backgroundColor: colors.primary, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.md },
    saveButtonText: { fontSize: FONTS.sizes.sm, color: colors.white, fontWeight: '600' },
});

export default ProjectDetailScreen;
