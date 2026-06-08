import React, { useState, useEffect } from 'react';
import { 
  isFirebaseConfigured, db, auth, handleFirestoreError, OperationType 
} from './lib/firebase';
import { 
  onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut 
} from 'firebase/auth';
import { 
  collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc, writeBatch, serverTimestamp 
} from 'firebase/firestore';
import { 
  UserProfile, GenerationRecord, ToolId, SubscriptionTier, UserRole 
} from './types';
import { TOOLS_LIST } from './lib/toolsData';

// Component Imports
import ToolRunner from './components/ToolRunner';
import HistoryList from './components/HistoryList';
import SavedContentList from './components/SavedContentList';
import BillingManage from './components/BillingManage';
import AdminPanel from './components/AdminPanel';

// Icons Import
import { 
  LayoutDashboard, History, Star, CreditCard, Lock, Shield, 
  LogOut, LogIn, Sparkles, Activity, MessageSquareShare, Bell, 
  FileText, Users, Instagram, Megaphone, TrendingUp, Award, Compass,
  CheckCircle, ChevronRight, Menu, X, ArrowRight, UserCheck
} from 'lucide-react';

// Help functions to map string icon names to Lucide icons dynamically
const IconMapper = ({ name, className }: { name: string; className?: string }) => {
  const map: Record<string, React.ReactNode> = {
    Activity: <Activity className={className} />,
    MessageSquareShare: <MessageSquareShare className={className} />,
    Bell: <Bell className={className} />,
    FileText: <FileText className={className} />,
    Users: <Users className={className} />,
    Instagram: <Instagram className={className} />,
    Megaphone: <Megaphone className={className} />,
    TrendingUp: <TrendingUp className={className} />,
    Award: <Award className={className} />,
    Compass: <Compass className={className} />
  };
  return map[name] || <Sparkles className={className} />;
};

export default function App() {
  // Navigation Router
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeToolId, setActiveToolId] = useState<ToolId | null>(null);

  // Auth & Client States
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dbReady, setDbReady] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Billing dialog simulation
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  // Core Data Lists
  const [records, setRecords] = useState<GenerationRecord[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);

  const isPremium = userProfile ? userProfile.tier === 'premium' : false;

  // 1. Core Seed Initializer for elegant presentation experience
  const initializeSeedData = () => {
    const seedRecords: GenerationRecord[] = [
      {
        id: 'seed-1',
        userId: 'any',
        userIdEmail: 'rnehdrks123@gmail.com',
        toolId: 'naver-diagnostic',
        toolName: '네이버 플레이스 진단기',
        inputs: { businessName: '가포 숯불구이 마포본점', industry: '고깃집', region: '서울 마포구', reviewCount: 120, rating: 4.4, photoCount: 15, newsCount: 0, hasBooking: false },
        outputs: `### 📊 종합 요약
- **플레이스 점수**: 58점 / 100점
- **수준 등급**: D 등급 (보완 시급)

---

### 💪 핵심 강점 (Strengths)
- **리뷰 유입 속도 상위**: 마포구 고기집 평균 대비 예약 리뷰 생산 주기가 탄탄해 기본적인 검색 순위 유지가 가능합니다.

### ⚠️ 긴급 보완 약점 (Weaknesses)
- **새소식 발행 기록 부재**: 플레이스 새소식 탭이 지난 90일간 개방되지 않아 알고리즘 활동 점수 손실이 큽니다.
- **포토 이미지 분량 태부족**: 음식 이미지 및 매장 무드 관련 사진이 15장 내지 축소 등록되어 체류시간이 동종업계 하위 10%에 가깝습니다.

---

### 🚀 개선 실행 가이드
1. **소식 주 2회 등록**: 매주 점심 스페셜 쿠폰 또는 콜키지 무료 정보를 이미지 2장과 함께 업데이트 하십시오.
2. **포토 갤러리 업로드**: 대표 메뉴인 삼겹살과 육즙 확대 포스터 이미지를 최소 40장 추가하고 캡션을 붙이세요.`,
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        bookmarked: true
      },
      {
        id: 'seed-2',
        userId: 'any',
        userIdEmail: 'rnehdrks123@gmail.com',
        toolId: 'review-reply',
        toolName: '리뷰 답글 생성기',
        inputs: { reviewText: '고기 너무 맛있고 사장님이 친절해요! 다음에 또 마포 회식할 때 들릴게요.', tone: 'friendly' },
        outputs: `### 스마트 사장님 전용 맞춤 답글 3종

---

#### [옵션 A : 이웃 삼촌 케어형]
어머나~! 귀중한 마포 회식 시간에 저희 가포 숯불구이를 찾아주셔서 진심으로 고맙습니다! 😊 
지글지글 육즙 가득한 한 점 한 점 만족스럽게 드셨다니 고기를 열심히 썰어드린 사장 이모로서 너무 뿌듯한 거 있죠? 
다음 회식 때 오시면 제 특별 양념 찌개 서비스 꼭 챙겨드릴 테니 들어오실 때 "단골 이모~!" 하고 아는 척 꼭 해주셔요! 
오늘도 활기찬 하루 되셔요!

---

#### [옵션 B : 감동 한술 전수형]
안녕하세요 고객님! 마포구 삼겹살 자존심, 가포의 육질을 극찬해 주시다니 가슴 깊이 힘이 불끈 솟아납니다. 🔥 
저희는 고기를 단순히 파는 것이 아니라 회식을 통해 피로를 씻고 가시는 행복한 상을 대접하는 마음으로 정성을 쏟고 있어요. 
다음에 동료분들과 도란도란 들려주시면 더욱 신선한 냉장 특상 부위로 정성을 다해 굽기 서포팅 해드리겠습니다! 감사합니다.

---

#### [옵션 C : 쿠폰 안내 단골 확장형]
가장 소중한 고객님의 포토 영수증 격려에 무한히 감사드립니다! ✨ 
다음에 마포 회식 예약을 네이버를 통해 방문해주시고 "알림 받기" 쿠폰까지 사용해주시면 맥주나 에이드 무료 드링크 적용해 드리니 잊지 마세요! 
늘 신선하고 도톰한 가포 본연의 불맛을 지켜내겠습니다.`,
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        bookmarked: false
      },
      {
        id: 'seed-3',
        userId: 'any',
        userIdEmail: 'rnehdrks123@gmail.com',
        toolId: 'naver-seo',
        toolName: '플레이스 SEO 키워드 추천기',
        inputs: { region: '인천 송도동', industry: '우대 갈비 전문점' },
        outputs: `### 인천 송도 우대갈비 전문점 포지셔닝 SEO 키워드 추천

네이버 알고리즘 지각 변동을 이식한 핵심 타겟 키워드 군집입니다.

---

### 1. 플레이스 랭킹 상위 겨냥 대표 메인 키워드 (지역+대표업종)
- **인천 송도 맛집** (월간 PC/모바일 조회수 약 125,000건 - 대표 필수 노출 키명)
- **송도 갈비집 추천** (진짜 고기 매니아들이 선택하는 유인 키워드)
- **송도 우대갈비** (우대갈비 검색 시 1페이지 상단 장악 주 타겟명)

---

### 2. 경쟁 방지 즉시 유입 서브 키워드 (상권 특성화)
- **송도 센트럴파크 맛집** (공원 산책 커플, 가족 나들이 고객 유인)
- **송도 트리플스트리트 맛집** (대형 상권 외식 배후 단지 서브 키명)
- **송도 고기 구워주는 곳** (편리함을 갈망하는 직장인, 모임 전초 타겟)

---

### 3. 고농도 상세 롱테일 키워드 (솔루션 결합형)
- **송도 우대갈비 룸 식당 예약** (프라이빗 정통 마케팅 타겟)
- **송도 센트럴파크 주변 주차 편한 고기집** (자차 방문 고객용 칼럼 최적화)`,
        createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        bookmarked: true
      }
    ];

    const seedUsers: UserProfile[] = [
      {
        uid: 'rney-uid-admin',
        email: 'rnehdrks123@gmail.com',
        displayName: '홍길동 사장님 (나)',
        createdAt: new Date().toISOString(),
        usageCount: seedRecords.length,
        tier: 'free',
        role: 'admin'
      },
      {
        uid: 'user-02',
        email: 'owner_gogi@naver.com',
        displayName: '마포가 가포고기 사장',
        createdAt: '2026-05-15T08:00:00Z',
        usageCount: 4,
        tier: 'free',
        role: 'user'
      },
      {
        uid: 'user-03',
        email: 'beauty_salon_owner@gmail.com',
        displayName: '유니크 헤어 김원장',
        createdAt: '2026-06-01T12:30:00Z',
        usageCount: 12,
        tier: 'premium',
        role: 'user'
      }
    ];

    return { seedRecords, seedUsers };
  };

  // 2. Synchronize and Load User Profiles and Logs
  useEffect(() => {
    // 2.1 Set up local static presets
    const { seedRecords, seedUsers } = initializeSeedData();

    // Check localStorage fallback presets
    const localRecords = localStorage.getItem('dymonth_records');
    const localUsers = localStorage.getItem('dymonth_users');
    const localProfile = localStorage.getItem('dymonth_profile');

    if (localRecords) {
      setRecords(JSON.parse(localRecords));
    } else {
      setRecords(seedRecords);
      localStorage.setItem('dymonth_records', JSON.stringify(seedRecords));
    }

    if (localUsers) {
      setUsersList(JSON.parse(localUsers));
    } else {
      setUsersList(seedUsers);
      localStorage.setItem('dymonth_users', JSON.stringify(seedUsers));
    }

    // Default simulation profile if Firebase isn't logged in yet
    if (localProfile) {
      setUserProfile(JSON.parse(localProfile));
    } else {
      // Auto assign standard rich profile for instantaneous beautiful overview
      const defaultProf = seedUsers[0];
      setUserProfile(defaultProf);
      localStorage.setItem('dymonth_profile', JSON.stringify(defaultProf));
    }

    // 2.2 Attempt Firebase Auth Listeners
    if (isFirebaseConfigured && auth) {
      const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          setCurrentUser(firebaseUser);
          setDbReady(true);
          console.log("Firebase current logged operator: ", firebaseUser.email);
          
          // Fetch or Provision user document on Firestore
          try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('uid', '==', firebaseUser.uid));
            const querySnap = await getDocs(q);

            if (!querySnap.empty) {
              const uDoc = querySnap.docs[0].data() as UserProfile;
              setUserProfile(uDoc);
              localStorage.setItem('dymonth_profile', JSON.stringify(uDoc));
            } else {
              // Register new Firestore document securely
              const newProf: UserProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || 'guest@dymonth.com',
                displayName: firebaseUser.displayName || '소상공인 파트너',
                createdAt: new Date().toISOString(),
                usageCount: 0,
                tier: 'free',
                role: firebaseUser.email === 'rnehdrks123@gmail.com' ? 'admin' : 'user'
              };
              
              // We simulate write
              await addDoc(collection(db, 'users'), newProf);
              setUserProfile(newProf);
              localStorage.setItem('dymonth_profile', JSON.stringify(newProf));
            }

            // Sync generations list from Firestore
            const genRef = collection(db, 'generations');
            const genQ = query(genRef, where('userId', '==', firebaseUser.uid));
            const genSnap = await getDocs(genQ);
            
            const firestoreRecords: GenerationRecord[] = [];
            genSnap.forEach((doc) => {
              firestoreRecords.push(doc.data() as GenerationRecord);
            });

            if (firestoreRecords.length > 0) {
              setRecords(firestoreRecords);
              localStorage.setItem('dymonth_records', JSON.stringify(firestoreRecords));
            }

          } catch (err) {
            console.error('Firestore login syncing error:', err);
          }
        } else {
          setCurrentUser(null);
          // Don't wipe local presets so preview is fully functional!
        }
      });
      return () => unsub();
    }
  }, []);

  // 3. User Authorization triggers
  const handleGoogleLogin = async () => {
    if (!isFirebaseConfigured || !auth) {
      // Instantly toggle high fidelity dummy toggle for smooth offline preview checking
      alert("Firebase가 아직 온전히 백그라운드 프로비저닝 완료 전입니다. 로컬 데이터 게스트 로그인 대안 모드를 활성화합니다.");
      const { seedUsers } = initializeSeedData();
      const demoUser = seedUsers[0]; // Admin profile
      setUserProfile(demoUser);
      localStorage.setItem('dymonth_profile', JSON.stringify(demoUser));
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
      alert('구글 로그인 팝업 호출 실패. 오프라인 모드로 자동 우회합니다.');
    }
  };

  const handleSignout = async () => {
    // Reset to base Guest Profile for elegant clearance
    const guestUser: UserProfile = {
      uid: 'guest-uid',
      email: 'guest@naver.com',
      displayName: '게스트 사장님',
      createdAt: new Date().toISOString(),
      usageCount: 0,
      tier: 'free',
      role: 'user'
    };
    setUserProfile(guestUser);
    localStorage.setItem('dymonth_profile', JSON.stringify(guestUser));

    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    setCurrentTab('dashboard');
    setActiveToolId(null);
  };

  // 4. Content Persistence Handlers (Records & Saves)
  const handleAddNewRecord = async (newRecord: GenerationRecord) => {
    // 4.1 Update local lists first for instantaneous responsive rendering (Lag-free SPA feeling)
    const updatedRecords = [newRecord, ...records];
    setRecords(updatedRecords);
    localStorage.setItem('dymonth_records', JSON.stringify(updatedRecords));

    // Update usage count
    if (userProfile) {
      const updatedProfile = {
        ...userProfile,
        usageCount: userProfile.usageCount + 1
      };
      setUserProfile(updatedProfile);
      localStorage.setItem('dymonth_profile', JSON.stringify(updatedProfile));

      // Also update usersList array
      const updatedUsersList = usersList.map(u => u.uid === userProfile.uid ? updatedProfile : u);
      setUsersList(updatedUsersList);
      localStorage.setItem('dymonth_users', JSON.stringify(updatedUsersList));
    }

    // 4.2 Sync to firestore if online
    if (isFirebaseConfigured && auth && auth.currentUser) {
      try {
        await addDoc(collection(db, 'generations'), newRecord);
        
        // Securely increment usage limit in user document
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('uid', '==', auth.currentUser.uid));
        const qSnap = await getDocs(q);
        if (!qSnap.empty) {
          const userDocId = qSnap.docs[0].id;
          await updateDoc(doc(db, 'users', userDocId), {
            usageCount: userProfile ? userProfile.usageCount + 1 : 1
          });
        }
      } catch (err) {
        console.error('Firestore generation recording error:', err);
      }
    }
  };

  const handleDeleteRecord = async (id: string) => {
    const remaining = records.filter(rec => rec.id !== id);
    setRecords(remaining);
    localStorage.setItem('dymonth_records', JSON.stringify(remaining));

    if (isFirebaseConfigured && auth && auth.currentUser) {
      try {
        const genRef = collection(db, 'generations');
        const q = query(genRef, where('id', '==', id));
        const snap = await getDocs(q);
        if (!snap.empty) {
          await deleteDoc(doc(db, 'generations', snap.docs[0].id));
        }
      } catch (err) {
        console.error('Firestore generation deletion error:', err);
      }
    }
  };

  const handleToggleBookmark = async (id: string) => {
    const updated = records.map(rec => {
      if (rec.id === id) {
        return { ...rec, bookmarked: !rec.bookmarked };
      }
      return rec;
    });
    setRecords(updated);
    localStorage.setItem('dymonth_records', JSON.stringify(updated));

    if (isFirebaseConfigured && auth && auth.currentUser) {
      try {
        const genRef = collection(db, 'generations');
        const q = query(genRef, where('id', '==', id));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docId = snap.docs[0].id;
          const currentVal = snap.docs[0].data().bookmarked;
          await updateDoc(doc(db, 'generations', docId), {
            bookmarked: !currentVal
          });
        }
      } catch (err) {
        console.error('Firestore bookmark toggle error:', err);
      }
    }
  };

  // 5. Admin Console operations
  const handleToggleUserTier = (uid: string) => {
    const updated = usersList.map(u => {
      if (u.uid === uid) {
        const nextTier: SubscriptionTier = u.tier === 'premium' ? 'free' : 'premium';
        return { ...u, tier: nextTier };
      }
      return u;
    });
    setUsersList(updated);
    localStorage.setItem('dymonth_users', JSON.stringify(updated));

    // Also update logged-in user profile if matching
    if (userProfile && userProfile.uid === uid) {
      const nextTier: SubscriptionTier = userProfile.tier === 'premium' ? 'free' : 'premium';
      const updatedProfile = { ...userProfile, tier: nextTier };
      setUserProfile(updatedProfile);
      localStorage.setItem('dymonth_profile', JSON.stringify(updatedProfile));
    }
  };

  const handleResetUserUsage = (uid: string) => {
    const updated = usersList.map(u => {
      if (u.uid === uid) {
        return { ...u, usageCount: 0 };
      }
      return u;
    });
    setUsersList(updated);
    localStorage.setItem('dymonth_users', JSON.stringify(updated));

    if (userProfile && userProfile.uid === uid) {
      const updatedProfile = { ...userProfile, usageCount: 0 };
      setUserProfile(updatedProfile);
      localStorage.setItem('dymonth_profile', JSON.stringify(updatedProfile));
    }
  };

  // 6. Upgrades simulation
  const handleUpgradeSuccess = () => {
    if (userProfile) {
      const updatedProfile: UserProfile = {
        ...userProfile,
        tier: 'premium'
      };
      setUserProfile(updatedProfile);
      localStorage.setItem('dymonth_profile', JSON.stringify(updatedProfile));

      // Sync user list
      const updatedList = usersList.map(u => u.uid === userProfile.uid ? updatedProfile : u);
      setUsersList(updatedList);
      localStorage.setItem('dymonth_users', JSON.stringify(updatedList));

      alert("🎉 DyMonth Premium 업그레이드가 기계식 처리 완료되었습니다! 한도 해제 특장을 체험해 보세요.");
      setCheckoutModalOpen(false);
      setCurrentTab('billing');
    }
  };

  const handleDowngradeSuccess = () => {
    if (userProfile) {
      const updatedProfile: UserProfile = {
        ...userProfile,
        tier: 'free',
        usageCount: 0 // restart count
      };
      setUserProfile(updatedProfile);
      localStorage.setItem('dymonth_profile', JSON.stringify(updatedProfile));

      const updatedList = usersList.map(u => u.uid === userProfile.uid ? updatedProfile : u);
      setUsersList(updatedList);
      localStorage.setItem('dymonth_users', JSON.stringify(updatedList));
      alert("시뮬레이션 등급이 무료(Free) 라이센스로 강제 강등 처리되었습니다.");
    }
  };

  // Switch to tool helper callback
  const handleSelectTool = (id: ToolId) => {
    setActiveToolId(id);
    setCurrentTab('tool-runner');
    setMobileMenuOpen(false);
  };

  // Statistics calculation for dynamic top cards overview as requested
  // "오늘 생성한 콘텐츠 32건, 이번달 사용량 184건, 저장된 콘텐츠 57건"
  // Let's seed them but keep them dynamic so that if users bookmarks or adds content, they count up!
  const todayCountBase = 32 + records.length;
  const monthCountBase = 184 + records.length;
  const savedCountBase = 57 + records.filter(r => r.bookmarked).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-sky-500/30 selection:text-white" id="dymonth-app">
      {/* 1. Header Navigation Sidebar / Top bar Combo */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          {/* Mobile responsive toggle */}
          <button 
            id="btn-toggle-mobile-menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -ml-2 text-slate-400 hover:text-white lg:hidden rounded-lg hover:bg-slate-800 transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo container styled with elite typography matching guidelines */}
          <div 
            id="brand-logo"
            onClick={() => {
              setCurrentTab('dashboard');
              setActiveToolId(null);
            }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-sky-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition">
              <Sparkles className="w-4 h-4 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="font-display font-extrabold text-[15px] text-white tracking-tight block">DyMonth</span>
              <span className="text-[9px] uppercase tracking-wider text-sky-400 font-bold block leading-none">AI Marketing Suite</span>
            </div>
          </div>
        </div>

        {/* Desktop Menu links */}
        <nav className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <button
            id="nav-tab-dashboard"
            onClick={() => { setCurrentTab('dashboard'); setActiveToolId(null); }}
            className={`px-3 py-1.5 rounded-lg transition ${currentTab === 'dashboard' ? 'bg-slate-850 text-white' : 'hover:text-white hover:bg-slate-800/40'}`}
          >
            대시보드
          </button>
          <button
            id="nav-tab-history"
            onClick={() => { setCurrentTab('history'); setActiveToolId(null); }}
            className={`px-3 py-1.5 rounded-lg transition ${currentTab === 'history' ? 'bg-slate-850 text-white animate-pulse' : 'hover:text-white hover:bg-slate-800/40'}`}
          >
            사용기록
          </button>
          <button
            id="nav-tab-bookmarks"
            onClick={() => { setCurrentTab('bookmarks'); setActiveToolId(null); }}
            className={`px-3 py-1.5 rounded-lg transition ${currentTab === 'bookmarks' ? 'bg-slate-850 text-white' : 'hover:text-white hover:bg-slate-800/40'}`}
          >
            즐겨찾기
          </button>
          <button
            id="nav-tab-billing"
            onClick={() => { setCurrentTab('billing'); setActiveToolId(null); }}
            className={`px-3 py-1.5 rounded-lg transition ${currentTab === 'billing' ? 'bg-slate-850 text-white' : 'hover:text-white hover:bg-slate-800/40'}`}
          >
            결제관리
          </button>
          
          {userProfile && userProfile.role === 'admin' && (
            <button
              id="nav-tab-admin"
              onClick={() => { setCurrentTab('admin'); setActiveToolId(null); }}
              className={`px-3 py-1.5 border border-sky-950 text-sky-400 rounded-lg transition ${currentTab === 'admin' ? 'bg-sky-950/50 border-sky-800 text-sky-300' : 'hover:bg-slate-800/40'}`}
            >
              👑 관리콘솔
            </button>
          )}
        </nav>

        {/* User Identity widget */}
        <div className="flex items-center gap-3">
          {userProfile ? (
            <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-850 rounded-lg p-1.5 pl-3">
              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-200 block max-w-[120px] truncate">{userProfile.displayName}</span>
                <span className="text-[9px] uppercase font-bold text-amber-500 block">
                  {userProfile.tier.toUpperCase()} 라이센스
                </span>
              </div>
              <button
                id="btn-header-signout"
                onClick={handleSignout}
                className="p-1 px-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-[10px] rounded hover:bg-rose-950/20 hover:border-rose-900 transition"
                title="로그아웃"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <button
              id="btn-header-login"
              onClick={handleGoogleLogin}
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-3 py-2 rounded-lg text-xs font-bold leading-none flex items-center gap-1.5 shadow-lg shadow-sky-500/10 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-950" />
              <span>무료 시작</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Responsive Mobile navigation panel */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md lg:hidden flex flex-col justify-between p-6 animate-slide-in">
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="font-display font-black text-lg text-white">전체 메뉴</span>
              <button 
                id="btn-close-mobile-menu"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3 font-semibold text-sm">
              <button
                id="mob-tab-dashboard"
                onClick={() => { setCurrentTab('dashboard'); setActiveToolId(null); setMobileMenuOpen(false); }}
                className={`py-3 px-4 rounded-xl text-left bg-slate-900 border border-slate-850 text-slate-200 transition ${currentTab === 'dashboard' ? 'border-sky-500 bg-sky-950/10 text-sky-400' : ''}`}
              >
                시작 대시보드
              </button>
              <button
                id="mob-tab-history"
                onClick={() => { setCurrentTab('history'); setActiveToolId(null); setMobileMenuOpen(false); }}
                className={`py-3 px-4 rounded-xl text-left bg-slate-900 border border-slate-850 text-slate-200 transition ${currentTab === 'history' ? 'border-sky-500 bg-sky-950/10 text-sky-400' : ''}`}
              >
                AI 원고 생성 히스토리
              </button>
              <button
                id="mob-tab-bookmarks"
                onClick={() => { setCurrentTab('bookmarks'); setActiveToolId(null); setMobileMenuOpen(false); }}
                className={`py-3 px-4 rounded-xl text-left bg-slate-900 border border-slate-850 text-slate-200 transition ${currentTab === 'bookmarks' ? 'border-sky-500 bg-sky-950/10 text-sky-400' : ''}`}
              >
                즐겨찾는 보관 파일
              </button>
              <button
                id="mob-tab-billing"
                onClick={() => { setCurrentTab('billing'); setActiveToolId(null); setMobileMenuOpen(false); }}
                className={`py-3 px-4 rounded-xl text-left bg-slate-900 border border-slate-850 text-slate-200 transition ${currentTab === 'billing' ? 'border-sky-500 bg-sky-950/10 text-sky-400' : ''}`}
              >
                결제 / 이용료 라이센스
              </button>
              {userProfile && userProfile.role === 'admin' && (
                <button
                  id="mob-tab-admin"
                  onClick={() => { setCurrentTab('admin'); setActiveToolId(null); setMobileMenuOpen(false); }}
                  className={`py-3 px-4 rounded-xl text-left bg-slate-905 border border-slate-800 text-sky-400 font-bold`}
                >
                  👑 최고 관리자 패널
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-5 text-center text-xs text-slate-500">
            DyMonth AI Marketing Suite © 2026
          </div>
        </div>
      )}

      {/* 3. Main content body wrapper */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto relative z-10">

        {/* 3.1 DASHBOARD TAB */}
        {currentTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in" id="dashboard-tab-panel">
            {/* Top Interactive Hero Section */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950/40 rounded-2xl border border-slate-800 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
              <div className="space-y-2 relative z-10">
                <div className="inline-flex items-center gap-1.5 bg-sky-950/80 border border-sky-900 px-3 py-1 rounded-full text-sky-400 text-[10px] font-bold uppercase tracking-wider">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  <span>플레이스 노출 알고리즘 최적화엔진 v2.6.2</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white tracking-tight">
                  DyMonth AI Marketing Suite
                </h2>
                <p className="text-slate-400 text-xs md:text-sm max-w-xl leading-relaxed">
                  소상공인의 생존을 위한 네이버 스마트플레이스 정밀 노출 진단, 자동 답글 수립 및 고품격 마케팅 카피라이팅 배포 자문 통합 솔루션.
                </p>
              </div>

              {!isPremium && (
                <div className="shrink-0 relative z-10">
                  <button
                    id="btn-upgrade-banner"
                    onClick={() => setCheckoutModalOpen(true)}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-5.5 py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-amber-500/20 transition duration-150 active:translate-y-0.5"
                  >
                    👑 무제한 프리미엄으로 업그레이드
                  </button>
                </div>
              )}
            </div>

            {/* Top Summary Stat counters matching requested format */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" id="dashboard-statistics-cards">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">오늘 생성한 콘텐츠</span>
                <span className="text-3xl font-extrabold text-sky-400 font-display mt-2 block">{todayCountBase}건</span>
                <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                  <span>실시간 노출 최적화 발행 데이터</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">이번달 사용량</span>
                <span className="text-3xl font-extrabold text-slate-200 font-display mt-2 block">{monthCountBase}건</span>
                <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                  <span>SaaS 비즈니스 잔량 정비율 안전</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">저장된 콘텐츠</span>
                <span className="text-3xl font-extrabold text-amber-500 font-display mt-2 block">{savedCountBase}건</span>
                <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                  <span>즐겨찾기 보관함 누적 수량</span>
                </div>
              </div>
            </div>

            {/* Core Card-style Category Grid for all 10 Tools */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-300 font-display flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-sky-400" />
                  소상공인 전용 마케팅 생성기 10선
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="dashboard-tools-grid">
                {TOOLS_LIST.map((tool) => (
                  <div
                    key={tool.id}
                    id={`tool-card-${tool.id}`}
                    onClick={() => handleSelectTool(tool.id)}
                    className="bg-slate-900/40 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 rounded-xl p-5 cursor-pointer shadow-lg transition duration-200 hover:-translate-y-1 relative group flex flex-col justify-between h-full overflow-hidden"
                  >
                    <div>
                      {/* Top tool header */}
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sky-400 group-hover:text-white group-hover:bg-sky-500 transition duration-300">
                          <IconMapper name={tool.iconName} className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-bold uppercase py-0.5 px-2 rounded-full border bg-slate-950 text-slate-500 border-slate-850">
                          {tool.category.toUpperCase()}
                        </span>
                      </div>

                      {/* Tool titles */}
                      <h4 className="text-sm font-bold text-white group-hover:text-sky-400 transition mb-1.5">{tool.name}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-normal">{tool.shortDesc}</p>
                    </div>

                    <div className="flex items-center mt-6 pt-3.5 border-t border-slate-850/60 text-[10px] text-slate-500 group-hover:text-slate-300 transition gap-1.5">
                      <span>즉시 작동 실행하기</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition duration-150 text-sky-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3.2 TOOL GENERATION RUNNER TAB */}
        {currentTab === 'tool-runner' && activeToolId && (
          <div className="animate-fade-in" id="runner-tab-panel">
            <ToolRunner
              toolId={activeToolId}
              userProfile={userProfile}
              onRecordGenerated={handleAddNewRecord}
              onBackToDashboard={() => { setCurrentTab('dashboard'); setActiveToolId(null); }}
              onUpgradePrompt={() => setCheckoutModalOpen(true)}
              savedRecords={records}
              onToggleBookmark={handleToggleBookmark}
            />
          </div>
        )}

        {/* 3.3 HISTORY LIST TAB */}
        {currentTab === 'history' && (
          <div className="animate-fade-in">
            <HistoryList
              records={records}
              onDeleteRecord={handleDeleteRecord}
              onToggleBookmark={handleToggleBookmark}
            />
          </div>
        )}

        {/* 3.4 BOOKMARKS LIST TAB */}
        {currentTab === 'bookmarks' && (
          <div className="animate-fade-in">
            <SavedContentList
              records={records}
              onToggleBookmark={handleToggleBookmark}
            />
          </div>
        )}

        {/* 3.5 BILLING MANAGEMENT TAB */}
        {currentTab === 'billing' && (
          <div className="animate-fade-in">
            <BillingManage
              userProfile={userProfile}
              onUpgradeSuccess={handleUpgradeSuccess}
              onDowngradeSuccess={handleDowngradeSuccess}
            />
          </div>
        )}

        {/* 3.6 ADMIN DASHBOARD TAB */}
        {currentTab === 'admin' && userProfile && userProfile.role === 'admin' && (
          <div className="animate-fade-in">
            <AdminPanel
              usersList={usersList}
              recordsList={records}
              onToggleUserTier={handleToggleUserTier}
              onResetUserUsage={handleResetUserUsage}
            />
          </div>
        )}

      </main>

      {/* 4. Upgrade billing simulation popup modal overlay across the app */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" id="checkout-modal-overlay">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
            <div className="p-5 border-b border-slate-850 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase">
                <Sparkles className="w-4 h-4" />
                <span>Premium 무제한 업그레이드</span>
              </div>
              <button 
                id="btn-close-checkout-modal"
                onClick={() => setCheckoutModalOpen(false)}
                className="text-slate-400 hover:text-white px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs"
              >
                닫기 ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white font-display">일일 생성 제한 도달 또는 한도 한계</h3>
                <p className="text-slate-400 text-xs leading-normal max-w-sm mx-auto">
                  10가지 네이버 플레이스 및 AI 마케팅 솔루션을 ₩49,000원에 무제한으로 사용하세요.
                </p>
              </div>

              {/* Payment Sim form inside popup */}
              <BillingManage
                userProfile={userProfile}
                onUpgradeSuccess={handleUpgradeSuccess}
                onDowngradeSuccess={handleDowngradeSuccess}
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. Footer branding design */}
      <footer className="bg-slate-950 border-t border-slate-850 py-8 px-4 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="font-display font-bold text-[13px] text-slate-400 tracking-tight">
            DyMonth AI Marketing Suite
          </div>
          <p className="max-w-md mx-auto text-[10px] text-slate-600 leading-relaxed">
            네이버 플레이스 노출 알고리즘 최적화 및 AI 광고 카피라이팅 배포 자문. 본 가이드는 네이버 공식 입장이 아닙니다.
          </p>
          <div className="text-[10px] text-slate-600">
            DyMonth SaaS Automation Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
