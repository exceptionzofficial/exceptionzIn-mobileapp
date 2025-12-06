import React, { useState, useMemo } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';

const AddTaskScreen = () => {
    const navigation = useNavigation();
    const { addTask, projects } = useData();
    const { getActiveUsers } = useAuth();
    const { colors } = useTheme();
    const styles = useMemo(() => getStyles(colors), [colors]);
    const teamMembers = getActiveUsers();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        projectId: null,
        projectName: '',
        assignedTo: null,
        assignedToName: '',
        status: 'pending',
        priority: 'medium',
        dueDate: '',
    });
    const [showProjectPicker, setShowProjectPicker] = useState(false);
    const [showAssigneePicker, setShowAssigneePicker] = useState(false);

    const STATUS_OPTIONS = [
        { key: 'pending', label: 'Pending', color: colors.textMuted },
        { key: 'in_progress', label: 'In Progress', color: colors.warning },
        { key: 'completed', label: 'Completed', color: colors.success },
    ];

    const PRIORITY_OPTIONS = [
        { key: 'low', label: 'Low', color: colors.success },
        { key: 'medium', label: 'Medium', color: colors.warning },
        { key: 'high', label: 'High', color: colors.error },
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleProjectSelect = (project) => {
        setFormData(prev => ({ ...prev, projectId: project.id, projectName: project.name }));
        setShowProjectPicker(false);
    };

    const handleAssigneeSelect = (user) => {
        setFormData(prev => ({ ...prev, assignedTo: user.id, assignedToName: user.name }));
        setShowAssigneePicker(false);
    };

    const handleSubmit = async () => {
        if (!formData.title.trim()) {
            Alert.alert('Error', 'Please enter task title');
            return;
        }
        const result = await addTask(formData);
        if (result.success) {
            Alert.alert('Success', 'Task created successfully');
            navigation.goBack();
        } else {
            Alert.alert('Error', result.error || 'Failed to create task');
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-left" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>New Task</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Task Title *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter task title"
                            placeholderTextColor={colors.textMuted}
                            value={formData.title}
                            onChangeText={(text) => handleInputChange('title', text)}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Task description"
                            placeholderTextColor={colors.textMuted}
                            value={formData.description}
                            onChangeText={(text) => handleInputChange('description', text)}
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Project</Text>
                        <TouchableOpacity style={styles.pickerButton} onPress={() => setShowProjectPicker(!showProjectPicker)}>
                            <Text style={formData.projectName ? styles.pickerText : styles.pickerPlaceholder}>
                                {formData.projectName || 'Select project'}
                            </Text>
                            <Icon name="chevron-down" size={20} color={colors.textMuted} />
                        </TouchableOpacity>
                        {showProjectPicker && (
                            <View style={styles.pickerDropdown}>
                                {projects.map(project => (
                                    <TouchableOpacity key={project.id} style={styles.pickerOption} onPress={() => handleProjectSelect(project)}>
                                        <Text style={styles.pickerOptionText}>{project.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Assign To</Text>
                        <TouchableOpacity style={styles.pickerButton} onPress={() => setShowAssigneePicker(!showAssigneePicker)}>
                            <Text style={formData.assignedToName ? styles.pickerText : styles.pickerPlaceholder}>
                                {formData.assignedToName || 'Select assignee'}
                            </Text>
                            <Icon name="chevron-down" size={20} color={colors.textMuted} />
                        </TouchableOpacity>
                        {showAssigneePicker && (
                            <View style={styles.pickerDropdown}>
                                {teamMembers.map(user => (
                                    <TouchableOpacity key={user.id} style={styles.pickerOption} onPress={() => handleAssigneeSelect(user)}>
                                        <Text style={styles.pickerOptionText}>{user.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Due Date</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor={colors.textMuted}
                            value={formData.dueDate}
                            onChangeText={(text) => handleInputChange('dueDate', text)}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Status</Text>
                        <View style={styles.statusOptions}>
                            {STATUS_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option.key}
                                    style={[styles.statusOption, formData.status === option.key && { backgroundColor: option.color + '20', borderColor: option.color }]}
                                    onPress={() => handleInputChange('status', option.key)}
                                >
                                    <Text style={[styles.statusOptionText, formData.status === option.key && { color: option.color }]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Priority</Text>
                        <View style={styles.statusOptions}>
                            {PRIORITY_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option.key}
                                    style={[styles.priorityOption, formData.priority === option.key && { backgroundColor: option.color + '20', borderColor: option.color }]}
                                    onPress={() => handleInputChange('priority', option.key)}
                                >
                                    <Icon name="flag" size={14} color={formData.priority === option.key ? option.color : colors.textMuted} />
                                    <Text style={[styles.statusOptionText, formData.priority === option.key && { color: option.color }]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Icon name="checkbox-marked-circle-plus-outline" size={20} color={colors.white} />
                        <Text style={styles.submitButtonText}>Create Task</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    keyboardView: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl + 10, paddingBottom: SPACING.md, backgroundColor: colors.backgroundCard, borderBottomWidth: 1, borderBottomColor: colors.border },
    backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: colors.text },
    content: { flex: 1, padding: SPACING.lg },
    inputGroup: { marginBottom: SPACING.lg },
    label: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: colors.textSecondary, marginBottom: SPACING.sm },
    input: { backgroundColor: colors.backgroundCard, borderRadius: RADIUS.md, padding: SPACING.md, fontSize: FONTS.sizes.md, color: colors.text, borderWidth: 1, borderColor: colors.border },
    textArea: { minHeight: 100, textAlignVertical: 'top' },
    pickerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.backgroundCard, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: colors.border },
    pickerText: { fontSize: FONTS.sizes.md, color: colors.text },
    pickerPlaceholder: { fontSize: FONTS.sizes.md, color: colors.textMuted },
    pickerDropdown: { backgroundColor: colors.backgroundCard, borderRadius: RADIUS.md, marginTop: SPACING.sm, borderWidth: 1, borderColor: colors.border, maxHeight: 200 },
    pickerOption: { padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: colors.border },
    pickerOptionText: { fontSize: FONTS.sizes.md, color: colors.text },
    statusOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
    statusOption: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, borderWidth: 1, borderColor: colors.border },
    priorityOption: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, borderWidth: 1, borderColor: colors.border, gap: SPACING.xs },
    statusOptionText: { fontSize: FONTS.sizes.sm, color: colors.textMuted },
    submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: RADIUS.md, padding: SPACING.lg, marginTop: SPACING.lg, marginBottom: SPACING.xxxl, gap: SPACING.sm },
    submitButtonText: { color: colors.white, fontSize: FONTS.sizes.md, fontWeight: '600' },
});

export default AddTaskScreen;
