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

// 시연용 커스텀 시나리오들
export interface DemoScenario {
  name: string;
  description: string;
  result: CreditResult;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    name: "모범 학생",
    description: "우수한 성적과 다양한 활동을 보여주는 이상적인 학생",
    result: {
      bnplLimit: 450000,
      riskScore: 15,
      reasons: [
        "전공 특성상 높은 취업률과 안정적 미래 소득 예상",
        "과거 BNPL 사용에서 100% 정시 상환 이력",
        "LinkedIn 보유 및 전문성 콘텐츠 게시로 미래 계획성 확인"
      ],
      aiInsights: {
        personalityAssessment: "매우 책임감 있고 계획적인 성향을 보임. 학업과 커리어에 대한 명확한 목표 의식이 있으며, 금융 관리 능력이 우수함",
        riskFactors: ["없음 - 모든 지표가 긍정적"],
        strengths: [
          "완벽한 BNPL 상환 이력",
          "높은 학업 성취도 (GPA 4.2+)",
          "적극적인 전문성 개발",
          "균형잡힌 소득-지출 관리",
          "강한 사회적 책임감"
        ],
        recommendations: "현재 수준을 유지하면서 더 큰 금액의 금융 상품 이용을 고려해볼 수 있습니다. 졸업 후 신용카드 한도 상향도 가능할 것으로 예상됩니다."
      }
    }
  },
  {
    name: "위험 학생",
    description: "여러 위험 요소를 가진 고위험 학생 사례",
    result: {
      bnplLimit: 80000,
      riskScore: 75,
      reasons: [
        "과거 BNPL 연체 이력이 다수 확인됨",
        "낮은 캠퍼스 참여도로 학업 성실성 의문",
        "불규칙한 소득과 높은 신용카드 사용률"
      ],
      aiInsights: {
        personalityAssessment: "충동적 소비 성향과 계획성 부족이 우려됨. 단기적 만족을 위한 의사결정 패턴이 관찰되며, 장기적 금융 계획 능력 부족",
        riskFactors: [
          "평균 5일 연체로 상환 의지 의문",
          "도서관 이용 거의 없음 (월 3시간)",
          "과도한 신용카드 사용 (heavy)",
          "소셜미디어 활동 없어 성향 파악 어려움"
        ],
        strengths: [
          "아르바이트로 일정 소득 확보",
          "부모 동의 완료로 가족 지원 가능성"
        ],
        recommendations: "금융 교육 프로그램 수강을 권장합니다. 소액 거래부터 시작하여 상환 실적을 쌓은 후 한도 증액을 고려하시기 바랍니다."
      }
    }
  },
  {
    name: "평균 학생",
    description: "일반적인 수준의 평범한 학생 사례",
    result: {
      bnplLimit: 200000,
      riskScore: 45,
      reasons: [
        "평균적인 학업 성취도와 출석률",
        "제한적인 BNPL 사용 경험으로 리스크 판단 어려움",
        "적절한 캠퍼스 생활과 소셜미디어 활동"
      ],
      aiInsights: {
        personalityAssessment: "안정적이고 평범한 성향. 큰 위험 요소는 없으나 특별한 강점도 부각되지 않음. 표준적인 대학생 라이프스타일 유지",
        riskFactors: [
          "BNPL 사용 이력 부족으로 상환 패턴 예측 어려움",
          "특별한 전문성 개발 활동 부족"
        ],
        strengths: [
          "꾸준한 학업 유지 (GPA 3.2)",
          "규칙적인 도서관 이용 (월 40시간)",
          "적절한 사회적 활동 참여"
        ],
        recommendations: "현재 수준에서 BNPL을 경험해보며 금융 이력을 쌓아가시기 바랍니다. 성실한 상환으로 신용도를 높일 수 있습니다."
      }
    }
  },
  {
    name: "신입생",
    description: "갓 입학한 신입생으로 데이터가 부족한 경우",
    result: {
      bnplLimit: 120000,
      riskScore: 60,
      reasons: [
        "신입생으로 충분한 대학 생활 데이터 부족",
        "BNPL 사용 이력 없어 상환 패턴 예측 불가",
        "높은 부모 관여도로 일정 수준 안전성 확보"
      ],
      aiInsights: {
        personalityAssessment: "아직 대학 환경에 적응 중인 단계. 성향 파악을 위한 충분한 데이터가 축적되지 않았으나, 기본적인 책임감은 보유한 것으로 판단",
        riskFactors: [
          "대학 생활 경험 부족",
          "금융 거래 이력 미미",
          "독립적 의사결정 경험 부족"
        ],
        strengths: [
          "부모 동의 및 지원 체계 확보",
          "새로운 환경에 대한 적응 의지",
          "기본 서류 준비 성실성"
        ],
        recommendations: "소액 거래부터 시작하여 대학 생활과 금융 관리 경험을 쌓아가시기 바랍니다. 1학기 후 재평가를 통해 한도 조정이 가능합니다."
      }
    }
  }
];

/**
 * 시연용 AI 평가 - 빠른 시나리오 선택
 */
export const evaluateWithDemoScenario = async (
  studentData: StudentData, 
  scenarioName: string
): Promise<CreditResult> => {
  return evaluateStudentCredit(studentData, scenarioName);
};

/**
 * 사용 가능한 시연 시나리오 목록 조회
 */
export const getAvailableDemoScenarios = (): { name: string; description: string }[] => {
  return DEMO_SCENARIOS.map(scenario => ({
    name: scenario.name,
    description: scenario.description
  }));
};

/**
 * 시연용 학생 데이터 프리셋
 */
export const DEMO_STUDENT_DATA: Record<string, StudentData> = {
  "모범학생": {
    studentId: "2021001234",
    university: "서울대학교",
    major: "컴퓨터공학과",
    semester: 6,
    gpa: 4.3,
    totalCredits: 120,
    attendanceRate: 98,
    scholarshipHistory: true,
    studentCouncilActivity: true,
    clubActivity: true,
    hasStudentCard: true,
    hasEnrollmentCertificate: true,
    parentConsent: true,
    // AI 특화 데이터
    previousBnplUsage: {
      totalUsed: 5,
      onTimePayments: 5,
      latePayments: 0,
      averagePaymentDelay: 0
    },
    socialMediaActivity: {
      hasLinkedIn: true,
      hasInstagram: true,
      postFrequency: 'medium',
      professionalContent: true
    },
    campusEngagement: {
      libraryUsageHours: 80,
      cafeteriaSpending: 120000,
      eventParticipation: 8,
      studyGroupActivity: true
    },
    financialBehavior: {
      hasPartTimeJob: true,
      monthlyIncome: 800000,
      savingsAccount: true,
      creditCardUsage: 'light'
    },
    personalityTraits: {
      responses: [
        "계획적으로 미리 준비하는 편입니다",
        "약속은 반드시 지키려고 노력합니다",
        "새로운 기술을 배우는 것을 좋아합니다",
        "팀 프로젝트에서 책임감 있게 참여합니다"
      ]
    }
  },
  "위험학생": {
    studentId: "2020005678",
    university: "지방대학교",
    major: "예술학과",
    semester: 8,
    gpa: 2.1,
    totalCredits: 80,
    attendanceRate: 65,
    scholarshipHistory: false,
    studentCouncilActivity: false,
    clubActivity: false,
    hasStudentCard: true,
    hasEnrollmentCertificate: true,
    parentConsent: false,
    previousBnplUsage: {
      totalUsed: 8,
      onTimePayments: 3,
      latePayments: 5,
      averagePaymentDelay: 12
    },
    socialMediaActivity: {
      hasLinkedIn: false,
      hasInstagram: true,
      postFrequency: 'high',
      professionalContent: false
    },
    campusEngagement: {
      libraryUsageHours: 5,
      cafeteriaSpending: 200000,
      eventParticipation: 1,
      studyGroupActivity: false
    },
    financialBehavior: {
      hasPartTimeJob: false,
      monthlyIncome: 200000,
      savingsAccount: false,
      creditCardUsage: 'heavy'
    },
    personalityTraits: {
      responses: [
        "일단 하고 싶은 건 바로 해야 해요",
        "계획보다는 즉흥적인 게 좋아요",
        "돈 관리는 어려워서 잘 모르겠어요",
        "나중에 생각해보면 되죠"
      ]
    }
  },
  "평균학생": {
    studentId: "2021002468",
    university: "중앙대학교",
    major: "경영학과",
    semester: 4,
    gpa: 3.2,
    totalCredits: 75,
    attendanceRate: 88,
    scholarshipHistory: false,
    studentCouncilActivity: false,
    clubActivity: true,
    hasStudentCard: true,
    hasEnrollmentCertificate: true,
    parentConsent: true,
    previousBnplUsage: {
      totalUsed: 2,
      onTimePayments: 2,
      latePayments: 0,
      averagePaymentDelay: 0
    },
    socialMediaActivity: {
      hasLinkedIn: false,
      hasInstagram: true,
      postFrequency: 'low',
      professionalContent: false
    },
    campusEngagement: {
      libraryUsageHours: 40,
      cafeteriaSpending: 150000,
      eventParticipation: 3,
      studyGroupActivity: true
    },
    financialBehavior: {
      hasPartTimeJob: true,
      monthlyIncome: 500000,
      savingsAccount: true,
      creditCardUsage: 'moderate'
    },
    personalityTraits: {
      responses: [
        "보통 무난하게 생활하는 편이에요",
        "특별히 뛰어나지도 않고 나쁘지도 않아요",
        "필요할 때는 열심히 하려고 해요",
        "평범한게 좋은 거 아닌가요?"
      ]
    }
  }
};

/**
 * 시연용 AI 평가 - 커스텀 학생 데이터로 실제 AI 호출
 */
export const evaluateWithCustomData = async (customData: Partial<StudentData>): Promise<CreditResult> => {
  // 기본 데이터와 커스텀 데이터 병합
  const baseData: StudentData = {
    studentId: "DEMO001",
    university: "시연대학교",
    major: "시연학과",
    semester: 4,
    gpa: 3.5,
    totalCredits: 80,
    attendanceRate: 90,
    scholarshipHistory: false,
    studentCouncilActivity: false,
    clubActivity: false,
    hasStudentCard: true,
    hasEnrollmentCertificate: true,
    parentConsent: true
  };

  const mergedData: StudentData = {
    ...baseData,
    ...customData,
    // 중첩 객체들은 별도 처리
    previousBnplUsage: customData.previousBnplUsage ? {
      ...baseData.previousBnplUsage,
      ...customData.previousBnplUsage
    } : baseData.previousBnplUsage,
    socialMediaActivity: customData.socialMediaActivity ? {
      ...baseData.socialMediaActivity,
      ...customData.socialMediaActivity
    } : baseData.socialMediaActivity,
    campusEngagement: customData.campusEngagement ? {
      ...baseData.campusEngagement,
      ...customData.campusEngagement
    } : baseData.campusEngagement,
    financialBehavior: customData.financialBehavior ? {
      ...baseData.financialBehavior,
      ...customData.financialBehavior
    } : baseData.financialBehavior,
    personalityTraits: customData.personalityTraits ? {
      ...baseData.personalityTraits,
      ...customData.personalityTraits
    } : baseData.personalityTraits
  };

  // 실제 AI로 평가 (시나리오 모드 아님)
  return evaluateStudentCredit(mergedData);
};

/**
 * 시연용 빠른 함수들 - 실제 AI가 프리셋 데이터를 분석
 */
export const evaluatePresetStudent = {
  // 모범학생 데이터로 AI 실행
  excellent: () => evaluateStudentCredit(DEMO_STUDENT_DATA["모범학생"]),
  
  // 위험학생 데이터로 AI 실행  
  risky: () => evaluateStudentCredit(DEMO_STUDENT_DATA["위험학생"]),
  
  // 평균학생 데이터로 AI 실행
  average: () => evaluateStudentCredit(DEMO_STUDENT_DATA["평균학생"])
};

/**
 * 개발자 모드: 커스텀 결과 직접 반환
 */
export const evaluateWithCustomResult = async (
  studentData: StudentData,
  customResult: Partial<CreditResult>
): Promise<CreditResult> => {
  // 필수 조건 체크
  if (!studentData.hasStudentCard || !studentData.hasEnrollmentCertificate) {
    return {
      bnplLimit: 0,
      riskScore: 100,
      reasons: ['학생증과 재학증명서 제출이 필수입니다'],
      aiInsights: {
        personalityAssessment: '기본 인증 미완료로 평가 불가',
        riskFactors: ['필수 서류 미제출'],
        strengths: [],
        recommendations: '학생증과 재학증명서를 제출한 후 재평가 받으시기 바랍니다'
      }
    };
  }

  // 기본값과 커스텀 값 병합
  const defaultResult: CreditResult = {
    bnplLimit: 200000,
    riskScore: 50,
    reasons: ['커스텀 평가 결과'],
    aiInsights: {
      personalityAssessment: '커스텀 성향 분석',
      riskFactors: ['커스텀 위험 요소'],
      strengths: ['커스텀 강점'],
      recommendations: '커스텀 추천사항'
    }
  };

  return {
    ...defaultResult,
    ...customResult,
    aiInsights: {
      ...defaultResult.aiInsights,
      ...customResult.aiInsights
    }
  };
};

/**
 * AI 기반 학생 신용평가 시스템
 */
export const evaluateStudentCredit = async (studentData: StudentData, demoScenario?: string): Promise<CreditResult> => {
  // 시연 모드: 특정 시나리오 사용
  if (demoScenario) {
    const scenario = DEMO_SCENARIOS.find(s => s.name === demoScenario);
    if (scenario) {
      // 필수 조건 체크는 여전히 적용
      if (!studentData.hasStudentCard || !studentData.hasEnrollmentCertificate) {
        return {
          bnplLimit: 0,
          riskScore: 100,
          reasons: ['학생증과 재학증명서 제출이 필수입니다'],
          aiInsights: {
            personalityAssessment: '기본 인증 미완료로 평가 불가',
            riskFactors: ['필수 서류 미제출'],
            strengths: [],
            recommendations: '학생증과 재학증명서를 제출한 후 재평가 받으시기 바랍니다'
          }
        };
      }
      
      // 시연용 결과에 실제 학생 정보 일부 반영
      const customizedResult = {
        ...scenario.result,
        reasons: [
          ...scenario.result.reasons,
          `${studentData.university} ${studentData.major} 전공 특성 반영`,
          `GPA ${studentData.gpa}/4.5, 출석률 ${studentData.attendanceRate}% 고려`
        ]
      };
      
      return customizedResult;
    }
  }
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
- **필수 조건**: 학생증 + 재학증명서 미제출시 → 한도 0원 (절대 규칙)
- 기본 한도: 10만원 (필수 조건 충족 시)
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

  // 필수 조건 체크 - AI 호출 전에 확인
  if (!studentData.hasStudentCard || !studentData.hasEnrollmentCertificate) {
    return {
      bnplLimit: 0,
      riskScore: 100,
      reasons: ['학생증과 재학증명서 제출이 필수입니다'],
      aiInsights: {
        personalityAssessment: '기본 인증 미완료로 평가 불가',
        riskFactors: ['필수 서류 미제출'],
        strengths: [],
        recommendations: '학생증과 재학증명서를 제출한 후 재평가 받으시기 바랍니다'
      }
    };
  }

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
    
    // 필수 조건 재확인 (AI가 실수로 0원이 아닌 값을 준 경우)
    if (!studentData.hasStudentCard || !studentData.hasEnrollmentCertificate) {
      creditResult.bnplLimit = 0;
      creditResult.riskScore = 100;
    } else {
      // AI 평가는 더 넓은 범위 허용 (50만원까지)
      creditResult.bnplLimit = Math.min(Math.max(creditResult.bnplLimit, 50000), 500000);
      creditResult.riskScore = Math.min(Math.max(creditResult.riskScore, 0), 100);
    }
    
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