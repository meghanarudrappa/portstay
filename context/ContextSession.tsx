import { useRouter } from "expo-router";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Alert } from "react-native";
import { API_BASE_URL } from '../app/config/api'; 

type SessionData = Record<string, any> | null;

interface SessionContextType {
    sessionData: SessionData;
    getSessionDetails: () => void;
    handleLogout: () => void;
    updateProfilePic: (newPicId: string) => void; // ADDED: Global update action item
}

const SessionContext = createContext<SessionContextType>({
    sessionData: null,
    getSessionDetails: () => { },
    handleLogout: () => { },
    updateProfilePic: () => { }, // ADDED: Placeholder default callback
});

interface SessionProviderProps {
    children: ReactNode;
}

export const SessionProvider = ({ children }: SessionProviderProps) => {
    const [sessionData, setSessionData] = useState<SessionData>(null);
    const router = useRouter();

    const getSessionDetails = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/session-details`, {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });

            const text = await response.text();
            try {
                const data = JSON.parse(text);
                console.log("se----- --", data);
                setSessionData(data ?? {});
                
                if (data.loginId !== null && data.loginId !== undefined && data.loginId !== "") {
                    const targetRoute = "/(tabs)/attendance" as const;
                    router.push(targetRoute);
                }
            }
            catch (jsonError) {
                // Handle parsing anomalies gracefully
            }
        } catch (error) {
            // Handle request lifecycle drops gracefully
        }
    };

    // ADDED: Updates the profile picture state universally in real time
    const updateProfilePic = (newPicId: string) => {
        setSessionData((prev) => {
            if (!prev) return { profile_pic: newPicId };
            return {
                ...prev,
                profile_pic: newPicId
            };
        });
    };

    const handleLogout = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/signout`, {
                method: 'GET',
                credentials: 'include',
            });
            if (response.redirected || response.ok) {
                setSessionData(null);
                router.replace('/(tabs)');
            } else {
                Alert.alert('Logout failed');
            }
        } catch (error) {
            Alert.alert('An error occurred during logout');
        }
    };

    useEffect(() => {
        getSessionDetails();
    }, []);

    return (
        <SessionContext.Provider value={{ sessionData, getSessionDetails, handleLogout, updateProfilePic }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    return useContext(SessionContext);
};