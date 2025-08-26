import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface StudentData {
  // 기본 정보
  studentId: string;
  university: string;
  major: string;
  semester: number;
  
  // 학업 성취도
  gpa: number; // 4.5 만점
  totalCredits: number;
  
  // 출석 및 활동
  attendanceRate: number; // 퍼센트
  scholarshipHistory: boolean;
  studentCouncilActivity: boolean;
  clubActivity: boolean;
  
  // 기타 인증
  hasStudentCard: boolean;
  hasEnrollmentCertificate: boolean;
  parentConsent: boolean;
  
  // AI 특화 판단 요소들
  previousBnplUsage?: {
    totalUsed: number;
    onTimePayments: number;
    latePayments: number;
    averagePaymentDelay: number; // 일 단위
  };
  socialMediaActivity?: {
    hasLinkedIn: boolean;
    hasInstagram: boolean;
    postFrequency: 'high' | 'medium' | 'low' | 'none';
    professionalContent: boolean;
  };
  campusEngagement?: {
    libraryUsageHours: number; // 월 평균
    cafeteriaSpending: number; // 월 평균
    eventParticipation: number; // 학기당 참여 횟수
    studyGroupActivity: boolean;
  };
  financialBehavior?: {
    hasPartTimeJob: boolean;
    monthlyIncome: number;
    savingsAccount: boolean;
    creditCardUsage: 'heavy' | 'moderate' | 'light' | 'none';
  };
  personalityTraits?: {
    responses: string[]; // 간단한 성향 질문 답변들
  };
}

export interface CreditResult {
  bnplLimit: number;
  riskScore: number; // 0-100 (낮을수록 안전)
  reasons: string[];
  aiInsights?: {
    personalityAssessment: string;
    riskFactors: string[];
    strengths: string[];
    recommendations: string;
  };
}

/**
 * AI 기반 학생 신용평가 시스템
 */
export const evaluateStudentCredit = async (studentData: StudentData): Promise<CreditResult> => {
  // AI가 필요한 복합적 판단 요소들을 프롬프트에 추가
  const complexFactorsText = buildComplexFactorsText(studentData);
  
  const prompt = `
당신은 학생 신용평가 전문가입니다. 다음 학생 데이터를 종합적으로 분석하여 BNPL 한도를 평가해주세요.

=== 기본 학생 정보 ===
- 대학: ${studentData.university}
- 전공: ${studentData.major} (전공별 취업률과 소득 수준을 고려하세요)
- 학기: ${studentData.semester} (졸업 임박 여부가 신용도에 미치는 영향 분석)
- 평균 학점: ${studentData.gpa}/4.5
- 이수 학점: ${studentData.totalCredits}
- 출석률: ${studentData.attendanceRate}%
- 장학금 수혜: ${studentData.scholarshipHistory ? '있음' : '없음'}
- 학생회 활동: ${studentData.studentCouncilActivity ? '있음' : '없음'}
- 동아리 활동: ${studentData.clubActivity ? '있음' : '없음'}
- 학생증 인증: ${studentData.hasStudentCard ? '완료' : '미완료'}
- 재학증명서: ${studentData.hasEnrollmentCertificate ? '제출' : '미제출'}
- 부모 동의: ${studentData.parentConsent ? '완료' : '미완료'}

${complexFactorsText}

=== AI 전문가로서의 종합 판단 요청 ===
다음 복합적 요소들을 AI의 패턴 인식 능력으로 분석해주세요:

1. **전공-성향-소비패턴 연관성**: 전공과 개인 성향, 소비 패턴 간의 상관관계
2. **다면적 리스크 평가**: 단순 합산이 아닌 요소 간 상호작용 분석
3. **미래 변화 예측**: 현재 데이터로부터 미래 상환 능력 변화 예측
4. **개인화된 권장사항**: 해당 학생만의 특성에 맞는 맞춤형 금융 조언

기본 규칙:
- 기본 한도: 10만원 (학생증 + 재학증명서 필수)
- 학점/출석률/활동 보너스는 상호 보완적으로 평가
- 최대 한도: 50만원 (AI 판단 시 30만원 제한 해제)

다음 JSON 형식으로 응답해주세요:
{
  "bnplLimit": 한도금액(숫자),
  "riskScore": 위험도점수(숫자),
  "reasons": ["AI 판단 근거1", "AI 판단 근거2", "AI 판단 근거3"],
  "aiInsights": {
    "personalityAssessment": "성향 분석 결과",
    "riskFactors": ["주요 위험 요소들"],
    "strengths": ["강점 요소들"],
    "recommendations": "개인화된 금융 조언"
  }
}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // JSON 파싱
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI 응답을 파싱할 수 없습니다');
    }
    
    const creditResult: CreditResult = JSON.parse(jsonMatch[0]);
    
    // AI 평가는 더 넓은 범위 허용 (50만원까지)
    creditResult.bnplLimit = Math.min(Math.max(creditResult.bnplLimit, 50000), 500000);
    creditResult.riskScore = Math.min(Math.max(creditResult.riskScore, 0), 100);
    
    return creditResult;
    
  } catch (error) {
    console.error('Student credit evaluation error:', error);
    
    // 폴백: 기본 규칙 기반 평가
    return fallbackCreditEvaluation(studentData);
  }
};

/**
 * AI가 분석해야 할 복합적 요소들을 텍스트로 구성
 */
const buildComplexFactorsText = (studentData: StudentData): string => {
  let text = "\n=== AI 특화 분석 데이터 ===\n";
  
  if (studentData.previousBnplUsage) {
    const { totalUsed, onTimePayments, latePayments, averagePaymentDelay } = studentData.previousBnplUsage;
    const successRate = totalUsed > 0 ? (onTimePayments / totalUsed * 100).toFixed(1) : '0';
    text += `
**이전 BNPL 사용 이력** (AI 패턴 분석 필요):
- 총 사용 횟수: ${totalUsed}회
- 정시 상환: ${onTimePayments}회 (성공률: ${successRate}%)
- 연체: ${latePayments}회
- 평균 연체 일수: ${averagePaymentDelay}일
→ AI 분석: 사용 패턴에서 신용도 트렌드 예측`;
  }
  
  if (studentData.socialMediaActivity) {
    const { hasLinkedIn, hasInstagram, postFrequency, professionalContent } = studentData.socialMediaActivity;
    text += `

**소셜미디어 활동 패턴** (AI 성향 분석):
- LinkedIn: ${hasLinkedIn ? '있음' : '없음'}
- Instagram: ${hasInstagram ? '있음' : '없음'}  
- 게시 빈도: ${postFrequency}
- 전문성 콘텐츠: ${professionalContent ? '있음' : '없음'}
→ AI 분석: 디지털 발자국을 통한 책임감/미래지향성 평가`;
  }
  
  if (studentData.campusEngagement) {
    const { libraryUsageHours, cafeteriaSpending, eventParticipation, studyGroupActivity } = studentData.campusEngagement;
    text += `

**캠퍼스 참여도** (AI 라이프스타일 분석):
- 도서관 이용시간: 월 ${libraryUsageHours}시간
- 식당 지출: 월 ${cafeteriaSpending.toLocaleString()}원
- 행사 참여: 학기당 ${eventParticipation}회
- 스터디 그룹: ${studyGroupActivity ? '참여중' : '미참여'}
→ AI 분석: 학업 몰입도와 사회적 책임감의 상관관계`;
  }
  
  if (studentData.financialBehavior) {
    const { hasPartTimeJob, monthlyIncome, savingsAccount, creditCardUsage } = studentData.financialBehavior;
    text += `

**금융 행동 패턴** (AI 리스크 예측):
- 아르바이트: ${hasPartTimeJob ? '있음' : '없음'}
- 월 소득: ${monthlyIncome.toLocaleString()}원
- 적금 계좌: ${savingsAccount ? '보유' : '미보유'}
- 신용카드 사용: ${creditCardUsage}
→ AI 분석: 소득-지출-저축 균형을 통한 금융 성숙도 평가`;
  }
  
  if (studentData.personalityTraits?.responses.length) {
    text += `

**성향 질문 답변** (AI 심리 분석):
${studentData.personalityTraits.responses.map((response, index) => 
  `- 질문 ${index + 1}: "${response}"`
).join('\n')}
→ AI 분석: 언어 패턴과 가치관을 통한 신뢰도 평가`;
  }
  
  if (text === "\n=== AI 특화 분석 데이터 ===\n") {
    text += "\n(추가 데이터 없음 - 기본 정보만으로 AI 패턴 분석 수행)";
  }
  
  return text;
};

/**
 * 폴백: 규칙 기반 신용평가
 */
const fallbackCreditEvaluation = (studentData: StudentData): CreditResult => {
  let limit = 0;
  let riskScore = 50;
  const reasons: string[] = [];
  
  // 기본 인증 확인
  if (!studentData.hasStudentCard || !studentData.hasEnrollmentCertificate) {
    return {
      bnplLimit: 0,
      riskScore: 100,
      reasons: ['기본 인증(학생증, 재학증명서)이 필요합니다']
    };
  }
  
  // 기본 한도
  limit = 100000;
  reasons.push('기본 인증 완료 (10만원)');
  
  // 학점 평가
  if (studentData.gpa >= 4.0) {
    limit += 150000;
    riskScore -= 20;
    reasons.push('우수한 학점 (4.0+) 보너스 +15만원');
  } else if (studentData.gpa >= 3.5) {
    limit += 100000;
    riskScore -= 10;
    reasons.push('양호한 학점 (3.5+) 보너스 +10만원');
  } else if (studentData.gpa < 2.5) {
    riskScore += 20;
    reasons.push('낮은 학점으로 위험도 증가');
  }
  
  // 출석률 평가
  if (studentData.attendanceRate >= 95) {
    limit += 70000;
    riskScore -= 10;
    reasons.push('우수한 출석률 (95%+) 보너스 +7만원');
  } else if (studentData.attendanceRate >= 90) {
    limit += 50000;
    riskScore -= 5;
    reasons.push('양호한 출석률 (90%+) 보너스 +5만원');
  }
  
  // 활동 보너스
  if (studentData.scholarshipHistory) {
    limit += 30000;
    riskScore -= 5;
    reasons.push('장학금 수혜 보너스 +3만원');
  }
  
  if (studentData.parentConsent) {
    limit += 50000;
    riskScore -= 10;
    reasons.push('부모 동의 보너스 +5만원');
  }
  
  // 한도 제한
  limit = Math.min(limit, 300000);
  riskScore = Math.max(Math.min(riskScore, 100), 0);
  
  return { bnplLimit: limit, riskScore, reasons };
};