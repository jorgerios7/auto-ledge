import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    headerContainer: {
        alignItems: 'center',
        padding: 0
    },
    logoImage: {
        width: '90%',
        height: 300,
        resizeMode: 'contain',
    },
    logo: {
        color: colors.text,
        fontSize: 22,
        fontWeight: '300',
        letterSpacing: 6,
        textAlign: 'center',
    },
    tagline: {
        color: colors.textSecondary,
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginTop: 8,
    },
    formContainer: {
        width: '100%',
    },
    formTitle: {
        color: colors.text,
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 24,
    },
    submitBtn: {
        marginTop: 10,
    },
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        paddingVertical: 4,
        marginTop: -8,
        marginBottom: 12,
    },
    forgotPasswordText: {
        color: colors.primary,
        fontSize: 13,
        fontWeight: '700',
    },
    errorText: {
        color: colors.error,
        fontSize: 14,
        marginBottom: 16,
        fontWeight: '500',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
    switchText: {
        color: colors.textMuted,
        fontSize: 14,
    },
    switchLink: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '700',
    },
    googleSeparator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    googleSeparatorLine: {
        flex: 1,
        height: 0.5,
        backgroundColor: colors.border,
    },
    googleSeparatorText: {
        color: colors.textMuted,
        fontSize: 11,
        fontWeight: '700',
        marginHorizontal: 16,
        letterSpacing: 1.2,
    },
    googleBtn: {
        marginTop: 0,
        backgroundColor: 'transparent',
    },
});
