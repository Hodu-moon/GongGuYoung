import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { evaluateStudentCredit, StudentData, CreditResult } from '../../lib/student-credit-ai';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { updateBnplLimit } from '../../api/Payment';
import { useAuth } from '../../lib/auth-context';

export const CreditEvaluationForm: React.FC = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<StudentData>({
    studentId: '',
    university: '',
    major: '',
    semester: 1,
    gpa: 0,
    totalCredits: 0,
    attendanceRate: 0,
    scholarshipHistory: false,
    studentCouncilActivity: false,
    clubActivity: false,
    hasStudentCard: false,
    hasEnrollmentCertificate: false,
    parentConsent: false,
    // AI 특화 데이터 초기값
    previousBnplUsage: {
      totalUsed: 0,
      onTimePayments: 0,
      latePayments: 0,
      averagePaymentDelay: 0
    },
    socialMediaActivity: {
      hasLinkedIn: false,
      hasInstagram: false,
      postFrequency: 'none',
      professionalContent: false
    },
    campusEngagement: {
      libraryUsageHours: 0,
      cafeteriaSpending: 0,
      eventParticipation: 0,
      studyGroupActivity: false
    },
    financialBehavior: {
      hasPartTimeJob: false,
      monthlyIncome: 0,
      savingsAccount: false,
      creditCardUsage: 'none'
    },
    personalityTraits: {
      responses: []
    }
  });

  const [result, setResult] = useState<CreditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [personalityInput, setPersonalityInput] = useState('');
  const [limitUpdated, setLimitUpdated] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const creditResult = await evaluateStudentCredit(studentData);
      setResult(creditResult);
      
      // BNPL 한도가 0보다 크고 사용자가 있을 때만 한도 업데이트
      if (creditResult.bnplLimit > 0 && user?.id) {
        try {
          const updateSuccess = await updateBnplLimit({
            memberId: user.id,
            newLimit: creditResult.bnplLimit
          });
          
          if (updateSuccess) {
            console.log('BNPL 한도가 업데이트되었습니다:', creditResult.bnplLimit);
            setLimitUpdated(true);
          } else {
            console.warn('BNPL 한도 업데이트 실패');
            setLimitUpdated(false);
          }
        } catch (limitUpdateError) {
          console.error('BNPL 한도 업데이트 오류:', limitUpdateError);
          // 한도 업데이트 실패해도 평가 결과는 보여줌
        }
      }
    } catch (error) {
      console.error('평가 실패:', error);
      alert('평가 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof StudentData, value: any) => {
    setStudentData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedInputChange = (
    parentField: keyof StudentData,
    childField: string,
    value: any
  ) => {
    setStudentData(prev => ({
      ...prev,
      [parentField]: {
        ...((prev as any)[parentField] || {}),
        [childField]: value
      }
    }));
  };

  const addPersonalityResponse = () => {
    if (personalityInput.trim()) {
      setStudentData(prev => ({
        ...prev,
        personalityTraits: {
          ...prev.personalityTraits,
          responses: [...(prev.personalityTraits?.responses || []), personalityInput.trim()]
        }
      }));
      setPersonalityInput('');
    }
  };

  const removePersonalityResponse = (index: number) => {
    setStudentData(prev => ({
      ...prev,
      personalityTraits: {
        ...prev.personalityTraits,
        responses: prev.personalityTraits?.responses?.filter((_, i) => i !== index) || []
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>학생 신용평가 시스템</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 기본 정보 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="studentId">학번</Label>
                <Input
                  id="studentId"
                  value={studentData.studentId}
                  onChange={(e) => handleInputChange('studentId', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="university">대학교</Label>
                <Input
                  id="university"
                  value={studentData.university}
                  onChange={(e) => handleInputChange('university', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="major">전공</Label>
                <Input
                  id="major"
                  value={studentData.major}
                  onChange={(e) => handleInputChange('major', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="semester">학기</Label>
                <Input
                  id="semester"
                  type="number"
                  min="1"
                  max="8"
                  value={studentData.semester}
                  onChange={(e) => handleInputChange('semester', parseInt(e.target.value))}
                  required
                />
              </div>
            </div>

            {/* 학업 성취도 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gpa">평균 학점 (4.5 만점)</Label>
                <Input
                  id="gpa"
                  type="number"
                  step="0.1"
                  min="0"
                  max="4.5"
                  value={studentData.gpa}
                  onChange={(e) => handleInputChange('gpa', parseFloat(e.target.value))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="attendanceRate">출석률 (%)</Label>
                <Input
                  id="attendanceRate"
                  type="number"
                  min="0"
                  max="100"
                  value={studentData.attendanceRate}
                  onChange={(e) => handleInputChange('attendanceRate', parseInt(e.target.value))}
                  required
                />
              </div>
            </div>

            {/* 체크박스 항목들 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasStudentCard"
                    checked={studentData.hasStudentCard}
                    onCheckedChange={(checked) => handleInputChange('hasStudentCard', !!checked)}
                  />
                  <Label htmlFor="hasStudentCard">학생증 인증</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasEnrollmentCertificate"
                    checked={studentData.hasEnrollmentCertificate}
                    onCheckedChange={(checked) => handleInputChange('hasEnrollmentCertificate', !!checked)}
                  />
                  <Label htmlFor="hasEnrollmentCertificate">재학증명서 제출</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="parentConsent"
                    checked={studentData.parentConsent}
                    onCheckedChange={(checked) => handleInputChange('parentConsent', !!checked)}
                  />
                  <Label htmlFor="parentConsent">부모 동의서</Label>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="scholarshipHistory"
                    checked={studentData.scholarshipHistory}
                    onCheckedChange={(checked) => handleInputChange('scholarshipHistory', !!checked)}
                  />
                  <Label htmlFor="scholarshipHistory">장학금 수혜 경험</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="studentCouncilActivity"
                    checked={studentData.studentCouncilActivity}
                    onCheckedChange={(checked) => handleInputChange('studentCouncilActivity', !!checked)}
                  />
                  <Label htmlFor="studentCouncilActivity">학생회 활동</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="clubActivity"
                    checked={studentData.clubActivity}
                    onCheckedChange={(checked) => handleInputChange('clubActivity', !!checked)}
                  />
                  <Label htmlFor="clubActivity">동아리 활동</Label>
                </div>
              </div>
            </div>

            {/* AI 특화 분석을 위한 고급 옵션 */}
            <div className="border-t pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full mb-4"
              >
                {showAdvanced ? '🔽 AI 고급 분석 옵션 숨기기' : '🔼 AI 고급 분석 옵션 보기'}
              </Button>

              {showAdvanced && (
                <div className="space-y-6 bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-800 mb-4">
                    💡 AI가 더 정확한 분석을 위해 사용하는 추가 데이터입니다
                  </div>

                  {/* 이전 BNPL 사용 이력 */}
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle className="text-sm">📊 이전 BNPL 사용 이력</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>총 사용 횟수</Label>
                          <Input
                            type="number"
                            min="0"
                            value={studentData.previousBnplUsage?.totalUsed || 0}
                            onChange={(e) => handleNestedInputChange('previousBnplUsage', 'totalUsed', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label>정시 상환 횟수</Label>
                          <Input
                            type="number"
                            min="0"
                            value={studentData.previousBnplUsage?.onTimePayments || 0}
                            onChange={(e) => handleNestedInputChange('previousBnplUsage', 'onTimePayments', parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>연체 횟수</Label>
                          <Input
                            type="number"
                            min="0"
                            value={studentData.previousBnplUsage?.latePayments || 0}
                            onChange={(e) => handleNestedInputChange('previousBnplUsage', 'latePayments', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label>평균 연체 일수</Label>
                          <Input
                            type="number"
                            min="0"
                            value={studentData.previousBnplUsage?.averagePaymentDelay || 0}
                            onChange={(e) => handleNestedInputChange('previousBnplUsage', 'averagePaymentDelay', parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 소셜미디어 활동 */}
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle className="text-sm">📱 소셜미디어 활동</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={studentData.socialMediaActivity?.hasLinkedIn || false}
                            onCheckedChange={(checked) => handleNestedInputChange('socialMediaActivity', 'hasLinkedIn', !!checked)}
                          />
                          <Label>LinkedIn 보유</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={studentData.socialMediaActivity?.hasInstagram || false}
                            onCheckedChange={(checked) => handleNestedInputChange('socialMediaActivity', 'hasInstagram', !!checked)}
                          />
                          <Label>Instagram 보유</Label>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>게시 빈도</Label>
                          <Select 
                            value={studentData.socialMediaActivity?.postFrequency || 'none'}
                            onValueChange={(value) => handleNestedInputChange('socialMediaActivity', 'postFrequency', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">없음</SelectItem>
                              <SelectItem value="low">낮음</SelectItem>
                              <SelectItem value="medium">보통</SelectItem>
                              <SelectItem value="high">높음</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={studentData.socialMediaActivity?.professionalContent || false}
                            onCheckedChange={(checked) => handleNestedInputChange('socialMediaActivity', 'professionalContent', !!checked)}
                          />
                          <Label>전문성 콘텐츠 게시</Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 캠퍼스 참여도 */}
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle className="text-sm">🏫 캠퍼스 참여도</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>월 도서관 이용시간</Label>
                          <Input
                            type="number"
                            min="0"
                            value={studentData.campusEngagement?.libraryUsageHours || 0}
                            onChange={(e) => handleNestedInputChange('campusEngagement', 'libraryUsageHours', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label>월 식당 지출 (원)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={studentData.campusEngagement?.cafeteriaSpending || 0}
                            onChange={(e) => handleNestedInputChange('campusEngagement', 'cafeteriaSpending', parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>학기당 행사 참여 횟수</Label>
                          <Input
                            type="number"
                            min="0"
                            value={studentData.campusEngagement?.eventParticipation || 0}
                            onChange={(e) => handleNestedInputChange('campusEngagement', 'eventParticipation', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={studentData.campusEngagement?.studyGroupActivity || false}
                            onCheckedChange={(checked) => handleNestedInputChange('campusEngagement', 'studyGroupActivity', !!checked)}
                          />
                          <Label>스터디 그룹 참여</Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 금융 행동 */}
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle className="text-sm">💰 금융 행동</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={studentData.financialBehavior?.hasPartTimeJob || false}
                            onCheckedChange={(checked) => handleNestedInputChange('financialBehavior', 'hasPartTimeJob', !!checked)}
                          />
                          <Label>아르바이트</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={studentData.financialBehavior?.savingsAccount || false}
                            onCheckedChange={(checked) => handleNestedInputChange('financialBehavior', 'savingsAccount', !!checked)}
                          />
                          <Label>적금 계좌</Label>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>월 소득 (원)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={studentData.financialBehavior?.monthlyIncome || 0}
                            onChange={(e) => handleNestedInputChange('financialBehavior', 'monthlyIncome', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label>신용카드 사용</Label>
                          <Select 
                            value={studentData.financialBehavior?.creditCardUsage || 'none'}
                            onValueChange={(value) => handleNestedInputChange('financialBehavior', 'creditCardUsage', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">없음</SelectItem>
                              <SelectItem value="light">가벼움</SelectItem>
                              <SelectItem value="moderate">보통</SelectItem>
                              <SelectItem value="heavy">많음</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 성향 질문 */}
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle className="text-sm">💭 성향 질문 답변</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="예: 계획적으로 미리 준비하는 편입니다"
                          value={personalityInput}
                          onChange={(e) => setPersonalityInput(e.target.value)}
                          className="flex-1"
                        />
                        <Button type="button" onClick={addPersonalityResponse} size="sm">
                          추가
                        </Button>
                      </div>
                      
                      {studentData.personalityTraits?.responses && studentData.personalityTraits.responses.length > 0 && (
                        <div className="space-y-2">
                          {studentData.personalityTraits.responses.map((response, index) => (
                            <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                              <span className="text-sm">{response}</span>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm"
                                onClick={() => removePersonalityResponse(index)}
                              >
                                ❌
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'AI 평가 중...' : '🤖 AI 신용 평가하기'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 평가 결과 */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>평가 결과</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {result.bnplLimit.toLocaleString()}원
                </div>
                <div className="text-sm text-gray-500">승인된 BNPL 한도</div>
                {limitUpdated && result.bnplLimit > 0 && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-sm text-green-700 font-medium">
                      ✅ BNPL 한도가 성공적으로 업데이트되었습니다!
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      이제 공동구매에서 새로운 한도를 사용할 수 있습니다.
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      한도 구성: 기본 10만원
                      {result.bnplLimit > 100000 && ' + 활동 보너스 ' + Math.min(result.bnplLimit - 100000, 200000).toLocaleString() + '원'}
                      {result.bnplLimit > 300000 && ' + AI 보너스 ' + (result.bnplLimit - 300000).toLocaleString() + '원'}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                <span>위험도 점수</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        result.riskScore < 30 ? 'bg-green-500' : 
                        result.riskScore < 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${result.riskScore}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{result.riskScore}/100</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">평가 근거</h4>
                <ul className="space-y-1">
                  {result.reasons.map((reason, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      • {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {/* AI 심층 분석 결과 */}
              {result.aiInsights && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-4 text-blue-800">🤖 AI 심층 분석 결과</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 성향 분석 */}
                    <Card className="bg-blue-50 border-blue-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-blue-800">💭 성향 분석</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-blue-900">{result.aiInsights.personalityAssessment}</p>
                      </CardContent>
                    </Card>

                    {/* 추천사항 */}
                    <Card className="bg-green-50 border-green-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-green-800">💡 추천사항</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-green-900">{result.aiInsights.recommendations}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {/* 위험 요소 */}
                    <Card className="bg-red-50 border-red-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-red-800">⚠️ 주요 위험 요소</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1">
                          {result.aiInsights.riskFactors.map((factor, index) => (
                            <li key={index} className="text-sm text-red-900">
                              • {factor}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* 강점 */}
                    <Card className="bg-emerald-50 border-emerald-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-emerald-800">✨ 주요 강점</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1">
                          {result.aiInsights.strengths.map((strength, index) => (
                            <li key={index} className="text-sm text-emerald-900">
                              • {strength}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};