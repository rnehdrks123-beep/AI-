import React, { useState, useEffect } from 'react';
import { TOOLS_LIST, ToolConfig } from '../lib/toolsData';
import { ToolId, GenerationRecord, UserProfile } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import { 
  Sparkles, Copy, Check, Download, Bookmark, 
  ArrowLeft, ChevronRight, AlertCircle, Lock, HardDriveDownload
} from 'lucide-react';

interface ToolRunnerProps {
  toolId: ToolId;
  userProfile: UserProfile | null;
  onRecordGenerated: (record: GenerationRecord) => void;
  onBackToDashboard: () => void;
  onUpgradePrompt: () => void;
  savedRecords: GenerationRecord[];
  onToggleBookmark: (id: string) => void;
}

export default function ToolRunner({
  toolId,
  userProfile,
  onRecordGenerated,
  onBackToDashboard,
  onUpgradePrompt,
  savedRecords,
  onToggleBookmark,
}: ToolRunnerProps) {
  const tool: ToolConfig | undefined = TOOLS_LIST.find(t => t.id === toolId);
  
  if (!tool) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl max-w-lg mx-auto my-12" id="runner-not-found">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold font-display text-white mb-2">도구를 찾을 수 없습니다</h3>
        <p className="text-slate-400 text-sm mb-6">존재하지 않거나 지원 범위 외의 기능입니다.</p>
        <button 
          id="btn-back-dashboard"
          onClick={onBackToDashboard}
          className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition"
        >
          메인 대시보드로 돌아가기
        </button>
      </div>
    );
  }

  // Handle building dynamic initial form values
  const getInitialFormState = () => {
    const state: Record<string, any> = {};
    tool.fields.forEach(field => {
      state[field.key] = field.defaultValue !== undefined ? field.defaultValue : '';
    });
    return state;
  };

  const [formValues, setFormValues] = useState<Record<string, any>>(getInitialFormState);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'output'>('input');
  
  // Look up if current tool has an active output in history for high fidelity persistence
  useEffect(() => {
    setFormValues(getInitialFormState());
    setOutput('');
    setErrorMsg(null);
    setActiveTab('input');
  }, [toolId]);

  const handleInputChange = (key: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Quick helper to download raw output text
  const downloadAsTextFile = () => {
    if (!output) return;
    const element = document.createElement("a");
    const file = new Blob([output], {type: 'text/plain;charset=utf-8'});
    element.href = URL.createObjectURL(file);
    element.download = `DyMonth_${toolId}_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Real-time printing simulator for customized printable layout
  const exportAsSimulatedPDF = () => {
    if (!output) return;
    
    // Open a beautifully pre-formatted printable layout standard for small businesses
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("팝업 차단을 해제해 주세요. PDF 내보내기용 화면을 실행할 수 없습니다.");
      return;
    }

    const styledContent = `
      <html>
        <head>
          <title>${tool.name} - DyMonth AI Marketing Suite</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              color: #1e293b;
              padding: 40px;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              border-bottom: 2px solid #0f172a;
              padding-bottom: 20px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .logo {
              font-size: 20px;
              font-weight: 800;
              color: #0f172a;
            }
            .title {
              font-size: 24px;
              font-weight: 700;
              margin-bottom: 10px;
            }
            .meta {
              font-size: 13px;
              color: #64748b;
              margin-bottom: 20px;
            }
            .content {
              white-space: pre-wrap;
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              padding: 24px;
              border-radius: 8px;
              font-size: 14px;
            }
            .footer {
              margin-top: 50px;
              font-size: 12px;
              color: #94a3b8;
              text-align: center;
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
            }
            @media print {
              .no-print { display: none; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">DyMonth AI Marketing Suite</div>
            <button class="no-print" onclick="window.print()" style="padding: 8px 16px; background-color: #0f172a; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">즉시 출력 / PDF 저장</button>
          </div>
          <div class="title">${tool.name} 결과 보고서</div>
          <div class="meta">
            성격: 플레이스 최적화 자문 및 자동화 원고 <br/>
            생성일자: ${new Date().toLocaleDateString('ko-KR')} <br/>
            사업자 구분: 소상공인 마케팅 등급 진단
          </div>
          <div class="content">${output.replace(/#/g, '')}</div>
          <div class="footer">
            본 문서의 저작권과 생성 지침은 DyMonth AI Marketing Suite에 귀속됩니다.
          </div>
          <script>
            // Automatically prompt the print dialogue for PDF saving
            window.onload = function() {
              setTimeout(function() { window.print(); }, 100);
            }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(styledContent);
    printWindow.document.close();
  };

  const verifySubscriptionLimit = (): boolean => {
    if (!userProfile) return true; // allow unauthenticated simulation
    if (userProfile.tier === 'premium') return true; // unlimited
    if (userProfile.usageCount >= 5) {
      return false; // free tier limit is 5
    }
    return true;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Guard: quota limit
    if (!verifySubscriptionLimit()) {
      onUpgradePrompt();
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId,
          inputs: formValues,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'AI 원고 생성 과정 중 서버 통신 에러가 발생하였습니다.');
      }

      const generatedText = data.text;
      setOutput(generatedText);
      setActiveTab('output');

      // Add to static/dynamic generation logs
      const newRecord: GenerationRecord = {
        id: `gen-${Date.now()}`,
        userId: userProfile?.uid || 'anonymous',
        userIdEmail: userProfile?.email || 'rnehdrks123@gmail.com',
        toolId: tool.id,
        toolName: tool.name,
        inputs: formValues,
        outputs: generatedText,
        createdAt: new Date().toISOString(),
        bookmarked: false
      };

      onRecordGenerated(newRecord);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '인터넷 연결을 확인하고 다시 실행해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  // Find if this specific tool currently exists in active bookmarks
  const findCurrentGenerationRecord = () => {
    return savedRecords.find(r => r.outputs === output);
  };

  const isCurrentOutputBookmarked = () => {
    const record = findCurrentGenerationRecord();
    return record ? record.bookmarked : false;
  };

  const handleToggleCurrentBookmark = () => {
    const record = findCurrentGenerationRecord();
    if (record) {
      onToggleBookmark(record.id);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6" id={`runner-container-${toolId}`}>
      {/* Top Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button 
            id="back-breadcrumb"
            onClick={onBackToDashboard}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition"
            title="대시보드로 돌아가기"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase bg-sky-950 text-sky-400 border border-sky-900">
                {tool.category === 'place' ? '네이버 플레이스 최적화' : 
                 tool.category === 'review' ? '리뷰 관리 솔루션' : 
                 tool.category === 'blog' ? '콘텐츠 마케팅' : 
                 tool.category === 'marketing' ? '광고/PROPOSAL' : '소셜 미디어'}
              </span>
              {!userProfile && (
                <span className="text-xs bg-amber-950 text-amber-400 border border-amber-900 px-2 py-0.5 rounded-full font-medium">
                  비로그인 체험 모드
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold font-display text-white mt-1">{tool.name}</h1>
          </div>
        </div>

        {/* Multi tab control if output is already created */}
        {output && (
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              id="tab-edit-input"
              onClick={() => setActiveTab('input')}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition ${activeTab === 'input' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              설정 재입력
            </button>
            <button
              id="tab-view-output"
              onClick={() => setActiveTab('output')}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition ${activeTab === 'output' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              결과 확인
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Toggle Form Pane: visible if form is active or on click */}
        <div className={`col-span-12 ${output ? 'lg:col-span-5' : 'lg:col-span-12'} ${activeTab === 'input' ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-800 p-6 space-y-6 shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-base font-semibold text-slate-200 mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                마케팅 변수 입력
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                현재 업체의 타겟 조건과 세부 옵션을 입력하시면 20년 경력의 지능형 마케터 컨셉으로 맟춤 텍스트가 빌드됩니다.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4" id={`form-tool-${toolId}`}>
                {tool.fields.map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-300" htmlFor={field.key}>
                      {field.label}
                    </label>
                    {field.type === 'text' && (
                      <input
                        id={field.key}
                        type="text"
                        required
                        value={formValues[field.key] || ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 transition"
                      />
                    )}

                    {field.type === 'number' && (
                      <input
                        id={field.key}
                        type="number"
                        required
                        min="0"
                        step={field.key === 'rating' ? '0.1' : '1'}
                        max={field.key === 'rating' ? '5.0' : '999999'}
                        value={formValues[field.key]}
                        onChange={(e) => handleInputChange(field.key, e.target.valueAsNumber || 0)}
                        placeholder={field.placeholder}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 transition"
                      />
                    )}

                    {field.type === 'textarea' && (
                      <textarea
                        id={field.key}
                        required
                        rows={4}
                        value={formValues[field.key] || ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none transition"
                      />
                    )}

                    {field.type === 'select' && (
                      <select
                        id={field.key}
                        value={formValues[field.key]}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 transition"
                      >
                        {field.options?.map(opt => (
                          <option key={opt.value} value={opt.value} className="bg-slate-950">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {field.type === 'boolean' && (
                      <div className="flex items-center gap-3 mt-1 py-1">
                        <input
                          id={field.key}
                          type="checkbox"
                          checked={formValues[field.key] || false}
                          onChange={(e) => handleInputChange(field.key, e.target.checked)}
                          className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-sky-500 focus:ring-sky-500/50"
                        />
                        <span className="text-xs text-slate-400">네, 플레이스 지도상 서비스가 온전히 기재되어 활성화 상태입니다.</span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Free users indicators */}
                {userProfile && userProfile.tier === 'free' && (
                  <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5 flex items-start gap-2.5 text-slate-400 text-xs">
                    <Lock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-200 font-medium mb-0.5">Free 무료 등급 상태</p>
                      <p>일일 최대 5회 생성할 수 있습니다. (현재 사용량: <strong className="text-amber-500">{userProfile.usageCount}/5</strong>)</p>
                    </div>
                  </div>
                )}

                {errorMsg && (
                  <div className="bg-rose-950/40 border border-rose-900 rounded-lg p-4 flex items-start gap-3 text-rose-300 text-xs">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">AI 생성 실패:</span> {errorMsg}
                    </div>
                  </div>
                )}

                <button
                  id="btn-generate-ai"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-sky-500/20 active:translate-y-0.5 transition duration-150"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>네이버 플레이스 정보 분석 및 카피라이팅 작성 중...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      <span>SaaS AI 마케팅 원고 즉시 생성하기</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* AI Output Pane: Visible if output exists */}
        <div className={`col-span-12 ${activeTab === 'output' ? 'block' : 'hidden lg:block'} ${output ? 'lg:col-span-7' : 'hidden'}`}>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col h-full shadow-2xl relative">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-300">실시간 AI 최적화 초고 생성 완료</span>
              </div>

              {/* Advanced Utilities for Sales-ready application */}
              <div className="flex items-center gap-2">
                {/* Bookmark Toggle */}
                {findCurrentGenerationRecord() && (
                  <button
                    id="btn-toggle-bookmark-runner"
                    onClick={handleToggleCurrentBookmark}
                    className={`p-2 rounded-lg border transition ${
                      isCurrentOutputBookmarked() 
                        ? 'bg-amber-950/60 border-amber-800 text-amber-400' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title={isCurrentOutputBookmarked() ? "즐겨찾기 보관 취소" : "즐겨찾기 저장"}
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>
                )}

                {/* Print/Simulated PDF */}
                <button
                  id="btn-export-pdf"
                  onClick={exportAsSimulatedPDF}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                  title="고화질 보고서 양식 출력 및 PDF로 전환합니다."
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>PDF/인쇄</span>
                </button>

                {/* Text File Backup */}
                <button
                  id="btn-export-txt"
                  onClick={downloadAsTextFile}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                  title="결과물을 일반 텍스트 파일로 내려받습니다."
                >
                  <HardDriveDownload className="w-3.5 h-3.5 text-slate-400" />
                  <span>TXT 저장</span>
                </button>

                {/* Copy to Clipboard */}
                <button
                  id="btn-copy-clipboard"
                  onClick={handleCopy}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    copied 
                      ? 'bg-emerald-900 border border-emerald-700 text-emerald-200' 
                      : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-200" />
                      <span>복사완료</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-950" />
                      <span>텍스트 복사</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Render Output Content nicely */}
            <div className="flex-1 bg-slate-950/50 rounded-lg p-5 border border-slate-800 overflow-y-auto max-h-[580px] custom-scroller">
              <MarkdownRenderer content={output} />
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 leading-normal flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>결과가 완벽한 형태가 아닐 경우, 설정을 조금만 바꾸어 다시 요청하시면 더 다듬어진 문맥의 문안이 도출됩니다.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
