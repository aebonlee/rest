/**
 * translations.ts
 *
 * 역할: AI Reboot Academy LMS의 다국어(i18n) 문자열 사전(dictionary)을 정의하는 파일.
 *       UI에서 사용하는 모든 표시 문자열을 언어별/도메인별로 모아 둔 정적 데이터 모듈이다.
 *
 * 핵심 책임:
 *   - 'ko'(한국어)와 'en'(영어) 두 언어에 대해 동일한 키 구조로 번역 문자열을 제공.
 *   - 화면 영역/기능별 네임스페이스(nav, footer, shop, cart, checkout, order, auth,
 *     search, comments, community, common, site 등)로 문자열을 그룹화.
 *   - 컴포넌트는 보통 t('네임스페이스.키') 형태의 헬퍼로 이 사전을 조회한다.
 *
 * 주요 export:
 *   - translations: 언어 코드(string) -> 네임스페이스/키 트리(Record<string, unknown>) 매핑 객체.
 *
 * 주의사항:
 *   - 이 파일은 로직이 없는 순수 데이터 사전이다. 함수/부수효과 없음.
 *   - 'ko'와 'en'의 키 구조는 1:1로 일치해야 한다. 한쪽에만 키가 있으면 해당 언어에서 누락 발생.
 *   - 값은 모두 일반 문자열 리터럴이며, 표시 텍스트이므로 문자열 내용을 임의로 바꾸면 UI가 바뀐다.
 */
export const translations: Record<string, Record<string, unknown>> = {
  // ===== 한국어(ko) 번역 묶음 =====
  ko: {
    // 상단 글로벌 내비게이션 메뉴 라벨
    nav: {
      home: '홈',
      itServices: 'IT서비스',
      education: '교육',
      publishing: '출판',
      portfolio: '포트폴리오',
      community: '커뮤니티',
      consulting: '컨설팅',
      about: '회사소개',
      contact: '연락처',
      rnd: '연구개발',
      services: 'IT서비스',
      blog: '블로그'
    },
    // 페이지 하단 푸터 영역 라벨
    footer: {
      tagline: 'AI·바이브코딩 교육으로 청년의 새로운 시작을 만듭니다',
      companyInfo: '회사 정보',
      contact: '연락처',
      quickLinks: '바로가기'
    },
    // 스토어(상품 목록/카테고리) 화면 문자열
    shop: {
      title: '스토어',
      subtitle: '',
      all: '전체',
      book: '도서',
      ebook: '전자출판',
      periodical: '간행물',
      course: '강좌',
      addToCart: '담기',
      addedToCart: '완료',
      price: '가격',
      noProducts: '상품이 없습니다.',
      currency: '원'
    },
    // 장바구니 화면 문자열
    cart: {
      title: '장바구니',
      empty: '비어있습니다.',
      total: '합계',
      subtotal: '소계',
      checkout: '결제',
      remove: '삭제',
      quantity: '수량',
      continueShopping: '쇼핑 계속',
      orderSummary: '주문 요약',
      items: '개'
    },
    // 결제(체크아웃) 화면 문자열 - placeholder 키는 입력 폼의 예시 텍스트
    checkout: {
      title: '결제',
      orderSummary: '주문 요약',
      paymentMethod: '결제 수단',
      card: '카드',
      bankTransfer: '계좌이체',
      customerInfo: '주문자 정보',
      name: '이름',
      email: '이메일',
      phone: '전화번호',
      namePlaceholder: '홍길동',
      emailPlaceholder: 'email@example.com',
      phonePlaceholder: '010-0000-0000',
      pay: '결제하기',
      processing: '처리 중...',
      totalAmount: '결제 금액',
      agree: '결제에 동의합니다.'
    },
    // 주문 완료 화면 문자열 - paid/pending/failed는 결제 상태 라벨
    order: {
      title: '주문 완료',
      success: '결제가 완료되었습니다!',
      orderNumber: '주문번호',
      paymentStatus: '결제 상태',
      paid: '결제 완료',
      pending: '대기 중',
      failed: '실패',
      orderDetails: '주문 내역',
      productName: '상품명',
      unitPrice: '단가',
      quantity: '수량',
      subtotal: '소계',
      totalAmount: '총 결제금액',
      backToShop: '스토어로',
      backToHome: '홈으로'
    },
    // 인증/계정 관련 문자열 (로그인, 회원가입, 프로필, 주문이력, 이미지 업로드, 비밀번호 재설정 등)
    // Placeholder 및 에러 메시지 키 포함 - Supabase 인증 흐름 UI에서 사용
    auth: {
      login: '로그인',
      logout: '로그아웃',
      signUp: '회원가입',
      loginTitle: '로그인',
      loginSubtitle: '계정에 로그인하세요',
      signUpTitle: '회원가입',
      signUpSubtitle: '새 계정을 만들어보세요',
      email: '이메일',
      emailPlaceholder: 'email@example.com',
      password: '비밀번호',
      passwordPlaceholder: '비밀번호를 입력하세요',
      passwordConfirm: '비밀번호 확인',
      passwordConfirmPlaceholder: '비밀번호를 다시 입력하세요',
      displayName: '이름',
      displayNamePlaceholder: '표시될 이름을 입력하세요',
      or: '또는',
      noAccount: '계정이 없으신가요?',
      hasAccount: '이미 계정이 있으신가요?',
      loginError: '로그인에 실패했습니다.',
      signUpError: '회원가입에 실패했습니다.',
      passwordMismatch: '비밀번호가 일치하지 않습니다.',
      passwordTooShort: '비밀번호는 6자 이상이어야 합니다.',
      loggingIn: '로그인 중...',
      signingUp: '가입 중...',
      signUpSuccess: '회원가입이 완료되었습니다!',
      checkEmail: '이메일을 확인하여 계정을 활성화해주세요.',
      goToLogin: '로그인 페이지로',
      myPage: '마이페이지',
      editProfile: '프로필 수정',
      profileUpdated: '프로필이 수정되었습니다.',
      save: '저장',
      saving: '저장 중...',
      noName: '이름 없음',
      back: '뒤로',
      loginWith: '로그인:',
      emailAccount: '이메일 계정',
      admin: '관리자',
      orderHistory: '주문 이력',
      orderDate: '주문일',
      orderAmount: '결제금액',
      noOrders: '주문 이력이 없습니다.',
      orderLoadError: '불러오기 실패.',
      retry: '다시 시도',
      soldOut: '품절',
      uploadImage: '이미지 업로드',
      dragOrClick: '드래그 또는 클릭',
      uploading: '업로드 중...',
      uploadComplete: '완료.',
      removeImage: '삭제',
      forgotPassword: '비밀번호를 잊으셨나요?',
      forgotPasswordTitle: '비밀번호 재설정',
      forgotPasswordSubtitle: '가입 이메일을 입력하면 재설정 링크를 보내드립니다.',
      sendResetLink: '재설정 링크 보내기',
      sending: '전송 중...',
      resetEmailSent: '재설정 이메일이 전송되었습니다.',
      checkEmailForReset: '이메일의 링크를 클릭하여 비밀번호를 재설정하세요.',
      backToLogin: '로그인으로 돌아가기'
    },
    // 통합 검색 UI 문자열 - blog/board/gallery는 검색 대상 콘텐츠 유형 탭
    search: {
      placeholder: '검색어를 입력하세요...',
      searching: '검색 중...',
      noResults: '검색 결과가 없습니다.',
      hint: '사이트 내 콘텐츠를 검색합니다.',
      blog: '블로그',
      board: '게시판',
      gallery: '갤러리'
    },
    // 댓글 컴포넌트 문자열 - loginRequired는 비로그인 상태에서 작성 시도 시 표시
    comments: {
      title: '댓글',
      loading: '로딩 중...',
      empty: '댓글이 없습니다.',
      placeholder: '댓글을 입력하세요...',
      submit: '댓글 작성',
      submitting: '작성 중...',
      delete: '삭제',
      deleteConfirm: '삭제하시겠습니까?',
      loginRequired: '로그인이 필요합니다.'
    },
    // 커뮤니티 공용 버튼/상태 문자열
    community: {
      cancel: '취소',
      loading: '로딩 중...'
    },
    // 여러 화면에서 재사용되는 공통 문자열
    common: {
      learnMore: '자세히 보기',
      contactUs: '문의하기'
    },
    // AI Reboot Academy 사이트 전용 콘텐츠 영역(학사/커리큘럼/LMS 등) 문자열 그룹
    site: {
      // 사이트 내부 보조 내비게이션(학사 메뉴) 라벨 - assessment*/project* 등 세부 단계 포함
      nav: {
        about: 'About',
        curriculum: '커리큘럼',
        schedule: '일정표',
        instructor: '강사소개',
        classroom: '온라인강의실',
        prerequisite: '선수과정',
        regular: '정규과정',
        coaching: '기술코칭',
        assessment: '학습평가',
        assessmentPre: '선수평가',
        assessmentDiag: '진단평가',
        assessmentSum: '사후평가',
        competition: '경진대회',
        projectGuide: '프로젝트 안내',
        project: '프로젝트',
        projectIntro: '프로젝트 아이디어 예시',
        projectVote: '프로젝트 팀구성',
        projectTeams: '프로젝트 구성',
        projectBoard: '프로젝트 관리',
        projectApps: '프로젝트 구현 예시',
        resources: '학습자료',
        lms: '학습관리',
        dashboard: '대시보드',
        announcements: '공지사항',
        materials: '강의자료',
        assignments: '과제',
        teams: '팀',
        projects: '프로젝트',
        qna: 'Q&A'
      },
      // 홈(랜딩) 페이지 히어로/섹션 문구
      home: {
        title: 'AI Reboot Academy',
        subtitle: '쉬었음청년 AI·바이브코딩 교육과정',
        description: 'AI 기술과 바이브코딩으로 새로운 커리어를 시작하세요. 6월 1일부터 22일까지, 실전 프로젝트와 AI 리부트 경진대회 출품을 목표로 합니다.',
        viewCurriculum: '커리큘럼 보기',
        applyNow: '수강 신청',
        courseOverview: '과정 개요',
        courseOverviewDesc: '선수과정, 정규과정 DT, 기술코칭으로 구성된 체계적인 교육 프로그램',
        projectOutputs: '프로젝트 산출물',
        projectOutputsDesc: '단계별 프로젝트를 통해 실전 역량을 키웁니다',
        competition: 'AI 리부트 경진대회',
        competitionDesc: '국내 LLM을 활용한 AI 서비스 개발 경진대회',
        eligibility: '교육 안내'
      },
      // 커리큘럼 페이지 제목/부제
      curriculum: {
        title: '커리큘럼',
        subtitle: '선수과정 20H + 정규과정 DT 52H + 기술코칭 8H = 총 80시간'
      },
      // 일정표 페이지 제목/부제
      schedule: {
        title: '일정표',
        subtitle: '2026년 6월 1일 ~ 6월 22일 교육 일정'
      },
      // 경진대회 안내 페이지 제목/부제
      competition: {
        title: 'AI 리부트 경진대회',
        subtitle: '국내 LLM 활용 AI 서비스 개발 경진대회 안내'
      },
      // 학습자료 페이지 제목/부제
      resources: {
        title: '학습자료',
        subtitle: 'DreamIT 사에서 만든 학습 사이트와 외부 자료·도구를 분야별로'
      },
      // 강사소개 페이지 제목/부제
      instructor: {
        title: '강사소개',
        subtitle: 'AI Reboot Academy 교육진 안내'
      },
      // 학습 노트(과정별) 페이지 제목/부제 - 선수/정규/코칭 3개 트랙
      learning: {
        prerequisite: {
          title: '선수과정 학습 노트',
          subtitle: 'AI 기초·프롬프트·LLM·개발환경 (4일, 20H)'
        },
        regular: {
          title: '정규과정 학습 노트',
          subtitle: '바이브코딩·웹개발·프로젝트 (13일, 52H)'
        },
        coaching: {
          title: '기술코칭 학습 노트',
          subtitle: '전문가 1:1 코칭 (4회, 8H)'
        }
      }
    }
  },
  // ===== 영어(en) 번역 묶음 - 위 ko와 동일한 키 구조를 유지해야 함 =====
  en: {
    // 상단 글로벌 내비게이션 메뉴 라벨(영문)
    nav: {
      home: 'Home',
      itServices: 'IT Services',
      education: 'Education',
      publishing: 'Publishing',
      portfolio: 'Portfolio',
      community: 'Community',
      consulting: 'Consulting',
      about: 'About',
      contact: 'Contact',
      rnd: 'R&D',
      services: 'IT Services',
      blog: 'Blog'
    },
    // 푸터 영역 라벨(영문)
    footer: {
      tagline: 'Empowering youth restart with AI and vibe coding education',
      companyInfo: 'Company Info',
      contact: 'Contact',
      quickLinks: 'Quick Links'
    },
    // 스토어 화면 문자열(영문) - 공간 절약을 위해 한 줄로 작성
    shop: { title: 'Store', subtitle: '', all: 'All', book: 'Books', ebook: 'E-books', periodical: 'Periodicals', course: 'Courses', addToCart: 'Add', addedToCart: 'Added', price: 'Price', noProducts: 'No products.', currency: 'KRW' },
    // 장바구니 화면 문자열(영문)
    cart: { title: 'Cart', empty: 'Empty.', total: 'Total', subtotal: 'Subtotal', checkout: 'Checkout', remove: 'Remove', quantity: 'Qty', continueShopping: 'Continue', orderSummary: 'Summary', items: 'items' },
    // 결제(체크아웃) 화면 문자열(영문)
    checkout: { title: 'Checkout', orderSummary: 'Summary', paymentMethod: 'Payment', card: 'Card', bankTransfer: 'Transfer', customerInfo: 'Info', name: 'Name', email: 'Email', phone: 'Phone', namePlaceholder: 'John Doe', emailPlaceholder: 'email@example.com', phonePlaceholder: '010-0000-0000', pay: 'Pay', processing: 'Processing...', totalAmount: 'Total', agree: 'I agree.' },
    // 주문 완료 화면 문자열(영문)
    order: { title: 'Order Complete', success: 'Payment completed!', orderNumber: 'Order #', paymentStatus: 'Status', paid: 'Paid', pending: 'Pending', failed: 'Failed', orderDetails: 'Details', productName: 'Product', unitPrice: 'Price', quantity: 'Qty', subtotal: 'Subtotal', totalAmount: 'Total', backToShop: 'Store', backToHome: 'Home' },
    // 인증/계정 관련 문자열(영문) - 키 구조는 ko.auth와 동일
    auth: {
      login: 'Log In', logout: 'Log Out', signUp: 'Sign Up',
      loginTitle: 'Log In', loginSubtitle: 'Sign in to your account',
      signUpTitle: 'Sign Up', signUpSubtitle: 'Create a new account',
      email: 'Email', emailPlaceholder: 'email@example.com',
      password: 'Password', passwordPlaceholder: 'Enter password',
      passwordConfirm: 'Confirm', passwordConfirmPlaceholder: 'Re-enter password',
      displayName: 'Name', displayNamePlaceholder: 'Your name',
      // noAccount는 작은따옴표(') 포함 문구라 큰따옴표로 감쌈
      or: 'or', noAccount: "No account?", hasAccount: 'Have an account?',
      loginError: 'Login failed.', signUpError: 'Sign up failed.',
      passwordMismatch: 'Passwords do not match.', passwordTooShort: 'Min 6 chars.',
      loggingIn: 'Logging in...', signingUp: 'Signing up...',
      signUpSuccess: 'Sign up successful!', checkEmail: 'Check your email.',
      goToLogin: 'Go to Login', myPage: 'My Page', editProfile: 'Edit Profile',
      profileUpdated: 'Updated.', save: 'Save', saving: 'Saving...',
      noName: 'No name', back: 'Back', loginWith: 'Login:', emailAccount: 'Email',
      admin: 'Admin', orderHistory: 'Orders', orderDate: 'Date', orderAmount: 'Amount',
      noOrders: 'No orders.', orderLoadError: 'Load failed.', retry: 'Retry',
      soldOut: 'Sold Out', uploadImage: 'Upload', dragOrClick: 'Drag or click',
      uploading: 'Uploading...', uploadComplete: 'Done.', removeImage: 'Remove',
      forgotPassword: 'Forgot password?', forgotPasswordTitle: 'Reset Password',
      // 작은따옴표(your) 포함 문구라 큰따옴표 사용
      forgotPasswordSubtitle: "Enter your email for a reset link.",
      sendResetLink: 'Send Link', sending: 'Sending...',
      resetEmailSent: 'Reset email sent.', checkEmailForReset: 'Check your email.',
      backToLogin: 'Back to Login'
    },
    // 통합 검색 UI 문자열(영문)
    search: { placeholder: 'Search...', searching: 'Searching...', noResults: 'No results.', hint: 'Search content.', blog: 'Blog', board: 'Board', gallery: 'Gallery' },
    // 댓글 컴포넌트 문자열(영문)
    comments: { title: 'Comments', loading: 'Loading...', empty: 'No comments.', placeholder: 'Write...', submit: 'Post', submitting: 'Posting...', delete: 'Delete', deleteConfirm: 'Delete?', loginRequired: 'Login required.' },
    // 커뮤니티 공용 문자열(영문)
    community: { cancel: 'Cancel', loading: 'Loading...' },
    // 공통 재사용 문자열(영문)
    common: { learnMore: 'Learn More', contactUs: 'Contact' },
    // AI Reboot Academy 사이트 전용 콘텐츠 문자열 그룹(영문)
    site: {
      // 사이트 내부 보조 내비게이션 라벨(영문) - 단, ko.site.nav 대비 classroom 키는 영문 측에 없음(엣지케이스)
      nav: {
        about: 'About',
        curriculum: 'Curriculum',
        schedule: 'Schedule',
        instructor: 'Instructors',
        prerequisite: 'Prerequisites',
        regular: 'Main Course',
        coaching: 'Coaching',
        assessment: 'Assessment',
        assessmentPre: 'Pre-test',
        assessmentDiag: 'Diagnostic',
        assessmentSum: 'Post-test',
        competition: 'Competition',
        projectGuide: 'Projects',
        project: 'Projects',
        projectIntro: 'Idea Examples',
        projectVote: 'Team Setup',
        projectTeams: 'Team Setup',
        projectBoard: 'Team Board',
        projectApps: 'Demo Apps',
        resources: 'Resources',
        lms: 'LMS',
        dashboard: 'Dashboard',
        announcements: 'Notices',
        materials: 'Materials',
        assignments: 'Assignments',
        teams: 'Teams',
        projects: 'Projects',
        qna: 'Q&A'
      },
      // 홈(랜딩) 페이지 문구(영문)
      home: {
        title: 'AI Reboot Academy',
        subtitle: 'AI & Vibe Coding for Youth Restart',
        description: 'Start your new career with AI technology and vibe coding. From June 1 to 22, aim for real-world projects and AI Reboot Competition.',
        viewCurriculum: 'View Curriculum',
        applyNow: 'Apply Now',
        courseOverview: 'Course Overview',
        courseOverviewDesc: 'Structured program with prerequisites, DT course, and tech coaching',
        projectOutputs: 'Project Outputs',
        projectOutputsDesc: 'Build real-world skills through phased projects',
        competition: 'AI Reboot Competition',
        competitionDesc: 'AI service development competition using domestic LLMs',
        eligibility: 'Program Info'
      },
      // 커리큘럼 페이지(영문)
      curriculum: { title: 'Curriculum', subtitle: 'Prerequisites 20H + DT Course 52H + Coaching 8H = 80 Hours Total' },
      // 일정표 페이지(영문)
      schedule: { title: 'Schedule', subtitle: 'June 1 - June 22, 2026 Education Schedule' },
      // 경진대회 안내 페이지(영문)
      competition: { title: 'AI Reboot Competition', subtitle: 'AI Service Development Competition Guide' },
      // 학습자료 페이지(영문)
      resources: { title: 'Resources', subtitle: 'AI Tools, LLMs, Dev Tools, and References' },
      // 강사소개 페이지(영문)
      instructor: { title: 'Instructors', subtitle: 'AI Reboot Academy Teaching Staff' },
      // 학습 노트(과정별) 페이지(영문) - 선수/정규/코칭 3개 트랙
      learning: {
        prerequisite: { title: 'Prerequisites Notes', subtitle: 'AI Basics, Prompts, LLM, Dev Setup (4 Days, 20H)' },
        regular: { title: 'Main Course Notes', subtitle: 'Vibe Coding, Web Dev, Projects (13 Days, 52H)' },
        coaching: { title: 'Coaching Notes', subtitle: 'Expert 1:1 Coaching (4 Sessions, 8H)' }
      }
    }
  }
};
