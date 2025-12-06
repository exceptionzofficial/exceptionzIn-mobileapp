import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';

const ChatRoomScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { userId, userName } = route.params;
    const { user } = useAuth();
    const { getConversation, sendMessage, markMessagesAsRead } = useData();

    const [messageText, setMessageText] = useState('');
    const flatListRef = useRef(null);

    const messages = getConversation(userId);

    useEffect(() => {
        markMessagesAsRead(userId);
    }, [userId]);

    const handleSend = async () => {
        if (!messageText.trim()) return;

        await sendMessage(userId, messageText.trim());
        setMessageText('');
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }
        return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    };

    const shouldShowDate = (index) => {
        if (index === 0) return true;
        const currentDate = new Date(messages[index].timestamp).toDateString();
        const prevDate = new Date(messages[index - 1].timestamp).toDateString();
        return currentDate !== prevDate;
    };

    const renderMessage = ({ item, index }) => {
        const isOwnMessage = item.fromUserId === user?.id;
        const showDate = shouldShowDate(index);

        return (
            <View>
                {showDate && (
                    <View style={styles.dateSeparator}>
                        <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>
                    </View>
                )}
                <View style={[styles.messageContainer, isOwnMessage && styles.ownMessageContainer]}>
                    <View style={[styles.messageBubble, isOwnMessage ? styles.ownBubble : styles.otherBubble]}>
                        <Text style={[styles.messageText, isOwnMessage && styles.ownMessageText]}>
                            {item.text}
                        </Text>
                        <View style={styles.messageFooter}>
                            <Text style={[styles.timeText, isOwnMessage && styles.ownTimeText]}>
                                {formatTime(item.timestamp)}
                            </Text>
                            {isOwnMessage && (
                                <Icon
                                    name="check-all"
                                    size={14}
                                    color={item.read ? COLORS.primary : COLORS.white}
                                    style={styles.checkIcon}
                                />
                            )}
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>

                <View style={styles.headerInfo}>
                    <View style={styles.headerAvatar}>
                        <Text style={styles.headerAvatarText}>
                            {userName.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.headerName}>{userName}</Text>
                        <Text style={styles.headerStatus}>Online</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.headerAction}>
                    <Icon name="dots-vertical" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Messages */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messagesList}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="chat-processing-outline" size={48} color={COLORS.textMuted} />
                        <Text style={styles.emptyText}>Start a conversation</Text>
                    </View>
                }
            />

            {/* Input */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Type a message..."
                            placeholderTextColor={COLORS.textMuted}
                            value={messageText}
                            onChangeText={setMessageText}
                            multiline
                            maxLength={1000}
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
                        onPress={handleSend}
                        disabled={!messageText.trim()}
                    >
                        <Icon name="send" size={20} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        paddingTop: SPACING.xl + 10,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        ...SHADOWS.sm,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: SPACING.sm,
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    headerAvatarText: {
        color: COLORS.white,
        fontSize: FONTS.sizes.md,
        fontWeight: '600',
    },
    headerName: {
        fontSize: FONTS.sizes.md,
        fontWeight: '600',
        color: COLORS.text,
    },
    headerStatus: {
        fontSize: FONTS.sizes.xs,
        color: COLORS.success,
    },
    headerAction: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    messagesList: {
        padding: SPACING.lg,
        flexGrow: 1,
    },
    dateSeparator: {
        alignItems: 'center',
        marginVertical: SPACING.md,
    },
    dateText: {
        fontSize: FONTS.sizes.xs,
        color: COLORS.textMuted,
        backgroundColor: COLORS.backgroundLight,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.full,
    },
    messageContainer: {
        marginBottom: SPACING.sm,
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    ownMessageContainer: {
        justifyContent: 'flex-end',
    },
    messageBubble: {
        maxWidth: '75%',
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
    },
    otherBubble: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: RADIUS.sm,
        ...SHADOWS.sm,
    },
    ownBubble: {
        backgroundColor: COLORS.primary,
        borderTopRightRadius: RADIUS.sm,
    },
    messageText: {
        fontSize: FONTS.sizes.md,
        color: COLORS.text,
        lineHeight: 20,
    },
    ownMessageText: {
        color: COLORS.white,
    },
    messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: SPACING.xs,
    },
    timeText: {
        fontSize: FONTS.sizes.xs,
        color: COLORS.textMuted,
    },
    ownTimeText: {
        color: 'rgba(255,255,255,0.7)',
    },
    checkIcon: {
        marginLeft: SPACING.xs,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xxxl * 3,
    },
    emptyText: {
        fontSize: FONTS.sizes.md,
        color: COLORS.textMuted,
        marginTop: SPACING.md,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: SPACING.md,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    inputWrapper: {
        flex: 1,
        backgroundColor: COLORS.backgroundLight,
        borderRadius: RADIUS.lg,
        marginRight: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    input: {
        padding: SPACING.md,
        fontSize: FONTS.sizes.md,
        color: COLORS.text,
        maxHeight: 100,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: COLORS.textMuted,
    },
});

export default ChatRoomScreen;
