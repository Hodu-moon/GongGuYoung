import { useState } from 'react'
import { useNotifications } from '../lib/notification-context'

export function FCMTest() {
  const [memberId, setMemberId] = useState<number>(1)
  const [isInitializing, setIsInitializing] = useState(false)
  const { initializeFCM, requestFCMPermission } = useNotifications()

  const handleInitFCM = async () => {
    console.log('🚀 Starting FCM test initialization...')
    setIsInitializing(true)
    
    try {
      // 권한 요청
      console.log('1️⃣ Requesting FCM permission...')
      const permissionGranted = await requestFCMPermission()
      console.log('Permission result:', permissionGranted)
      
      if (permissionGranted) {
        // FCM 초기화
        console.log('2️⃣ Initializing FCM...')
        const unsubscribe = await initializeFCM(memberId)
        console.log('FCM initialization completed, unsubscribe function:', unsubscribe)
      } else {
        console.error('❌ Permission not granted')
      }
    } catch (error) {
      console.error('❌ FCM test failed:', error)
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      padding: '20px', 
      border: '1px solid #ccc',
      borderRadius: '8px',
      zIndex: 9999,
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h3>🔥 FCM Test</h3>
      <div>
        <label>
          Member ID: 
          <input 
            type="number" 
            value={memberId} 
            onChange={(e) => setMemberId(Number(e.target.value))}
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </label>
      </div>
      <button 
        onClick={handleInitFCM} 
        disabled={isInitializing}
        style={{ 
          marginTop: '10px', 
          padding: '10px 20px', 
          background: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: isInitializing ? 'not-allowed' : 'pointer'
        }}
      >
        {isInitializing ? '초기화 중...' : '🚀 FCM 초기화 테스트'}
      </button>
      <p style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>
        브라우저 콘솔을 확인하세요!
      </p>
    </div>
  )
}