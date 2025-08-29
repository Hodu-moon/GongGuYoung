importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js')

// Firebase 웹앱 실제 설정값
const firebaseConfig = {
  apiKey: "AIzaSyAzOy6NpFpYPEF6C39OJ6jLigsGRotej-k",
  authDomain: "gongguyoung-8126f.firebaseapp.com",
  projectId: "gongguyoung-8126f",
  storageBucket: "gongguyoung-8126f.firebasestorage.app",
  messagingSenderId: "134888657646",
  appId: "1:134888657646:web:afd2e52b920063bc4319ff",
  measurementId: "G-4LBDL05GCM"
}

firebase.initializeApp(firebaseConfig)

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload)
  
  const notificationTitle = payload.notification?.title || 'GongGuYoung'
  const notificationOptions = {
    body: payload.notification?.body || 'New notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: payload.data,
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: '확인'
      },
      {
        action: 'close',
        title: '닫기'
      }
    ]
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()

  if (event.action === 'open' || event.action === '') {
    const urlToOpen = event.notification.data?.actionUrl || '/'
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          for (const client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              client.navigate(urlToOpen)
              return client.focus()
            }
          }
          
          if (clients.openWindow) {
            return clients.openWindow(self.location.origin + urlToOpen)
          }
        })
    )
  }
})