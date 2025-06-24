# Gold & Silver Trading Signals App

A comprehensive React Native Expo app for gold and silver trading signals with real-time push notifications.

## 🚀 Features

- **Real-time Trading Signals**: Live XAU/USD and XAG/USD trading signals
- **Automatic Push Notifications**: Database-triggered notifications via Supabase
- **Market Data**: Live market prices and technical indicators
- **Portfolio Tracking**: Track your trading performance
- **Economic Calendar**: Important economic events
- **Multi-platform**: Works on iOS, Android, and Web

## 🔔 Automatic Push Notification System

This app features a sophisticated automatic push notification system that triggers whenever new notifications are added to the database.

### How It Works

1. **Database Trigger**: When a new row is inserted into the `notifications` table, a PostgreSQL trigger automatically fires
2. **Edge Function Call**: The trigger calls the `send-push-notification` Edge Function
3. **Token Retrieval**: The function fetches FCM tokens for target users
4. **Push Delivery**: Notifications are sent via Firebase Cloud Messaging (FCM) and Expo Push
5. **Status Tracking**: Delivery status is logged in the `notification_logs` table

### Architecture

```
[App/Admin] → Insert into notifications table
     ↓
[DB Trigger] → Calls send-push-notification Edge Function
     ↓
[Edge Function] → Gets FCM tokens → Sends to FCM/Expo
     ↓
[Push Delivered] → Users receive notifications ✅
```

## 📱 Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd signals-application
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Create a `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
```

### 3. Database Migration

Run the SQL migrations in your Supabase SQL Editor:

1. `supabase/migrations/20250621113243_curly_scene.sql` - Creates signals table
2. `supabase/migrations/20250622160201_red_violet.sql` - Creates market_data table
3. `supabase/migrations/20250622160215_long_unit.sql` - Creates setup_steps table
4. `supabase/migrations/20250622160228_bitter_manor.sql` - Creates notifications system
5. `supabase/migrations/20250622160251_odd_tower.sql` - Creates technical indicators
6. `supabase/migrations/create_notification_trigger.sql` - Creates automatic notification trigger

### 4. Edge Functions Deployment

Deploy the Edge Functions to Supabase:

```bash
# Deploy send-push-notification function
supabase functions deploy send-push-notification

# Deploy market-data-sync function (optional)
supabase functions deploy market-data-sync
```

### 5. Firebase Setup (for Push Notifications)

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Cloud Messaging
3. Get your FCM Server Key from Project Settings > Cloud Messaging
4. Add to Supabase Edge Function secrets:

```bash
supabase secrets set FCM_SERVER_KEY=your-fcm-server-key
```

5. Add Firebase config to your `.env`:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
EXPO_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key
```

### 6. Update Database Trigger

Update the trigger function with your actual Supabase URL and service role key:

```sql
-- In Supabase SQL Editor, update the handle_new_notification function
-- Replace the placeholder values with your actual credentials
```

## 🧪 Testing Push Notifications

1. **Register Device**: Use the "Register Device" button in the Profile tab
2. **Test Notifications**: Use the notification test panel to send various types of notifications
3. **Monitor Logs**: Check the `notification_logs` table in Supabase to see delivery status

### Test Methods

- **Manual Insert**: Insert directly into the `notifications` table
- **Test Panel**: Use the built-in notification test panel
- **API Calls**: Call the Edge Function directly

## 📊 Database Schema

### Core Tables

- `signals` - Trading signals with entry, TP, SL levels
- `market_data` - Live market prices and changes
- `notifications` - Push notification records
- `notification_logs` - Delivery status tracking
- `user_profiles` - User devices and FCM tokens
- `technical_indicators` - Chart indicators (RSI, MACD, etc.)
- `economic_events` - Economic calendar events

## 🔧 Development

```bash
# Start development server
npm run dev

# Build for web
npm run build:web
```

## 🚀 Deployment

The app can be deployed to:

- **Expo EAS**: For mobile app stores
- **Vercel/Netlify**: For web deployment
- **Custom Server**: Using Expo's server output

## 📝 Environment Variables

Required environment variables:

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

# Firebase (for push notifications)
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_FIREBASE_VAPID_KEY=

# Edge Function Secrets (set via Supabase CLI)
FCM_SERVER_KEY=
```

## 🔍 Monitoring

Monitor your notification system:

1. **Supabase Dashboard**: Check Edge Function logs
2. **Notification Logs Table**: See delivery status
3. **Firebase Console**: Monitor FCM delivery metrics

## 🛠️ Troubleshooting

### Common Issues

1. **Notifications not sending**: Check FCM_SERVER_KEY is set correctly
2. **Trigger not firing**: Verify the database trigger is created
3. **Tokens not found**: Ensure users are registered with `registerForPushNotifications()`

### Debug Steps

1. Check Supabase Edge Function logs
2. Query `notification_logs` table for error messages
3. Verify FCM tokens in `user_profiles` table
4. Test Edge Function directly via HTTP

## 📄 License

MIT License - see LICENSE file for details.