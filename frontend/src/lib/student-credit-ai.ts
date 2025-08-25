import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-flash" });

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
}

export interface CreditResult {
  bnplLimit: number;
  riskScore: number; // 0-100 (낮을수록 안전)
  reasons: string[];
}

/**
 * AI 기반 학생 신용평가 시스템
 */
export const evaluateStudentCredit = async (studentData: StudentData): Promise<CreditResult> => {
  const prompt = `
다음 학생 데이터를 기반으로 BNPL(선구매 후결제) 한도를 평가해주세요.

학생 정보:
- 대학: ${studentData.university}
- 전공: ${studentData.major}
- 학기: ${studentData.semester}
- 평균 학점: ${studentData.gpa}/4.5
- 이수 학점: ${studentData.totalCredits}
- 출석률: ${studentData.attendanceRate}%
- 장학금 수혜: ${studentData.scholarshipHistory ? '있음' : '없음'}
- 학생회 활동: ${studentData.studentCouncilActivity ? '있음' : '없음'}
- 동아리 활동: ${studentData.clubActivity ? '있음' : '없음'}
- 학생증 인증: ${studentData.hasStudentCard ? '완료' : '미완료'}
- 재학증명서: ${studentData.hasEnrollmentCertificate ? '제출' : '미제출'}
- 부모 동의: ${studentData.parentConsent ? '완료' : '미완료'}

평가 기준:
1. 기본 한도: 10만원 (학생증 + 재학증명서 필수)
2. 학점 보너스: 3.5 이상 (+10만원), 4.0 이상 (+15만원)
3. 출석률 보너스: 90% 이상 (+5만원), 95% 이상 (+7만원)
4. 활동 보너스: 장학금(+3만원), 학생회(+2만원), 동아리(+1만원)
5. 부모 동의 보너스: +5만원
6. 최대 한도: 30만원

위험도 평가 (0-100, 낮을수록 안전):
- 낮은 학점, 낮은 출석률 → 위험도 상승
- 활동 부족, 인증 미완료 → 위험도 상승

다음 JSON 형식으로만 응답해주세요:
{
  "bnplLimit": 한도금액(숫자),
  "riskScore": 위험도점수(숫자),
  "reasons": ["평가 근거1", "평가 근거2", "평가 근거3"]
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
    
    // 안전장치: 최대/최소 한도 제한
    creditResult.bnplLimit = Math.min(Math.max(creditResult.bnplLimit, 50000), 300000);
    creditResult.riskScore = Math.min(Math.max(creditResult.riskScore, 0), 100);
    
    return creditResult;
    
  } catch (error) {
    console.error('Student credit evaluation error:', error);
    
    // 폴백: 기본 규칙 기반 평가
    return fallbackCreditEvaluation(studentData);
  }
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