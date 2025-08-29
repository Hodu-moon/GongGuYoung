import { useAuth } from '../lib/auth-context'
import { useNotifications } from '../lib/notification-context'

export function FCMDebug() {
  const { user, loading } = useAuth()
  const { isInitialized, notifications, unreadCount, initializeFCM, addNotification } = useNotifications()

  const handleManualInit = async () => {
    if (user) {
      try {
        console.log('🔧 Manual FCM initialization for user:', user.id)
        await initializeFCM(Number(user.id))
        console.log('✅ Manual FCM initialization completed')
      } catch (error) {
        console.error('❌ Manual FCM initialization failed:', error)
      }
    } else {
      console.warn('⚠️ No user logged in')
    }
  }

  const handleTestNotification = () => {
    addNotification({
      userId: user?.id || '1',
      type: 'system_update',
      title: '🧪 테스트 알림',
      message: 'notification-bell에서 이 메시지가 보이면 성공!',
      isRead: false,
      priority: 'high'
    })
  }

  const handleBackendTest = async () => {
    if (user) {
      try {
        const response = await fetch('/api/fcm/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            memberId: Number(user.id),
            title: '🚀 백엔드 FCM 테스트',
            message: 'FCM 푸시 알림이 정상 작동합니다!'
          })
        })
        
        if (response.ok) {
          console.log('✅ Backend FCM test request sent successfully')
        } else {
          console.error('❌ Backend FCM test failed:', response.statusText)
        }
      } catch (error) {
        console.error('❌ Backend FCM test error:', error)
      }
    }
  }

  const handleGroupPurchaseExpiryTest = async () => {
    try {
      // 테스트용 그룹 구매 ID (실제 DB에 있는 ID로 변경 필요)
      const testGroupPurchaseId = '1'
      console.log('🧪 그룹 구매 만료 테스트 시작 - ID:', testGroupPurchaseId)
      
      const response = await fetch(`/api/fcm/test/group-purchase-expiry/${testGroupPurchaseId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const result = await response.text()
      
      if (response.ok) {
        console.log('✅ 그룹 구매 만료 테스트 성공:', result)
      } else {
        console.error('❌ 그룹 구매 만료 테스트 실패:', result)
      }
    } catch (error) {
      console.error('❌ 그룹 구매 만료 테스트 에러:', error)
    }
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      left: '10px', 
      background: 'white', 
      padding: '15px', 
      border: '1px solid #ccc',
      borderRadius: '8px',
      zIndex: 9999,
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      fontSize: '12px',
      maxWidth: '300px'
    }}>
      <h3>🐛 FCM Debug Info</h3>
      <div>
        <strong>로그인 상태:</strong><br/>
        - Loading: {loading ? 'Yes' : 'No'}<br/>
        - User: {user ? `${user.fullName} (ID: ${user.id})` : 'Not logged in'}<br/>
        - Email: {user?.email || 'N/A'}
      </div>
      <br/>
      <div>
        <strong>FCM 상태:</strong><br/>
        - Initialized: {isInitialized ? 'Yes' : 'No'}<br/>
        - Notifications: {notifications.length}<br/>
        - Unread: {unreadCount}
      </div>
      <br/>
      <div>
        <strong>테스트 버튼:</strong><br/>
        <button onClick={handleManualInit} disabled={!user || isInitialized} style={{ margin: '2px', padding: '4px 8px', fontSize: '10px' }}>
          🔧 FCM 수동 초기화
        </button><br/>
        <button onClick={handleTestNotification} style={{ margin: '2px', padding: '4px 8px', fontSize: '10px' }}>
          🧪 로컬 알림 테스트
        </button><br/>
        <button onClick={handleBackendTest} disabled={!user} style={{ margin: '2px', padding: '4px 8px', fontSize: '10px' }}>
          🚀 백엔드 FCM 테스트
        </button><br/>
        <button onClick={handleGroupPurchaseExpiryTest} style={{ margin: '2px', padding: '4px 8px', fontSize: '10px' }}>
          ⏰ 그룹 구매 만료 테스트
        </button>
      </div>
      <br/>
      <div style={{ fontSize: '10px', color: '#666' }}>
        콘솔 로그를 확인하세요!
      </div>
    </div>
  )
}