import React, { useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';

const ChatScreen = () => {
    const navigation = useNavigation();
    const { user, getActiveUsers } = useAuth();
    const { getLastMessage, getUnreadCount } = useData();
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => getStyles(colors), [colors]);

    const teamMembers = getActiveUsers().filter(u => u.id !== user?.id);

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return date.toLocaleDateString([], { weekday: 'short' });
        }
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const renderMember = ({ item }) => {
        const lastMessage = getLastMessage(item.id);
        const unreadCount = getUnreadCount(item.id);

        return (
            <TouchableOpacity
                style={styles.memberCard}
                onPress={() => navigation.navigate('ChatRoom', { userId: item.id, userName: item.name })}
            >
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {item.name.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.onlineIndicator} />
                </View>

                <View style={styles.memberInfo}>
                    <View style={styles.memberHeader}>
                        <Text style={styles.memberName}>{item.name}</Text>
                        {lastMessage && (
                            <Text style={styles.timeText}>{formatTime(lastMessage.timestamp)}</Text>
                        )}
                    </View>
                    <View style={styles.messageRow}>
                        <Text style={styles.lastMessage} numberOfLines={1}>
                            {lastMessage ? lastMessage.text : 'Start a conversation'}
                        </Text>
                        {unreadCount > 0 && (
                            <View style={styles.unreadBadge}>
                                <Text style={styles.unreadText}>{unreadCount}</Text>
                            </View>
                        )}
                    </View>
                </View>

                <Icon name="chevron-right" size={20} color={colors.textMuted} />
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Icon name="chat-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Team Members</Text>
            <Text style={styles.emptyText}>
                Team members will appear here once added by admin
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Messages</Text>
                <Text style={styles.headerSubtitle}>{teamMembers.length} team members</Text>
            </View>

            {/* Member List */}
            <FlatList
                data={teamMembers}
                renderItem={renderMember}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmpty}
            />
        </SafeAreaView>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.md,
    },
    headerTitle: {
        fontSize: FONTS.sizes.xxl,
        fontWeight: '700',
        color: colors.text,
    },
    headerSubtitle: {
        fontSize: FONTS.sizes.sm,
        color: colors.textSecondary,
        marginTop: SPACING.xs,
    },
    listContent: {
        padding: SPACING.lg,
    },
    memberCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundCard,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        ...SHADOWS.sm,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: colors.white,
        fontSize: FONTS.sizes.lg,
        fontWeight: '600',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.success,
        borderWidth: 2,
        borderColor: colors.backgroundCard,
    },
    memberInfo: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    memberHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    memberName: {
        fontSize: FONTS.sizes.md,
        fontWeight: '600',
        color: colors.text,
    },
    timeText: {
        fontSize: FONTS.sizes.xs,
        color: colors.textMuted,
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    lastMessage: {
        flex: 1,
        fontSize: FONTS.sizes.sm,
        color: colors.textSecondary,
    },
    unreadBadge: {
        backgroundColor: colors.primary,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SPACING.xs,
        marginLeft: SPACING.sm,
    },
    unreadText: {
        color: colors.white,
        fontSize: FONTS.sizes.xs,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xxxl * 2,
    },
    emptyTitle: {
        fontSize: FONTS.sizes.lg,
        fontWeight: '600',
        color: colors.text,
        marginTop: SPACING.lg,
        marginBottom: SPACING.sm,
    },
    emptyText: {
        fontSize: FONTS.sizes.sm,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});

export default ChatScreen;
