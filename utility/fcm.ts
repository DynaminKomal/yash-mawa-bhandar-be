import { initializeApp, cert, getApps, App } from "firebase-admin/app";
import { getMessaging, MulticastMessage } from "firebase-admin/messaging";
import User from "../models/users.model";

let app: App | undefined;

if (!getApps().length) {
    try {
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            app = initializeApp({
                credential: cert(serviceAccount),
            });
        } else if (
            process.env.FIREBASE_PROJECT_ID &&
            process.env.FIREBASE_CLIENT_EMAIL &&
            process.env.FIREBASE_PRIVATE_KEY
        ) {
            app = initializeApp({
                credential: cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
                }),
            });
        } else {
            console.warn(
                "Firebase Admin credentials (FIREBASE_SERVICE_ACCOUNT or FIREBASE_PROJECT_ID) not provided in .env."
            );
        }
    } catch (error) {
        console.error("Firebase Admin initialization error:", error);
    }
} else {
    app = getApps()[0];
}

export interface SendFCMNotificationOptions {
    title: string;
    body: string;
    data?: Record<string, string>;
}

export const sendAdminFCMNotification = async ({
    title,
    body,
    data,
}: SendFCMNotificationOptions) => {
    try {
        if (!getApps().length) {
            console.warn("FCM skipped: Firebase Admin app not initialized.");
            return;
        }

        // Find active admin users with registered FCM tokens
        const adminUsers = await User.find({
            role: "admin",
            fcmToken: { $exists: true, $ne: "" },
            isActive: true,
        }).select("fcmToken");

        const tokens = adminUsers
            .map((u) => u.fcmToken)
            .filter((t): t is string => Boolean(t && t.trim().length > 0));

        if (tokens.length === 0) {
            console.log("No registered admin FCM tokens found.");
            return;
        }

        const message: MulticastMessage = {
            notification: {
                title,
                body,
            },
            data: data || {},
            tokens,
        };

        const messaging = getMessaging();
        const response = await messaging.sendEachForMulticast(message);
        console.log(
            `Successfully sent FCM notification to ${response.successCount} admin devices.`
        );
        if (response.failureCount > 0) {
            console.warn(`Failed to send FCM to ${response.failureCount} devices.`);
        }
    } catch (error) {
        console.error("Error sending admin FCM notification:", error);
    }
};
