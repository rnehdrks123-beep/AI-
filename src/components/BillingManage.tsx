import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  CreditCard, Check, ShieldAlert, Sparkles, AlertCircle, 
  Layers, Zap, ShieldCheck, Heart, Award
} from 'lucide-react';

interface BillingManageProps {
  userProfile: UserProfile | null;
  onUpgradeSuccess: () => void;
  onDowngradeSuccess: () => void; // allow quick toggle back for simulation convenience!
}

export default function BillingManage({
  userProfile,
  onUpgradeSuccess,
  onDowngradeSuccess
}: BillingManageProps) {
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);

  const isPremium = userProfile ? userProfile.tier === 'premium' : false;

  const handleSimulatedCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);

    if (cardNumber.length < 15 || cardExpiry.length < 4 || cardCvc.length < 3) {
      setErrorText('입력하신 결제 카드 정보의 번호 자리수가 불완전합니다. 보안 규격 입력을 완수해 주세요.');
      return;
    }

    setLoading(true);

    // Dynamic 1.5s visual billing progress indicator standard for premium apps
    setTimeout(() => {
      setLoading(false);
      onUpgradeSuccess();
      setCardNumber('');
      setCardExpiry('');
      setCardCvc('');
      setCardName('');
    }, 1500);
  };

  const formattedCardNumber = (value: string) => {
    const raw = value.replace(/\s?/g, '').replace(/[^0-9]/g, '');
    const parts = [];
    for (let i = 0, len = raw.length; i < len; i += 4) {
      parts.push(raw.substring(i, i + 4));
    }
    return parts.length > 0 ? parts.join(' ') : '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8" id="billing-panel">
      {/* Header section */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold font-display text-white">결제 / 라이선스 관리</h1>
        <p className="text-slate-400 text-xs mt-1">
          현재 이용 중인 마케팅 AI 에이전트 서비스 플랜의 세부 정보 확인 및 프로 플랜 청구를 관리합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Tier status indicator card */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden shadow-xl">
            {/* Glossy radial gradient behind premium status */}
            {isPremium && (
              <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            )}

            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-400">현재 보유 라이센스 요금제</span>
            </div>

            <div className="space-y-1">
              <h2 className="text-3xl font-extrabold font-display flex items-baseline gap-2">
                {isPremium ? (
                  <>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
                      Premium Suite
                    </span>
                    <span className="text-xs font-semibold bg-amber-950 text-amber-400 border border-amber-900 px-2 py-0.5 rounded-full uppercase">
                      Active
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-slate-200">Free Tier</span>
                    <span className="text-xs font-semibold bg-slate-850 text-slate-400 border border-slate-800 px-2 py-0.5 rounded-full uppercase">
                      무료 체험
                    </span>
                  </>
                )}
              </h2>
              <p className="text-[11px] text-slate-500">
                {isPremium ? '매월 정기 결제 진행 중 (₩49,000 / 월, VAT 포함)' : '일일 5회 생성 제한 라이센스'}
              </p>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-800/80 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">등록 계정 이메일</span>
                <span className="text-slate-200 font-mono text-[11px]">{userProfile?.email || '비로그인 게스트 모드'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">과금 한도 제한율</span>
                <span className={`font-semibold ${isPremium ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {isPremium ? '무제한 (Unlimited)' : '일일 5회 (5 Credits)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">생성 기록 누적수</span>
                <span className="text-slate-200 font-medium">{userProfile?.usageCount || 0}회 가동</span>
              </div>
            </div>

            {isPremium && (
              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <button
                  id="btn-cancel-premium-simulation"
                  onClick={() => {
                    if (confirm("시뮬레이션 편의를 위해 프리미엄 등급을 해제하고 무료 체험 버전으로 강제 변경하시겠습니까?")) {
                      onDowngradeSuccess();
                    }
                  }}
                  className="w-full py-2 bg-slate-950 hover:bg-rose-950/20 text-slate-400 hover:text-rose-400 border border-slate-855 rounded-lg text-xs font-medium transition"
                >
                  시뮬레이션 등급 강제 해제 (Free 강등)
                </button>
              </div>
            )}
          </div>

          {/* Premium perks spec sheet */}
          <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold font-display text-slate-300 uppercase tracking-wider">Premium 특전 포함 리스트</h3>
            <ul className="space-y-3 text-[11px] text-slate-400">
              <li className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span><strong>10개 AI 도구 한도 제약 없는 무제한 사용</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>네이버 스마트플레이스 <strong>2026 최신 로직 반영 진단</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>보고서 원고 모바일 친화적 <strong>무제한 PDF / 인쇄 백업</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>블로그 체험단 주의사항 특화 마이그레이션 패케지</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Upgrade Form Simulation Container */}
        <div className="md:col-span-7">
          {isPremium ? (
            <div className="bg-emerald-950/20 border border-emerald-900 rounded-2xl p-8 text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 bg-emerald-950/80 text-emerald-400 border-2 border-emerald-800 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl font-bold">
                👑
              </div>
              <h3 className="text-xl font-bold text-white font-display">최고의 SaaS 혜택이 적용 중입니다!</h3>
              <p className="text-slate-300 text-xs leading-relaxed max-w-md mx-auto">
                현재 DyMonth AI Marketing Suite Premium 플랜 정기 결제 이용자로 식별 완료되었습니다. <br />
                모든 제한이 완전 제거되었으며, AI 원고를 무제한 가동하실 수 있습니다. 대시보드를 마음껏 구동해 보세요!
              </p>
              <div className="pt-4">
                <span className="text-[11px] bg-emerald-950 text-emerald-400 border border-emerald-900 font-semibold px-4 py-2 rounded-full">
                  신용카드 전표 정상 결제 처리 완료
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                  <Sparkles className="w-4 h-4" />
                  <span>SaaS 비즈니스 패스 한정 업그레이드</span>
                </div>
                <h3 className="text-xl font-bold text-white font-display">DyMonth Premium 구독</h3>
                <p className="text-slate-400 text-xs leading-normal">
                  매월 ₩49,000원의 가격에 소상공인 매출 증대 10종 에이전트를 완전 자유롭게 운영하세요.
                </p>
              </div>

              {/* Simulated Card Forms */}
              <form onSubmit={handleSimulatedCheckout} className="space-y-5" id="billing-premium-checkout-form">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-300">신용카드 번호</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        id="card-number-input"
                        type="text"
                        required
                        maxLength={19}
                        placeholder="0000 0000 0000 0000 (시뮬레이션 번호 가능)"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formattedCardNumber(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-slate-300">만료일 (MM/YY)</label>
                      <input
                        id="card-expiry-input"
                        type="text"
                        required
                        maxLength={5}
                        placeholder="12/29"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition font-mono text-center"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-slate-300">CVC (보안 번호 3자리)</label>
                      <input
                        id="card-cvc-input"
                        type="password"
                        required
                        maxLength={3}
                        placeholder="***"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition font-mono text-center"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-300">소유자 이름 (영문/한글)</label>
                    <input
                      id="card-name-input"
                      type="text"
                      required
                      placeholder="GILDONG HONG"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none transition"
                    />
                  </div>
                </div>

                {errorText && (
                  <div className="bg-rose-950/30 border border-rose-900 rounded-lg p-3 text-rose-300 text-[11px] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{errorText}</span>
                  </div>
                )}

                <button
                  id="btn-trigger-checkout"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-400 to-amber-200 hover:opacity-95 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg transition duration-200"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>KICC 시뮬레이션 게이트 대기 중...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 text-slate-950" />
                      <span>매월 ₩49,000 정기 결제 및 프리미엄 즉시 가입</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
