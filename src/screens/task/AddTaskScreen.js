import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../utils/theme';

const STATUS_OPTIONS = [
    { key: 'todo', label: 'To Do', icon: 'checkbox-blank-circle-outline' },
    { key: 'in_progress', label: 'In Progress', icon: 'progress-clock' },
    { key: 'done', label: 'Done', icon: 'check-circle' },
];

const PRIORITY_OPTIONS = [
    { key: 'high', label: 'High', icon: 'arrow-up-bold', color: COLORS.error },
    { key: 'medium', label: 'Medium', icon: 'minus', color: COLORS.warning },
    { key: 'low', label: 'Low', icon: 'arrow-down-bold', color: COLORS.success },
];

const AddTaskScreen = () => {
    const navigation = useNavigation();
    const { addTask, projects } = useData();
    const { getActiveUsers } = useAuth();

    const teamMembers = getActiveUsers();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assignedTo: null,
        assignedToName: null,
        projectId: null,
        status: 'todo',
        priority: 'medium',
        dueDate: '',
    });
    const [showAssigneePicker, setShowAssigneePicker] = useState(false);
    const [showProjectPicker, setShowProjectPicker] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.title.trim()) {
            Alert.alert('Error', 'Please enter task title');
            return;
        }

        setIsLoading(true);
        const result = await addTask({
            ...formData,
            dueDate: formData.dueDate || null,
        });
        setIsLoading(false);

        if (result.success) {
            Alert.alert('Success', 'Task created successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert('Error', result.error);
        }
    };

    const selectedProject = projects.find(p => p.id === formData.projectId);

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-left" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>New Task</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Task Info */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Task Details</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Title *</Text>
                            <View style={styles.inputContainer}>
                                <Icon name="checkbox-marked-circle-outline" size={20} color={COLORS.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter task title"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={formData.title}
                                    onChangeText={(value) => updateField('title', value)}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Enter task description"
                                placeholderTextColor={COLORS.textMuted}
                                value={formData.description}
                                onChangeText={(value) => updateField('description', value)}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Assignee */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Assign To</Text>
                            <TouchableOpacity style={styles.selectButton} onPress={() => setShowAssigneePicker(!showAssigneePicker)}>
                                <Icon name="account-outline" size={20} color={COLORS.textMuted} />
                                <Text style={[styles.selectText, !formData.assignedToName && styles.placeholder]}>
                                    {formData.assignedToName || 'Select assignee...'}
                                </Text>
                                <Icon name="chevron-down" size={18} color={COLORS.textMuted} />
                            </TouchableOpacity>
                            {showAssigneePicker && (
                                <View style={styles.pickerList}>
                                    <TouchableOpacity style={styles.pickerItem} onPress={() => { updateField('assignedTo', null); updateField('assignedToName', null); setShowAssigneePicker(false); }}>
                                        <Text style={styles.pickerItemText}>Unassigned</Text>
                                    </TouchableOpacity>
                                    {teamMembers.map(member => (
                                        <TouchableOpacity key={member.id} style={styles.pickerItem} onPress={() => { updateField('assignedTo', member.id); updateField('assignedToName', member.name); setShowAssigneePicker(false); }}>
                                            <Text style={styles.pickerItemText}>{member.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Project */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Link to Project</Text>
                            <TouchableOpacity style={styles.selectButton} onPress={() => setShowProjectPicker(!showProjectPicker)}>
                                <Icon name="folder-outline" size={20} color={COLORS.textMuted} />
                                <Text style={[styles.selectText, !selectedProject && styles.placeholder]}>
                                    {selectedProject ? selectedProject.name : 'Select project...'}
                                </Text>
                                <Icon name="chevron-down" size={18} color={COLORS.textMuted} />
                            </TouchableOpacity>
                            {showProjectPicker && (
                                <View style={styles.pickerList}>
                                    <TouchableOpacity style={styles.pickerItem} onPress={() => { updateField('projectId', null); setShowProjectPicker(false); }}>
                                        <Text style={styles.pickerItemText}>No Project</Text>
                                    </TouchableOpacity>
                                    {projects.map(project => (
                                        <TouchableOpacity key={project.id} style={styles.pickerItem} onPress={() => { updateField('projectId', project.id); setShowProjectPicker(false); }}>
                                            <Text style={styles.pickerItemText}>{project.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Due Date</Text>
                            <View style={styles.inputContainer}>
                                <Icon name="calendar-outline" size={20} color={COLORS.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={formData.dueDate}
                                    onChangeText={(value) => updateField('dueDate', value)}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Status */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Status</Text>
                        <View style={styles.optionsRow}>
                            {STATUS_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option.key}
                                    style={[styles.optionButton, formData.status === option.key && styles.optionButtonActive]}
                                    onPress={() => updateField('status', option.key)}
                                >
                                    <Icon name={option.icon} size={16} color={formData.status === option.key ? COLORS.white : COLORS.textSecondary} />
                                    <Text style={[styles.optionText, formData.status === option.key && styles.optionTextActive]}>{option.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Priority */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Priority</Text>
                        <View style={styles.optionsRow}>
                            {PRIORITY_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option.key}
                                    style={[styles.priorityButton, formData.priority === option.key && { backgroundColor: option.color, borderColor: option.color }]}
                                    onPress={() => updateField('priority', option.key)}
                                >
                                    <Icon name={option.icon} size={14} color={formData.priority === option.key ? COLORS.white : option.color} />
                                    <Text style={[styles.priorityButtonText, formData.priority === option.key && { color: COLORS.white }]}>{option.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Submit */}
                    <TouchableOpacity
                        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        <Icon name="check" size={20} color={COLORS.white} />
                        <Text style={styles.submitButtonText}>{isLoading ? 'Creating...' : 'Create Task'}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    flex: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl + 10, paddingBottom: SPACING.md,
        backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    },
    backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: COLORS.text },
    content: { flex: 1, padding: SPACING.lg },
    section: { marginBottom: SPACING.xl },
    sectionTitle: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.md },
    inputGroup: { marginBottom: SPACING.md },
    label: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
    input: { flex: 1, padding: SPACING.md, fontSize: FONTS.sizes.md, color: COLORS.text },
    textArea: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.md, fontSize: FONTS.sizes.md, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, height: 100, textAlignVertical: 'top' },
    selectButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.sm },
    selectText: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text },
    placeholder: { color: COLORS.textMuted },
    pickerList: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, marginTop: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
    pickerItem: { padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    pickerItemText: { fontSize: FONTS.sizes.md, color: COLORS.text },
    optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
    optionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.xs },
    optionButtonActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    optionText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
    optionTextActive: { color: COLORS.white, fontWeight: '600' },
    priorityButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.xs },
    priorityButtonText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
    submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: RADIUS.md, padding: SPACING.lg, marginTop: SPACING.lg, marginBottom: SPACING.xxxl, gap: SPACING.sm },
    submitButtonDisabled: { opacity: 0.7 },
    submitButtonText: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '600' },
});

export default AddTaskScreen;
