import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, MessagePayload } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

let app: any = null
let messaging: any = null

export const initializeFirebase = () => {
  try {
    console.log('🔥 Initializing Firebase...')
    console.log('🔧 Firebase config:', {
      projectId: firebaseConfig.projectId,
      messagingSenderId: firebaseConfig.messagingSenderId,
      apiKey: firebaseConfig.apiKey?.substring(0, 10) + '...',
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY?.substring(0, 10) + '...'
    })
    
    if (!app) {
      app = initializeApp(firebaseConfig)
      console.log('✅ Firebase app initialized')
      
      if ('serviceWorker' in navigator) {
        messaging = getMessaging(app)
        console.log('✅ Firebase messaging initialized')
      } else {
        console.warn('⚠️ Service Worker not supported, messaging not available')
      }
    }
    return { app, messaging }
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error)
    return { app: null, messaging: null }
  }
}

export const getFirebaseMessaging = () => {
  if (!messaging) {
    const result = initializeFirebase()
    return result.messaging
  }
  return messaging
}

export const getFCMToken = async (): Promise<string | null> => {
  try {
    console.log('🎯 Getting FCM token...')
    const messaging = getFirebaseMessaging()
    if (!messaging) {
      console.warn('⚠️ Firebase messaging not available')
      return null
    }

    console.log('🔔 Checking notification permission...')
    const permission = await Notification.requestPermission()
    console.log('🔔 Notification permission result:', permission)
    if (permission !== 'granted') {
      console.warn('⚠️ Notification permission not granted:', permission)
      return null
    }

    console.log('🔑 Requesting FCM token from Firebase...')
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
    })
    
    if (token) {
      console.log('✅ FCM token received:', token.substring(0, 20) + '...')
    } else {
      console.warn('⚠️ No FCM token received')
    }
    
    return token || null
  } catch (error) {
    console.error('❌ Error getting FCM token:', error)
    return null
  }
}

export const onForegroundMessage = (callback: (payload: MessagePayload) => void) => {
  try {
    const messaging = getFirebaseMessaging()
    if (!messaging) {
      console.warn('Firebase messaging not available')
      return () => {}
    }

    return onMessage(messaging, callback)
  } catch (error) {
    console.error('Error setting up foreground message listener:', error)
    return () => {}
  }
}