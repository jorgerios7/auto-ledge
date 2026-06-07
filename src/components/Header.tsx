import React from "react";
import { ArrowLeft, Plus, X } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppTheme, useTheme } from "../theme";

type iconType = "ArrowLeft" | "Plus" | "None"
type positionType = "left_title" | "right_title"

export default function Header({ iconType, onPress, title, position }: { iconType: iconType, onPress: () => void; title: string, position: positionType }) {
    const theme = useTheme();
    const styles = React.useMemo(() => createStyles(theme), [theme]);

    return (
        <View style={styles.header}>
            {position === "left_title" &&
                <>
                    <TouchableOpacity onPress={onPress} style={styles.backBtn}>
                        {iconType === "ArrowLeft" && <ArrowLeft size={20} color={theme.colors.text} />}
                        {iconType === "Plus" && <Plus size={20} color={theme.colors.text} />}
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{title}</Text>
                </>
            }
            {position === "right_title" &&
                <>
                    <Text style={styles.headerTitle}>{title}</Text>
                    <TouchableOpacity onPress={onPress} style={styles.backBtn}>
                        {iconType === "ArrowLeft" && <ArrowLeft size={20} color={theme.colors.text} />}
                        {iconType === "Plus" && <Plus size={20} color={theme.colors.text} />}
                    </TouchableOpacity>
                </>
            }
        </View>
    );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: theme.colors.border,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -10,
    },
    headerTitle: {
        color: theme.colors.text,
        fontSize: theme.typography.subtitle,
        fontWeight: '700',
    },
})
