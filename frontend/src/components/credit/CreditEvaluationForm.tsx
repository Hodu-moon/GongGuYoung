import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { evaluateStudentCredit, StudentData, CreditResult } from '../../lib/student-credit-ai';

export const CreditEvaluationForm: React.FC = () => {
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
  });

  const [result, setResult] = useState<CreditResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const creditResult = await evaluateStudentCredit(studentData);
      setResult(creditResult);
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'AI 평가 중...' : '신용 평가하기'}
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};