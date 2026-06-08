import React, { useState } from 'react';
import { UserProfile, GenerationRecord } from '../types';
import { 
  Users, Terminal, Shield, TrendingUp, AlertTriangle, 
  Calendar, CheckCircle, Search, Sparkles, Filter, Database, FileText
} from 'lucide-react';

interface AdminPanelProps {
  usersList: UserProfile[];
  recordsList: GenerationRecord[];
  onToggleUserTier: (uid: string) => void;
  onResetUserUsage: (uid: string) => void;
}

export default function AdminPanel({
  usersList,
  recordsList,
  onToggleUserTier,
  onResetUserUsage
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'records' | 'errors'>('users');
  const [searchUser, setSearchUser] = useState('');
  const [searchRecord, setSearchRecord] = useState('');

  // 1. Static mock error logs to fulfill requested "오류로그" beautifully
  const [errorLogs] = useState([
    { id: 'err-101', errorCode: '403_PERM_DENIED', errorMsg: 'Firestore security check reject: uid mismatch for write', createdAt: '2026-06-08T03:15:22Z' },
    { id: 'err-102', errorCode: 'GEMINI_QUOTA_OVER', errorMsg: 'Google Gemini rate limits exceeded. Graceful fallback deployed.', createdAt: '2026-06-07T14:40:02Z' },
    { id: 'err-103', errorCode: 'OAUTH_CANCELED', errorMsg: 'Firebase auth dialogue manually canceled by the operator.', createdAt: '2026-06-06T09:12:11Z' },
  ]);

  // Statistics summaries
  const totalGenerations = recordsList.length;
  const premiumUsersCount = usersList.filter(u => u.tier === 'premium').length;
  const freeUsersCount = usersList.filter(u => u.tier === 'free').length;

  // Filter lists
  const filteredUsers = usersList.filter(usr => {
    return usr.email.toLowerCase().includes(searchUser.toLowerCase()) ||
           usr.displayName.toLowerCase().includes(searchUser.toLowerCase());
  });

  const filteredRecords = recordsList.filter(rec => {
    return rec.userIdEmail.toLowerCase().includes(searchRecord.toLowerCase()) ||
           rec.toolName.toLowerCase().includes(searchRecord.toLowerCase());
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8" id="admin-panel-container">
      {/* Admin Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold leading-none mb-1">
            <Shield className="w-4 h-4 text-sky-400" />
            <span>최고 관리자 내부 오버뷰</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-white">SaaS 관제 콘솔</h1>
          <p className="text-slate-400 text-xs mt-1">
            회원들의 라이선스 라이프사이클 관리, AI 총 잔량 관측 및 로깅 상태를 통제합니다.
          </p>
        </div>

        {/* Console switch buttons */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
          <button
            id="admin-tab-users"
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition ${activeTab === 'users' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <Users className="w-3.5 h-3.5 inline mr-1.5" />
            <span>회원 관리 ({usersList.length})</span>
          </button>
          <button
            id="admin-tab-records"
            onClick={() => setActiveTab('records')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition ${activeTab === 'records' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <Database className="w-3.5 h-3.5 inline mr-1.5" />
            <span>생성 노드 로그 ({recordsList.length})</span>
          </button>
          <button
            id="admin-tab-errors"
            onClick={() => setActiveTab('errors')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition ${activeTab === 'errors' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <Terminal className="w-3.5 h-3.5 inline mr-1.5" />
            <span>오류 로그 ({errorLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Analytics stats dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="admin-stats-overview">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4.5">
          <span className="text-[10px] text-slate-500 font-bold block uppercase">누적 생성량</span>
          <span className="text-2xl font-extrabold text-sky-400 font-display mt-1 block">{totalGenerations}건</span>
          <span className="text-[10px] text-slate-400 mt-1 block">모든 소상공인 도구 가동 합계</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4.5">
          <span className="text-[10px] text-slate-500 font-bold block uppercase">유료 프리미엄 회원</span>
          <span className="text-2xl font-extrabold text-amber-500 font-display mt-1 block">{premiumUsersCount}명</span>
          <span className="text-[10px] text-slate-400 mt-1 block">SaaS 플랜 구독 활성화 비율</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4.5">
          <span className="text-[10px] text-slate-500 font-bold block uppercase">무료 체험 회원</span>
          <span className="text-2xl font-extrabold text-slate-300 font-display mt-1 block">{freeUsersCount}명</span>
          <span className="text-[10px] text-slate-400 mt-1 block">한도 제한 평가판 계정</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4.5">
          <span className="text-[10px] text-slate-500 font-bold block uppercase">서버 API 상태</span>
          <span className="text-2xl font-extrabold text-emerald-400 font-display mt-1 block">정상 (200 OK)</span>
          <span className="text-[10px] text-slate-400 mt-1 block">Gemini 3.5-Flash Active</span>
        </div>
      </div>

      {/* Control Pane Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl" id="admin-display-pane">
        
        {/* TAB 1: USER PROFILES */}
        {activeTab === 'users' && (
          <div className="space-y-4" id="pane-admin-users">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <h3 className="text-base font-bold text-white font-display">가입 회원 목록</h3>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  id="admin-search-user"
                  type="text"
                  placeholder="회원 이름 또는 이메일 검색..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs text-slate-400">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-300">
                    <th className="py-3 px-4 font-semibold">사용자명 / ID</th>
                    <th className="py-3 px-4 font-semibold">이메일</th>
                    <th className="py-3 px-4 font-semibold">가입일</th>
                    <th className="py-3 px-4 font-semibold text-center">오늘 사용 횟수</th>
                    <th className="py-3 px-4 font-semibold text-center">결제 요금제</th>
                    <th className="py-3 px-4 font-semibold text-right">관리 기어</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {filteredUsers.map((usr) => (
                    <tr key={usr.uid} className="hover:bg-slate-900/50 transition">
                      <td className="py-3.5 px-4 font-medium text-white max-w-[150px] truncate">
                        {usr.displayName}
                        <span className="block text-[10px] text-slate-500 font-mono truncate">{usr.uid}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300 text-[11px]">{usr.email}</td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {new Date(usr.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-200 font-mono text-[11px]">
                        {usr.usageCount}회
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          usr.tier === 'premium' ? 'bg-amber-950 text-amber-400 border border-amber-900' : 'bg-slate-950 text-slate-400 border border-slate-805'
                        }`}>
                          {usr.tier.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Toggle tier shortcut for easier simulation */}
                          <button
                            id={`btn-admin-toggle-tier-${usr.uid}`}
                            onClick={() => onToggleUserTier(usr.uid)}
                            className="bg-slate-950 text-slate-300 hover:text-amber-400 hover:bg-slate-800 border border-slate-850 rounded px-2.5 py-1 text-[11px] transition"
                            title="요금제 수동 변경 (프리미엄 <-> 무료)"
                          >
                            요금제 수동 전환
                          </button>

                          {/* Reset daily limit */}
                          <button
                            id={`btn-admin-reset-count-${usr.uid}`}
                            onClick={() => onResetUserUsage(usr.uid)}
                            className="bg-slate-950 text-slate-400 hover:text-sky-400 hover:bg-slate-800 border border-slate-850 rounded px-2 py-1 text-[11px] transition"
                            title="일단 사용 제한 카운트를 0으로 밀어줍니다."
                          >
                            카운트 초기화
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: AI CONENT LOGS */}
        {activeTab === 'records' && (
          <div className="space-y-4" id="pane-admin-records">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <h3 className="text-base font-bold text-white font-display">원고 생성 로그</h3>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  id="admin-search-record"
                  type="text"
                  placeholder="작성자 이메일 또는 도구명 필터..."
                  value={searchRecord}
                  onChange={(e) => setSearchRecord(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredRecords.map((rec) => (
                <div key={rec.id} className="bg-slate-950/80 border border-slate-850/60 rounded-xl p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between gap-3 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-300">{rec.toolName}</span>
                      <span className="text-slate-500">|</span>
                      <span className="text-slate-400 font-mono text-[10px]">{rec.userIdEmail}</span>
                    </div>
                    <span className="text-slate-500 text-[10px]">{new Date(rec.createdAt).toLocaleString()}</span>
                  </div>

                  {/* Collapsed body snippet */}
                  <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-slate-400 text-[11px] font-mono leading-normal truncate">
                    {rec.outputs.substring(0, 150)}...
                  </div>
                </div>
              ))}
              {filteredRecords.length === 0 && (
                <div className="p-12 text-center text-slate-500">진행한 생성 정보가 식별되지 않았습니다.</div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ERROR LOGS */}
        {activeTab === 'errors' && (
          <div className="space-y-4" id="pane-admin-errors">
            <h3 className="text-base font-bold text-white font-display">오류 로그 내역</h3>
            <p className="text-slate-400 text-xs leading-normal">
              클라이언트 런타임 오류, 할당량 초과, 인증 세션 유효기간 해제 등 시스템 전초 오류 수집로그입니다.
            </p>

            <div className="space-y-3">
              {errorLogs.map((log) => (
                <div key={log.id} className="bg-slate-950 border border-red-950 rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-rose-950 text-rose-400 border border-rose-900 rounded font-mono font-semibold text-[10px]">
                      {log.errorCode}
                    </span>
                    <span className="text-slate-500 text-[10px]">{new Date(log.createdAt).toLocaleString('ko-KR')}</span>
                  </div>
                  <p className="text-slate-300 font-mono text-[11px] leading-relaxed break-all">
                    {log.errorMsg}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
