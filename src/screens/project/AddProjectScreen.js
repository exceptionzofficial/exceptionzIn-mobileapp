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
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';

const STATUS_OPTIONS = [
    { key: 'planning', label: 'Planning', icon: 'clipboard-text-outline' },
    { key: 'in_progress', label: 'In Progress', icon: 'progress-clock' },
    { key: 'review', label: 'Review', icon: 'file-search-outline' },
    { key: 'completed', label: 'Completed', icon: 'check-circle-outline' },
];

const AddProjectScreen = () => {
    const navigation = useNavigation();
    const { addProject, clients } = useData();
    const { getActiveUsers } = useAuth();

    const teamMembers = getActiveUsers();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        clientId: null,
        status: 'planning',
        dueDate: '',
        modules: [],
    });
    const [newModule, setNewModule] = useState({ name: '', assignedTo: null, assignedToName: null });
    const [showClientPicker, setShowClientPicker] = useState(false);
    const [showAssigneePicker, setShowAssigneePicker] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addModule = () => {
        if (!newModule.name.trim()) {
            Alert.alert('Error', 'Please enter module name');
            return;
        }

        setFormData(prev => ({
            ...prev,
            modules: [...prev.modules, { ...newModule, id: `temp_${Date.now()}` }]
        }));
        setNewModule({ name: '', assignedTo: null, assignedToName: null });
    };

    const removeModule = (index) => {
        setFormData(prev => ({
            ...prev,
            modules: prev.modules.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            Alert.alert('Error', 'Please enter project name');
            return;
        }

        setIsLoading(true);
        const result = await addProject({
            ...formData,
            dueDate: formData.dueDate || null,
        });
        setIsLoading(false);

        if (result.success) {
            Alert.alert('Success', 'Project created successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert('Error', result.error);
        }
    };

    const selectedClient = clients.find(c => c.id === formData.clientId);

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-left" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>New Project</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Basic Info */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Project Details</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Project Name *</Text>
                            <View style={styles.inputContainer}>
                                <Icon name="folder-outline" size={20} color={COLORS.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter project name"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={formData.name}
                                    onChangeText={(value) => updateField('name', value)}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Enter project description"
                                placeholderTextColor={COLORS.textMuted}
                                value={formData.description}
                                onChangeText={(value) => updateField('description', value)}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Client Selection */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Client (Optional)</Text>
                            <TouchableOpacity
                                style={styles.selectButton}
                                onPress={() => setShowClientPicker(!showClientPicker)}
                            >
                                <Icon name="account-outline" size={20} color={COLORS.textMuted} />
                                <Text style={[styles.selectText, !selectedClient && styles.placeholder]}>
                                    {selectedClient ? selectedClient.name : 'Select client...'}
                                </Text>
                                <Icon name="chevron-down" size={18} color={COLORS.textMuted} />
                            </TouchableOpacity>

                            {showClientPicker && (
                                <View style={styles.pickerList}>
                                    <TouchableOpacity
                                        style={styles.pickerItem}
                                        onPress={() => { updateField('clientId', null); setShowClientPicker(false); }}
                                    >
                                        <Text style={styles.pickerItemText}>No Client</Text>
                                    </TouchableOpacity>
                                    {clients.map(client => (
                                        <TouchableOpacity
                                            key={client.id}
                                            style={[styles.pickerItem, formData.clientId === client.id && styles.pickerItemActive]}
                                            onPress={() => { updateField('clientId', client.id); setShowClientPicker(false); }}
                                        >
                                            <Text style={styles.pickerItemText}>{client.name}</Text>
                                            {client.company && <Text style={styles.pickerItemSub}>{client.company}</Text>}
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
                                    <Icon
                                        name={option.icon}
                                        size={16}
                                        color={formData.status === option.key ? COLORS.white : COLORS.textSecondary}
                                    />
                                    <Text style={[styles.optionText, formData.status === option.key && styles.optionTextActive]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Modules */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Modules ({formData.modules.length})</Text>

                        {/* Module List */}
                        {formData.modules.map((module, index) => (
                            <View key={module.id} style={styles.moduleCard}>
                                <View style={styles.moduleInfo}>
                                    <Icon name="puzzle-outline" size={18} color={COLORS.primary} />
                                    <Text style={styles.moduleName}>{module.name}</Text>
                                    {module.assignedToName && (
                                        <Text style={styles.moduleAssignee}>{module.assignedToName}</Text>
                                    )}
                                </View>
                                <TouchableOpacity onPress={() => removeModule(index)}>
                                    <Icon name="close-circle" size={20} color={COLORS.error} />
                                </TouchableOpacity>
                            </View>
                        ))}

                        {/* Add Module */}
                        <View style={styles.addModuleSection}>
                            <View style={styles.inputContainer}>
                                <Icon name="plus" size={20} color={COLORS.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Module name"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={newModule.name}
                                    onChangeText={(value) => setNewModule(prev => ({ ...prev, name: value }))}
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.selectButton}
                                onPress={() => setShowAssigneePicker(!showAssigneePicker)}
                            >
                                <Icon name="account-outline" size={20} color={COLORS.textMuted} />
                                <Text style={[styles.selectText, !newModule.assignedToName && styles.placeholder]}>
                                    {newModule.assignedToName || 'Assign to...'}
                                </Text>
                                <Icon name="chevron-down" size={18} color={COLORS.textMuted} />
                            </TouchableOpacity>

                            {showAssigneePicker && (
                                <View style={styles.pickerList}>
                                    <TouchableOpacity
                                        style={styles.pickerItem}
                                        onPress={() => {
                                            setNewModule(prev => ({ ...prev, assignedTo: null, assignedToName: null }));
                                            setShowAssigneePicker(false);
                                        }}
                                    >
                                        <Text style={styles.pickerItemText}>Unassigned</Text>
                                    </TouchableOpacity>
                                    {teamMembers.map(member => (
                                        <TouchableOpacity
                                            key={member.id}
                                            style={styles.pickerItem}
                                            onPress={() => {
                                                setNewModule(prev => ({ ...prev, assignedTo: member.id, assignedToName: member.name }));
                                                setShowAssigneePicker(false);
                                            }}
                                        >
                                            <Text style={styles.pickerItemText}>{member.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            <TouchableOpacity style={styles.addModuleButton} onPress={addModule}>
                                <Icon name="plus" size={18} color={COLORS.white} />
                                <Text style={styles.addModuleText}>Add Module</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Submit */}
                    <TouchableOpacity
                        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        <Icon name="check" size={20} color={COLORS.white} />
                        <Text style={styles.submitButtonText}>
                            {isLoading ? 'Creating...' : 'Create Project'}
                        </Text>
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
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
        borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
    },
    input: { flex: 1, padding: SPACING.md, fontSize: FONTS.sizes.md, color: COLORS.text },
    textArea: {
        backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.md,
        fontSize: FONTS.sizes.md, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, height: 100,
    },
    selectButton: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
        borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.sm,
    },
    selectText: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text },
    placeholder: { color: COLORS.textMuted },
    pickerList: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, marginTop: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
    pickerItem: { padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    pickerItemActive: { backgroundColor: COLORS.primary + '10' },
    pickerItemText: { fontSize: FONTS.sizes.md, color: COLORS.text },
    pickerItemSub: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, marginTop: 2 },
    optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
    optionButton: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.xs,
    },
    optionButtonActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    optionText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
    optionTextActive: { color: COLORS.white, fontWeight: '600' },
    moduleCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOWS.sm,
    },
    moduleInfo: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 },
    moduleName: { fontSize: FONTS.sizes.md, color: COLORS.text, fontWeight: '500' },
    moduleAssignee: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted },
    addModuleSection: { gap: SPACING.sm },
    addModuleButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primaryLight,
        borderRadius: RADIUS.md, padding: SPACING.md, gap: SPACING.sm,
    },
    addModuleText: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '600' },
    submitButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary,
        borderRadius: RADIUS.md, padding: SPACING.lg, marginTop: SPACING.lg, marginBottom: SPACING.xxxl, gap: SPACING.sm,
    },
    submitButtonDisabled: { opacity: 0.7 },
    submitButtonText: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '600' },
});

export default AddProjectScreen;
