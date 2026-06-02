import { ArrowLeft, Plus, X } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../theme/colors";

type iconType = "ArrowLeft" | "Plus" | "None"
type positionType = "left_title" | "right_title"

export default function Header({ iconType, onPress, title, position }: { iconType: iconType, onPress: () => void; title: string, position: positionType }) {
    return (
        <View style={styles.header}>
            {position === "left_title" &&
                <>
                    <TouchableOpacity onPress={onPress} style={styles.backBtn}>
                        {iconType === "ArrowLeft" && <ArrowLeft size={20} color={colors.text} />}
                        {iconType === "Plus" && <Plus size={20} color={colors.text} />}
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{title}</Text>
                </>
            }
            {position === "right_title" &&
                <>
                    <Text style={styles.headerTitle}>{title}</Text>
                    <TouchableOpacity onPress={onPress} style={styles.backBtn}>
                        {iconType === "ArrowLeft" && <ArrowLeft size={20} color={colors.text} />}
                        {iconType === "Plus" && <Plus size={20} color={colors.text} />}
                    </TouchableOpacity>
                </>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border,
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
        color: colors.text,
        fontSize: 20,
        fontWeight: '700',
    },
})