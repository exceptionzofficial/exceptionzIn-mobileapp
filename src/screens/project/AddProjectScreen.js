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

const AddProjectScreen = () => {
    const navigation = useNavigation();
    const { addProject, clients } = useData();
    const { getActiveUsers } = useAuth();
    const { colors } = useTheme();
    const styles = useMemo(() => getStyles(colors), [colors]);
    const teamMembers = getActiveUsers();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        clientId: null,
        clientName: '',
        status: 'planning',
        dueDate: '',
        modules: [],
    });
    const [showClientPicker, setShowClientPicker] = useState(false);
    const [newModuleName, setNewModuleName] = useState('');

    const STATUS_OPTIONS = [
        { key: 'planning', label: 'Planning', color: colors.info },
        { key: 'in_progress', label: 'In Progress', color: colors.warning },
        { key: 'review', label: 'Review', color: colors.primary },
        { key: 'completed', label: 'Completed', color: colors.success },
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleClientSelect = (client) => {
        setFormData(prev => ({ ...prev, clientId: client.id, clientName: client.name }));
        setShowClientPicker(false);
    };

    const handleAddModule = () => {
        if (!newModuleName.trim()) return;
        const newModule = {
            id: `temp_${Date.now()}`,
            name: newModuleName.trim(),
            status: 'pending',
        };
        setFormData(prev => ({ ...prev, modules: [...prev.modules, newModule] }));
        setNewModuleName('');
    };

    const handleRemoveModule = (moduleId) => {
        setFormData(prev => ({ ...prev, modules: prev.modules.filter(m => m.id !== moduleId) }));
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            Alert.alert('Error', 'Please enter project name');
            return;
        }
        const result = await addProject(formData);
        if (result.success) {
            Alert.alert('Success', 'Project created successfully');
            navigation.goBack();
        } else {
            Alert.alert('Error', result.error || 'Failed to create project');
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-left" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>New Project</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Project Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter project name"
                            placeholderTextColor={colors.textMuted}
                            value={formData.name}
                            onChangeText={(text) => handleInputChange('name', text)}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Project description"
                            placeholderTextColor={colors.textMuted}
                            value={formData.description}
                            onChangeText={(text) => handleInputChange('description', text)}
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Client</Text>
                        <TouchableOpacity style={styles.pickerButton} onPress={() => setShowClientPicker(!showClientPicker)}>
                            <Text style={formData.clientName ? styles.pickerText : styles.pickerPlaceholder}>
                                {formData.clientName || 'Select client'}
                            </Text>
                            <Icon name="chevron-down" size={20} color={colors.textMuted} />
                        </TouchableOpacity>
                        {showClientPicker && (
                            <View style={styles.pickerDropdown}>
                                {clients.filter(c => c.status === 'converted' || c.status === 'qualified').map(client => (
                                    <TouchableOpacity key={client.id} style={styles.pickerOption} onPress={() => handleClientSelect(client)}>
                                        <Text style={styles.pickerOptionText}>{client.name}</Text>
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
                        <Text style={styles.label}>Modules</Text>
                        <View style={styles.modulesContainer}>
                            {formData.modules.map((module) => (
                                <View key={module.id} style={styles.moduleCard}>
                                    <Text style={styles.moduleName}>{module.name}</Text>
                                    <TouchableOpacity onPress={() => handleRemoveModule(module.id)}>
                                        <Icon name="close-circle" size={20} color={colors.error} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <View style={styles.addModuleRow}>
                                <TextInput
                                    style={styles.moduleInput}
                                    placeholder="Add module"
                                    placeholderTextColor={colors.textMuted}
                                    value={newModuleName}
                                    onChangeText={setNewModuleName}
                                />
                                <TouchableOpacity style={styles.addModuleButton} onPress={handleAddModule}>
                                    <Icon name="plus" size={20} color={colors.white} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Icon name="folder-plus" size={20} color={colors.white} />
                        <Text style={styles.submitButtonText}>Create Project</Text>
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
    statusOptionText: { fontSize: FONTS.sizes.sm, color: colors.textMuted },
    modulesContainer: { gap: SPACING.sm },
    moduleCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.backgroundCard, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: colors.border },
    moduleName: { fontSize: FONTS.sizes.md, color: colors.text },
    addModuleRow: { flexDirection: 'row', gap: SPACING.sm },
    moduleInput: { flex: 1, backgroundColor: colors.backgroundCard, borderRadius: RADIUS.md, padding: SPACING.md, fontSize: FONTS.sizes.md, color: colors.text, borderWidth: 1, borderColor: colors.border },
    addModuleButton: { width: 48, height: 48, borderRadius: RADIUS.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: RADIUS.md, padding: SPACING.lg, marginTop: SPACING.lg, marginBottom: SPACING.xxxl, gap: SPACING.sm },
    submitButtonText: { color: colors.white, fontSize: FONTS.sizes.md, fontWeight: '600' },
});

export default AddProjectScreen;
