# 🏫 GongGuYoung (공구영)

**2025 신한 해커톤 with SSAFY** - 캠퍼스 생활을 편리하고, 더 재미있게 만드는 헤이영 캠퍼스의 새로운 금융 서비스

> 대학생들을 위한 공동구매 플랫폼과 BNPL(Buy Now, Pay Later) 서비스를 결합한 혁신적인 캠퍼스 금융 솔루션

## ⚡ 빠른 시작

Docker Compose를 사용하여 전체 서비스를 한 번에 실행할 수 있습니다.

```bash
# 저장소 클론
git clone https://github.com/2025SinhanHackaton/GongGuYoung.git
cd GongGuYoung

# 전체 서비스 실행
docker-compose up --build -d

# 접속 확인
# Frontend: http://localhost
# Backend API: http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui/index.html
```

## 📋 프로젝트 개요

GongGuYoung은 캠퍼스 내 학생들이 함께 상품을 구매하고, 유연한 결제 옵션을 제공받을 수 있는 통합 금융 플랫폼입니다. 
공동구매를 통한 비용 절약과 BNPL을 통한 결제 부담 완화로 학생들의 경제적 부담을 줄이고 캠퍼스 생활을 더욱 풍요롭게 만듭니다.

### 접속 URL

> http://gongguyoung.jinjin99.xyz/

### 🎯 주요 기능

- **공동구매 시스템**: 학생들이 함께 참여하여 더 저렴한 가격으로 상품을 구매
- **BNPL 결제**: 지금 구매하고 나중에 결제하는 유연한 결제 시스템
- **회원 관리**: 안전한 학생 인증 및 계정 관리

## 🛠️ 기술 스택

### Backend
- **Framework**: Spring Boot 3.5.4
- **Language**: Java 17
- **Database**: MySQL 8.0, Redis 6.2
- **Build Tool**: Gradle
- **Documentation**: SpringDoc OpenAPI (Swagger)
- **External API**: SSAFY 금융 Open API

### Frontend
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS 4.0
- **UI Components**: Radix UI
- **State Management**: React Context
- **Routing**: React Router Dom 6

### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx
- **Development**: AWS EC2, Github Actions

## 🚀 개발환경 설정

### 필수 요구사항

#### 시스템 요구사항
- **Java**: 17 이상
- **Node.js**: 18 이상
- **Docker**: 20.10 이상
- **Docker Compose**: 2.0 이상

#### 개발 도구 권장사항
- **IDE**: IntelliJ IDEA (Backend), VSCode (Frontend)
- **Git**: 2.30 이상

### 환경변수 설정

#### Backend 환경변수 (application.yml)
```yaml
spring:
  profiles:
    active: local # local, docker

  datasource:
    url: jdbc:mysql://localhost:3306/gonggu_db
    username: gonggu
    password: gonggu

  data:
    redis:
      host: localhost
      port: 6379

fin-open:
  member-id: your-member-id
  api:
    base-url: https://finopenapi.ssafy.io/ssafy/api/v1/
    key: your-api-key
```

#### Frontend 환경변수 (.env)
```bash
VITE_GEMINI_API_KEY=your-gemini-api-key
```

## 🔧 설치 및 실행 방법

### Docker Compose를 이용한 전체 서비스 실행 (권장)

전체 서비스를 한 번에 실행하는 가장 간편한 방법입니다.

```bash
# 전체 서비스 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 서비스 중지
docker-compose down
```

**접속 정보:**
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui/index.html
- **MySQL**: localhost:3306
- **Redis**: localhost:6379

### 개별 서비스 실행

#### Backend 실행
```bash
cd backend

# 개발 모드 실행
./gradlew bootRun

# 또는 JAR 파일 빌드 후 실행
./gradlew build
java -jar build/libs/backend-0.0.1-SNAPSHOT.jar
```

#### Frontend 실행
```bash
cd frontend

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
npm run preview
```

### 개발 모드 실행

개발 시 코드 변경사항을 실시간으로 반영하려면:

1. **데이터베이스 서비스만 실행**
   ```bash
   docker-compose up -d mysql redis
   ```

2. **Backend 개발 모드 실행**
   ```bash
   cd backend
   ./gradlew bootRun --continuous
   ```

3. **Frontend 개발 모드 실행**
   ```bash
   cd frontend
   npm run dev
   ```

## 📚 API 문서

### Swagger UI
Backend 서버 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:
- **개발환경**: http://localhost:8080/swagger-ui/index.html
- **Docker 환경**: http://localhost:8080/swagger-ui/index.html

### 주요 API 엔드포인트

#### 🔐 인증 관련
- `POST /api/auth/login` - 로그인
- `POST /api/auth/signup` - 회원가입

#### 👥 회원 관리
- `GET /api/members/profile` - 회원 정보 조회
- `POST /api/members/deposit` - 계좌 입금

#### 🛍️ 공동구매
- `GET /api/group-purchases` - 공동구매 목록 조회
- `POST /api/group-purchases` - 공동구매 생성
- `POST /api/group-purchases/{id}/participate` - 공동구매 참여

#### 💳 결제
- `POST /api/payments` - 일반 결제
- `POST /api/payments/bnpl` - BNPL 결제
- `PUT /api/payments/bnpl/limit` - BNPL 한도 업데이트

#### 📦 상품
- `GET /api/products` - 상품 목록 조회
- `GET /api/products/{id}` - 상품 상세 조회

## 🏗️ 프로젝트 구조

### Backend 구조
```
backend/src/main/java/xyz/jinjin99/gongguyoung/backend/
├── client/              # 외부 API 클라이언트
│   └── finopen/        # 신한 금융 Open API
├── config/             # 설정 파일
├── domain/             # 도메인별 패키지
│   ├── grouppurchase/  # 공동구매
│   ├── member/         # 회원 관리
│   ├── payment/        # 결제
│   └── product/        # 상품
└── global/             # 공통 유틸리티
    ├── enums/          # 열거형
    ├── exception/      # 예외 처리
    └── utils/          # 유틸리티
```

### Frontend 구조
```
frontend/src/
├── api/                # API 호출 함수
├── components/         # React 컴포넌트
│   ├── atoms/          # 기본 컴포넌트
│   ├── molecules/      # 조합 컴포넌트
│   ├── organisms/      # 복합 컴포넌트
│   └── ui/             # UI 라이브러리
├── lib/                # 유틸리티 및 상태 관리
├── pages/              # 페이지 컴포넌트
└── styles/             # 스타일 파일
```

## 🚀 배포 및 운영

### Docker를 이용한 배포

#### 1. 전체 서비스 배포
```bash
# 프로덕션 빌드 및 실행
docker-compose up -d --build

# 서비스 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f [service-name]
```

#### 2. 개별 서비스 배포
```bash
# Backend만 재배포
docker-compose up -d --build springboot

# Frontend만 재배포
docker-compose up -d --build nginx
```

### 환경별 설정 관리

#### application.yml 프로필 구성
- `application-local.yml`: 로컬 개발환경
- `application-docker.yml`: Docker 환경 및 배포환경
- `application.yml`: 공통 설정

---

**GongGuYoung** - 캠퍼스의 새로운 금융 경험을 만들어갑니다! 🎓💰
