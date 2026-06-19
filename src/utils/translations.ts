/**
 * translations.ts
 *
 * [이 파일이 뭐예요?]
 *   AI Reboot Academy LMS(학습관리 시스템) 화면에 보이는 모든 "글자(텍스트)"를
 *   언어별로 한곳에 모아 둔 사전(dictionary) 파일입니다.
 *   예: 버튼에 보일 "로그인" / "Log In" 같은 문구를 미리 정의해 둡니다.
 *
 * [왜 이렇게 하나요? — i18n 개념]
 *   i18n은 "internationalization(국제화)"의 줄임말입니다.
 *   (i + 가운데 글자 18개 + n 이라서 i18n 이라고 부릅니다.)
 *   화면 코드(JSX) 안에 "로그인" 같은 글자를 직접 박아 넣으면,
 *   영어 화면을 만들 때 코드 곳곳을 다 고쳐야 해서 힘듭니다.
 *   그래서 글자는 전부 여기 사전에 모아 두고, 코드에서는 "키(key)"로 꺼내 씁니다.
 *   언어만 바꾸면(ko -> en) 같은 키로 다른 언어 글자가 나오니 유지보수가 쉽습니다.
 *
 * [어떻게 쓰나요?]
 *   보통 컴포넌트에서 t('네임스페이스.키') 형태의 헬퍼 함수로 값을 꺼냅니다.
 *   예: t('nav.home') -> 한국어면 '홈', 영어면 'Home'.
 *   여기서 'nav', 'auth' 같은 묶음 이름을 "네임스페이스(namespace)"라고 부릅니다.
 *   관련된 글자끼리 그룹으로 묶어 두면 찾기 쉽고 이름 충돌도 막을 수 있습니다.
 *
 * [TypeScript 용어 한 줄 설명]
 *   - export: 다른 파일에서 이 값을 가져다(import) 쓸 수 있게 "공개"한다는 뜻.
 *   - const: 한번 정해지면 다시 대입할 수 없는 상수. (사전 자체를 바꾸지 않으니 const)
 *   - Record<string, T>: "키가 문자열이고 값이 T 타입인 객체"를 뜻하는 TS 타입.
 *       Record<string, Record<string, unknown>> 은
 *       "문자열 키('ko','en') -> (문자열 키 -> 무엇이든)" 즉 2단계 중첩 객체라는 의미.
 *   - unknown: "타입을 아직 특정하지 않은 어떤 값"이라는 뜻. 여기선 값이 문자열일 수도,
 *       더 깊은 객체일 수도 있어서(예: site.nav) 느슨하게 unknown으로 둔 것입니다.
 *
 * [주의해야 할 점들]
 *   - 이 파일은 로직(실행되는 동작)이 전혀 없는 "순수 데이터"입니다.
 *     함수도, 부수효과(화면 그리기/통신 등)도 없습니다. 그냥 값만 들어 있습니다.
 *   - 주의: 'ko'와 'en'의 키 구조는 1:1로 똑같아야 합니다.
 *     한쪽에만 키가 있으면, 그 언어에서는 글자를 못 찾아 빈칸/오류가 날 수 있습니다.
 *     (실제로 아래 site.nav 에는 ko에만 있고 en에는 없는 키가 있습니다. 뒤에서 표시함.)
 *   - 주의: 값(문자열) 내용을 바꾸면 화면에 보이는 글자가 그대로 바뀝니다.
 *     번역 문구를 의도적으로 고칠 때만 수정하세요.
 */

// translations: 이 파일의 유일한 export. 아래 객체 하나가 곧 "다국어 사전" 전체입니다.
// 바깥 키 'ko'/'en'은 언어 코드이고, 그 안은 화면 영역별 묶음(네임스페이스)입니다.
export const translations: Record<string, Record<string, unknown>> = {
  // ===== 한국어(ko) 번역 묶음 =====
  ko: {
    // nav: 화면 맨 위 전역 메뉴(global navigation)에 보이는 라벨들.
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
      services: 'IT서비스', // 참고: itServices와 같은 문구지만 다른 키로 따로 둠(쓰이는 위치가 달라서)
      blog: '블로그'
    },
    // footer: 페이지 맨 아래(푸터) 영역의 라벨들.
    footer: {
      tagline: 'AI·바이브코딩 교육으로 청년의 새로운 시작을 만듭니다', // 푸터에 노출되는 한줄 소개 문구(슬로건)
      companyInfo: '회사 정보',
      contact: '연락처',
      quickLinks: '바로가기'
    },
    // shop: 스토어(상품 목록/카테고리) 화면의 글자들.
    shop: {
      title: '스토어',
      subtitle: '', // 주의: 빈 문자열('')도 "값 없음"이 아니라 "빈 글자"라는 정상 값입니다.
      all: '전체',
      book: '도서',
      ebook: '전자출판',
      periodical: '간행물',
      course: '강좌',
      addToCart: '담기',
      addedToCart: '완료',
      price: '가격',
      noProducts: '상품이 없습니다.', // 상품 목록이 비었을 때 보여 줄 안내 문구
      currency: '원' // 가격 뒤에 붙는 통화 단위(예: 10,000원)
    },
    // cart: 장바구니 화면의 글자들.
    cart: {
      title: '장바구니',
      empty: '비어있습니다.', // 장바구니에 담긴 상품이 없을 때
      total: '합계',
      subtotal: '소계', // 소계 = 개별 항목들의 부분 합계(할인/배송 전 금액)
      checkout: '결제',
      remove: '삭제',
      quantity: '수량',
      continueShopping: '쇼핑 계속',
      orderSummary: '주문 요약',
      items: '개' // 수량 단위(예: 3개)
    },
    // checkout: 결제(체크아웃) 화면의 글자들.
    // 주의: 키 이름이 Placeholder로 끝나는 것은 입력칸 안에 흐릿하게 보이는 "예시 안내 글자"입니다.
    //       사용자가 실제로 입력하는 값이 아니라, 어떻게 입력하면 되는지 보여 주는 힌트입니다.
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
      namePlaceholder: '홍길동', // 이름 입력칸의 예시(placeholder)
      emailPlaceholder: 'email@example.com', // 이메일 입력 형식 예시
      phonePlaceholder: '010-0000-0000', // 전화번호 입력 형식 예시
      pay: '결제하기',
      processing: '처리 중...', // 결제 요청을 보낸 뒤 응답을 기다리는 동안 보여 줄 문구
      totalAmount: '결제 금액',
      agree: '결제에 동의합니다.'
    },
    // order: 결제 완료 화면의 글자들.
    // 주의: paid/pending/failed 는 결제 "상태" 라벨입니다(완료/대기/실패).
    //       서버가 알려 준 상태 코드에 맞춰 이 중 하나를 골라 화면에 보여 줍니다.
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
      unitPrice: '단가', // 단가 = 상품 1개당 가격
      quantity: '수량',
      subtotal: '소계',
      totalAmount: '총 결제금액',
      backToShop: '스토어로',
      backToHome: '홈으로'
    },
    // auth: 인증/계정 관련 글자들(로그인, 회원가입, 프로필, 주문이력, 이미지 업로드, 비밀번호 재설정 등).
    // [배경] 이 사이트는 Supabase(백엔드 서비스)로 로그인/회원가입을 처리합니다.
    //   - 인증(authentication): "당신이 누구인지" 확인하는 과정(로그인).
    //   - 회원가입 후 이메일 인증(activate)을 거치는 흐름이라 checkEmail 같은 안내 문구가 있습니다.
    //   - 아래 Error로 끝나는 키들은 실패했을 때 사용자에게 보여 줄 오류 메시지입니다.
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
      noAccount: '계정이 없으신가요?', // 로그인 화면에서 "회원가입 하러 가기" 유도 문구
      hasAccount: '이미 계정이 있으신가요?', // 회원가입 화면에서 "로그인 하러 가기" 유도 문구
      loginError: '로그인에 실패했습니다.',
      signUpError: '회원가입에 실패했습니다.',
      passwordMismatch: '비밀번호가 일치하지 않습니다.', // 비밀번호/비밀번호확인이 다를 때
      passwordTooShort: '비밀번호는 6자 이상이어야 합니다.', // 최소 길이 검증 실패 시
      loggingIn: '로그인 중...', // 로그인 요청 처리 중(버튼 비활성 상태 등에서 사용)
      signingUp: '가입 중...',
      signUpSuccess: '회원가입이 완료되었습니다!',
      checkEmail: '이메일을 확인하여 계정을 활성화해주세요.', // 가입 후 이메일 인증 안내
      goToLogin: '로그인 페이지로',
      myPage: '마이페이지',
      editProfile: '프로필 수정',
      profileUpdated: '프로필이 수정되었습니다.',
      save: '저장',
      saving: '저장 중...',
      noName: '이름 없음', // 표시 이름이 비어 있을 때 대체로 보여 줄 문구
      back: '뒤로',
      loginWith: '로그인:', // "로그인: 이메일 계정" 처럼 뒤에 수단 이름을 붙여 쓰는 라벨
      emailAccount: '이메일 계정',
      admin: '관리자',
      orderHistory: '주문 이력',
      orderDate: '주문일',
      orderAmount: '결제금액',
      noOrders: '주문 이력이 없습니다.',
      orderLoadError: '불러오기 실패.', // 주문 이력을 서버에서 가져오다 실패했을 때
      retry: '다시 시도',
      soldOut: '품절',
      uploadImage: '이미지 업로드',
      dragOrClick: '드래그 또는 클릭', // 파일 업로드 영역 안내(끌어놓거나 클릭해서 선택)
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
    // search: 사이트 전체를 대상으로 하는 통합 검색 UI 글자들.
    // 주의: blog/board/gallery 는 검색 결과를 나눠 보여 주는 "콘텐츠 유형 탭" 라벨입니다.
    search: {
      placeholder: '검색어를 입력하세요...',
      searching: '검색 중...', // 검색 요청을 보내고 결과를 기다리는 동안
      noResults: '검색 결과가 없습니다.',
      hint: '사이트 내 콘텐츠를 검색합니다.',
      blog: '블로그',
      board: '게시판',
      gallery: '갤러리'
    },
    // comments: 댓글 컴포넌트에서 쓰는 글자들.
    // 주의: loginRequired 는 로그인하지 않은 사람이 댓글을 쓰려 할 때 보여 줄 안내입니다.
    comments: {
      title: '댓글',
      loading: '로딩 중...',
      empty: '댓글이 없습니다.',
      placeholder: '댓글을 입력하세요...',
      submit: '댓글 작성',
      submitting: '작성 중...', // 댓글 등록 요청 처리 중
      delete: '삭제',
      deleteConfirm: '삭제하시겠습니까?', // 삭제 전 확인창 문구
      loginRequired: '로그인이 필요합니다.'
    },
    // community: 커뮤니티 화면에서 공통으로 쓰는 작은 버튼/상태 글자들.
    community: {
      cancel: '취소',
      loading: '로딩 중...'
    },
    // common: 특정 한 화면이 아니라 여러 화면에서 두루 재사용되는 공통 글자들.
    common: {
      learnMore: '자세히 보기',
      contactUs: '문의하기'
    },
    // site: AI Reboot Academy 사이트 "안쪽" 전용 콘텐츠 영역(학사/커리큘럼/LMS 등)의 글자 그룹.
    // 위의 nav/footer가 사이트 "껍데기"라면, site.* 는 교육 과정 본문 화면들의 글자입니다.
    // 주의: site 안에는 nav, home 처럼 또 다른 묶음이 들어 있어 "객체 안의 객체"(중첩) 구조입니다.
    //       그래서 꺼낼 때는 t('site.nav.about') 처럼 점(.)을 여러 번 타고 들어갑니다.
    site: {
      // site.nav: 교육 과정 화면 안에서 쓰는 보조 내비게이션(학사 메뉴) 라벨들.
      // assessment*/project* 처럼 접두어가 같은 키들은 한 주제의 세부 단계를 나타냅니다.
      nav: {
        about: 'About',
        curriculum: '커리큘럼',
        schedule: '일정표',
        instructor: '강사소개',
        classroom: '온라인강의실', // 주의: 이 키는 ko에만 있고 en.site.nav에는 없습니다(키 불일치 사례).
        prerequisite: '선수과정',
        regular: '정규과정',
        coaching: '기술코칭',
        assessment: '학습평가',
        assessmentPre: '선수평가',
        assessmentDiag: '진단평가',
        assessmentSum: '사후평가',
        competition: '경진대회',
        competitionInfo: '경진대회 안내',
        competitionPreGroup: '사전평가',
        competitionPreEval: '프로젝트 사전평가',
        competitionEvalSummary: '프로젝트 사전평가 집계표',
        competitionResultGroup: '결과평가',
        competitionResult: '프로젝트 결과평가',
        competitionResultSummary: '프로젝트 결과평가 집계표',
        projectGuide: '프로젝트 안내',
        project: '프로젝트',
        projectIntro: '프로젝트 아이디어 예시',
        teamActivities: '팀 활동',
        projectVote: '프로젝트 팀구성',
        projectChecklist: '수행 점검 · 할 일',
        projectTimeline: '프로젝트 일정 · 마일스톤',
        projectRubric: '평가 기준 · 루브릭',
        projectSubmit: '산출물 제출',
        projectPadlets: '팀별 패들렛',
        projectResults: '프로젝트 결과',
        projectTeams: '프로젝트 구성',
        projectBoard: '프로젝트 관리',
        projectApps: '프로젝트 구현 예시',
        pbl: 'PBL활동',
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
      // site.home: 홈(랜딩) 페이지의 큰 제목(히어로)과 각 섹션 소개 문구.
      // ("히어로 hero"는 페이지 맨 위에 크게 들어가는 대표 영역을 부르는 흔한 용어입니다.)
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
      // site.curriculum: 커리큘럼 페이지의 제목/부제(부제 = 제목 아래 보조 설명).
      curriculum: {
        title: '커리큘럼',
        subtitle: '선수과정 20H + 정규과정 DT 52H + 기술코칭 8H = 총 80시간'
      },
      // site.schedule: 일정표 페이지의 제목/부제.
      schedule: {
        title: '일정표',
        subtitle: '2026년 6월 1일 ~ 6월 22일 교육 일정'
      },
      // site.competition: 경진대회 안내 페이지의 제목/부제.
      competition: {
        title: 'AI 리부트 경진대회',
        subtitle: '국내 LLM 활용 AI 서비스 개발 경진대회 안내'
      },
      // site.resources: 학습자료 페이지의 제목/부제.
      resources: {
        title: '학습자료',
        subtitle: 'DreamIT 사에서 만든 학습 사이트와 외부 자료·도구를 분야별로'
      },
      // site.instructor: 강사소개 페이지의 제목/부제.
      instructor: {
        title: '강사소개',
        subtitle: 'AI Reboot Academy 교육진 안내'
      },
      // site.learning: 과정별 "학습 노트" 페이지의 제목/부제 묶음.
      // 선수(prerequisite)/정규(regular)/코칭(coaching) 3개 트랙으로 다시 나뉩니다.
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
  // ===== 영어(en) 번역 묶음 =====
  // 주의: 아래 en은 위 ko와 "똑같은 키 구조"를 유지해야 같은 t('...') 호출이 양쪽에서 동작합니다.
  // 코드 작성 스타일 메모: ko는 키를 한 줄에 하나씩 폈고, en은 공간 절약을 위해
  //   일부 묶음을 한 줄(`{ ... }`)로 압축했습니다. 들여쓰기/줄바꿈만 다를 뿐 의미는 동일합니다.
  en: {
    // nav: 전역 메뉴 라벨(영문).
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
    // footer: 푸터 영역 라벨(영문).
    footer: {
      tagline: 'Empowering youth restart with AI and vibe coding education',
      companyInfo: 'Company Info',
      contact: 'Contact',
      quickLinks: 'Quick Links'
    },
    // shop: 스토어 화면 글자(영문). 한 줄로 압축했지만 ko.shop과 키는 동일합니다.
    shop: { title: 'Store', subtitle: '', all: 'All', book: 'Books', ebook: 'E-books', periodical: 'Periodicals', course: 'Courses', addToCart: 'Add', addedToCart: 'Added', price: 'Price', noProducts: 'No products.', currency: 'KRW' },
    // cart: 장바구니 화면 글자(영문).
    cart: { title: 'Cart', empty: 'Empty.', total: 'Total', subtotal: 'Subtotal', checkout: 'Checkout', remove: 'Remove', quantity: 'Qty', continueShopping: 'Continue', orderSummary: 'Summary', items: 'items' },
    // checkout: 결제 화면 글자(영문). Placeholder 키는 입력칸 예시 텍스트.
    checkout: { title: 'Checkout', orderSummary: 'Summary', paymentMethod: 'Payment', card: 'Card', bankTransfer: 'Transfer', customerInfo: 'Info', name: 'Name', email: 'Email', phone: 'Phone', namePlaceholder: 'John Doe', emailPlaceholder: 'email@example.com', phonePlaceholder: '010-0000-0000', pay: 'Pay', processing: 'Processing...', totalAmount: 'Total', agree: 'I agree.' },
    // order: 주문 완료 화면 글자(영문). paid/pending/failed는 결제 상태 라벨.
    order: { title: 'Order Complete', success: 'Payment completed!', orderNumber: 'Order #', paymentStatus: 'Status', paid: 'Paid', pending: 'Pending', failed: 'Failed', orderDetails: 'Details', productName: 'Product', unitPrice: 'Price', quantity: 'Qty', subtotal: 'Subtotal', totalAmount: 'Total', backToShop: 'Store', backToHome: 'Home' },
    // auth: 인증/계정 글자(영문). 키 구조는 ko.auth와 동일합니다.
    auth: {
      login: 'Log In', logout: 'Log Out', signUp: 'Sign Up',
      loginTitle: 'Log In', loginSubtitle: 'Sign in to your account',
      signUpTitle: 'Sign Up', signUpSubtitle: 'Create a new account',
      email: 'Email', emailPlaceholder: 'email@example.com',
      password: 'Password', passwordPlaceholder: 'Enter password',
      passwordConfirm: 'Confirm', passwordConfirmPlaceholder: 'Re-enter password',
      displayName: 'Name', displayNamePlaceholder: 'Your name',
      // 주의: 아래 noAccount 값은 작은따옴표(')가 글자 안에 들어 있어서, 문자열을 큰따옴표(")로 감쌌습니다.
      //   만약 작은따옴표로 감싸면("No account?"가 아니라 'No account?'처럼) 따옴표가 꼬여 문법 오류가 납니다.
      //   (작은따옴표 안에 작은따옴표를 넣으려면 백슬래시로 이스케이프해야 하므로 큰따옴표가 더 깔끔합니다.)
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
      // 주의: 아래 값도 안전을 위해 큰따옴표(")로 감싼 형태입니다.
      //   (작은따옴표가 들어갈 가능성이 있는 영어 문구는 큰따옴표로 감싸 두면 실수가 줄어듭니다.)
      forgotPasswordSubtitle: "Enter your email for a reset link.",
      sendResetLink: 'Send Link', sending: 'Sending...',
      resetEmailSent: 'Reset email sent.', checkEmailForReset: 'Check your email.',
      backToLogin: 'Back to Login'
    },
    // search: 통합 검색 UI 글자(영문).
    search: { placeholder: 'Search...', searching: 'Searching...', noResults: 'No results.', hint: 'Search content.', blog: 'Blog', board: 'Board', gallery: 'Gallery' },
    // comments: 댓글 컴포넌트 글자(영문).
    comments: { title: 'Comments', loading: 'Loading...', empty: 'No comments.', placeholder: 'Write...', submit: 'Post', submitting: 'Posting...', delete: 'Delete', deleteConfirm: 'Delete?', loginRequired: 'Login required.' },
    // community: 커뮤니티 공용 글자(영문).
    community: { cancel: 'Cancel', loading: 'Loading...' },
    // common: 여러 화면 공용 글자(영문).
    common: { learnMore: 'Learn More', contactUs: 'Contact' },
    // site: 교육 과정 본문 화면 글자 그룹(영문). ko.site와 동일한 중첩 구조.
    site: {
      // site.nav: 보조 내비게이션 라벨(영문).
      // 주의: ko.site.nav에는 있는 classroom('온라인강의실') 키가 여기 en에는 빠져 있습니다.
      //   이런 "키 불일치"가 있으면 영어 모드에서 t('site.nav.classroom')은 값을 못 찾습니다.
      //   (실수로 빠진 것일 수 있어 점검 대상이지만, 지금은 코드를 바꾸지 않고 사실만 표시합니다.)
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
        competitionInfo: 'Competition Info',
        competitionPreGroup: 'Pre-evaluation',
        competitionPreEval: 'Project Pre-evaluation',
        competitionEvalSummary: 'Pre-evaluation Summary',
        competitionResultGroup: 'Final Evaluation',
        competitionResult: 'Project Final Evaluation',
        competitionResultSummary: 'Final Evaluation Summary',
        projectGuide: 'Projects',
        project: 'Projects',
        projectIntro: 'Idea Examples',
        teamActivities: 'Team Activities',
        projectVote: 'Team Setup',
        projectChecklist: 'Checklist · To-do',
        projectTimeline: 'Schedule · Milestones',
        projectRubric: 'Rubric',
        projectSubmit: 'Submit Deliverable',
        projectPadlets: 'Team Padlets',
        projectResults: 'Results',
        projectTeams: 'Team Setup',
        projectBoard: 'Team Board',
        projectApps: 'Demo Apps',
        pbl: 'PBL Activity',
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
      // site.home: 홈(랜딩) 페이지 문구(영문).
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
      // site.curriculum: 커리큘럼 페이지(영문).
      curriculum: { title: 'Curriculum', subtitle: 'Prerequisites 20H + DT Course 52H + Coaching 8H = 80 Hours Total' },
      // site.schedule: 일정표 페이지(영문).
      schedule: { title: 'Schedule', subtitle: 'June 1 - June 22, 2026 Education Schedule' },
      // site.competition: 경진대회 안내 페이지(영문).
      competition: { title: 'AI Reboot Competition', subtitle: 'AI Service Development Competition Guide' },
      // site.resources: 학습자료 페이지(영문).
      resources: { title: 'Resources', subtitle: 'AI Tools, LLMs, Dev Tools, and References' },
      // site.instructor: 강사소개 페이지(영문).
      instructor: { title: 'Instructors', subtitle: 'AI Reboot Academy Teaching Staff' },
      // site.learning: 과정별 학습 노트 페이지(영문). 선수/정규/코칭 3개 트랙.
      learning: {
        prerequisite: { title: 'Prerequisites Notes', subtitle: 'AI Basics, Prompts, LLM, Dev Setup (4 Days, 20H)' },
        regular: { title: 'Main Course Notes', subtitle: 'Vibe Coding, Web Dev, Projects (13 Days, 52H)' },
        coaching: { title: 'Coaching Notes', subtitle: 'Expert 1:1 Coaching (4 Sessions, 8H)' }
      }
    }
  }
};
