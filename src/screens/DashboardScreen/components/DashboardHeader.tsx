import { UserIcon } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../../theme/colors";
import { styles } from "../styles";
import { User } from "../../../types";

interface DashboardHeaderProps {
    user: User;
    onPressProfile: () => void;
}

export const DashboardHeader = ({ user, onPressProfile }: DashboardHeaderProps) => {
    return (
        <View style={styles.navbar}>
            <View>
                <Text style={styles.welcomeText}>OLÁ,</Text>
                <Text style={styles.userName}>{user.displayName?.toUpperCase()}</Text>
            </View>
            <TouchableOpacity onPress={() => onPressProfile()} style={styles.logoutBtn}>
                <UserIcon size={20} color={colors.text} />
            </TouchableOpacity>
        </View>
    );
};