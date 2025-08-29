import { FCMTest } from '../components/FCMTest'

export default function FCMTestPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>FCM 테스트 페이지</h1>
      <p>브라우저 개발자 도구 콘솔을 열고 FCM 초기화 버튼을 클릭하세요.</p>
      <p>Firebase 설정값이 올바르지 않으면 구체적인 에러 메시지가 출력됩니다.</p>
      
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h3>🔧 현재 상태:</h3>
        <ul>
          <li>✅ 백엔드: Firebase Admin SDK 설정 완료</li>
          <li>✅ VAPID Key: 설정 완료</li>
          <li>✅ 프론트엔드: Firebase 웹앱 설정값 완료</li>
          <li>✅ Service Worker: firebase-messaging-sw.js 설정 완료</li>
          <li>🚀 테스트 준비: FCM 초기화 테스트 가능</li>
        </ul>
      </div>

      <FCMTest />
    </div>
  )
}