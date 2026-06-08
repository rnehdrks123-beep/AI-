import React, { useState } from 'react';
import { GenerationRecord, ToolId } from '../types';
import { TOOLS_LIST } from '../lib/toolsData';
import MarkdownRenderer from './MarkdownRenderer';
import { 
  Clock, Search, Trash2, Copy, Check, Download, 
  ExternalLink, Calendar, Bookmark, BookmarkCheck, Inbox
} from 'lucide-react';

interface HistoryListProps {
  records: GenerationRecord[];
  onDeleteRecord: (id: string) => void;
  onToggleBookmark: (id: string) => void;
}

export default function HistoryList({
  records,
  onDeleteRecord,
  onToggleBookmark,
}: HistoryListProps) {
  const [search, setSearch] = useState('');
  const [selectedToolFilter, setSelectedToolFilter] = useState<string>('all');
  const [activeRecord, setActiveRecord] = useState<GenerationRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sorting: Newest first
  const sortedRecords = [...records].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Filter logic
  const filteredRecords = sortedRecords.filter(rec => {
    const matchesSearch = rec.outputs.toLowerCase().includes(search.toLowerCase()) || 
                          rec.toolName.toLowerCase().includes(search.toLowerCase()) ||
                          JSON.stringify(rec.inputs).toLowerCase().includes(search.toLowerCase());
    
    const matchesTool = selectedToolFilter === 'all' || rec.toolId === selectedToolFilter;

    return matchesSearch && matchesTool;
  });

  const handleCopyText = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadTxt = (rec: GenerationRecord) => {
    const element = document.createElement("a");
    const file = new Blob([rec.outputs], {type: 'text/plain;charset=utf-8'});
    element.href = URL.createObjectURL(file);
    element.download = `DyMonth_Saved_${rec.toolId}_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6" id="history-panel">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">마케팅 생성 기록</h1>
          <p className="text-slate-400 text-xs mt-1">
            DyMonth AI를 통해 최적화 및 광고 소작업을 실행했던 과거 결과 기록 목록입니다.
          </p>
        </div>
        <div className="text-xs bg-slate-900 border border-slate-800 rounded-lg py-2 px-3.5 text-slate-400">
          총 기록 수: <strong className="text-sky-400">{records.length}개</strong>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-slate-900/40 p-4 border border-slate-800 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            id="history-search"
            type="text"
            placeholder="본문 영문 한글 키워드 또는 입력값으로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none transition"
          />
        </div>
        <select
          id="history-filter-tool"
          value={selectedToolFilter}
          onChange={(e) => setSelectedToolFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 transition"
        >
          <option value="all">모든 AI 도구 보기 ({records.length})</option>
          {TOOLS_LIST.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Grid listing */}
      {filteredRecords.length === 0 ? (
        <div className="py-20 text-center bg-slate-900/20 border border-slate-800 rounded-xl" id="history-empty">
          <Inbox className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-slate-300">사용 기록이 발견되지 않았습니다</h3>
          <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
            원하는 도구를 구동하고 대시보드에서 신규 카피라이팅을 생성해보세요. 결과물이 이 공간에 차곡차곡 저장됩니다.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="history-grid">
          {filteredRecords.map((rec) => {
            const hasOutputs = rec.outputs && rec.outputs.length > 0;
            return (
              <div 
                key={rec.id} 
                className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 hover:bg-slate-900 transition flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3.5">
                    <span className="text-[11px] bg-slate-950 border border-slate-800 text-sky-400 font-semibold px-2 py-0.5 rounded-full">
                      {rec.toolName}
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(rec.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Input parameters snapshot */}
                  <div className="mb-4 p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <div className="font-semibold text-slate-300 mb-1">입력된 주요 매개변수:</div>
                    {Object.entries(rec.inputs).slice(0, 3).map(([key, value]) => (
                      <div key={key} className="flex justify-between gap-2 overflow-hidden truncate">
                        <span className="text-slate-500 shrink-0">{key}:</span>
                        <span className="text-slate-300 truncate font-mono">{String(value)}</span>
                      </div>
                    ))}
                    {Object.keys(rec.inputs).length > 3 && (
                      <div className="text-[10px] text-sky-500 font-medium">외 {Object.keys(rec.inputs).length - 3}개 유인 설정값 포함</div>
                    )}
                  </div>

                  {/* Content Snip */}
                  <p className="text-xs text-slate-300 line-clamp-4 leading-relaxed mb-4 whitespace-pre-wrap">
                    {rec.outputs.replace(/#/g, '').replace(/\*/g, '')}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/80 pt-3.5 mt-2">
                  <div className="flex items-center gap-2">
                    {/* Toggle Bookmark */}
                    <button
                      id={`btn-bookmark-toggle-${rec.id}`}
                      onClick={() => onToggleBookmark(rec.id)}
                      className={`p-1.5 rounded hover:bg-slate-800 transition ${rec.bookmarked ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                      title={rec.bookmarked ? "즐겨찾기 보관 취소" : "즐겨찾기 보관"}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>

                    {/* Delete item */}
                    <button
                      id={`btn-delete-log-${rec.id}`}
                      onClick={() => {
                        if (confirm("이 생성 기록을 전면 삭제하시겠습니까?")) {
                          onDeleteRecord(rec.id);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded transition"
                      title="기록 지우기"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id={`btn-copy-log-${rec.id}`}
                      onClick={() => handleCopyText(rec.outputs, rec.id)}
                      className="p-1.5 bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-850 rounded text-[11px] font-medium flex items-center gap-1 transition"
                    >
                      {copiedId === rec.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>복사완료</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>본문복사</span>
                        </>
                      )}
                    </button>

                    <button
                      id={`btn-view-log-modal-${rec.id}`}
                      onClick={() => setActiveRecord(rec)}
                      className="p-1.5 bg-sky-950 hover:bg-sky-900 text-sky-400 border border-sky-900 rounded text-[11px] font-medium flex items-center gap-1 transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>크게보기</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details modal overlay */}
      {activeRecord && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" id="history-modal-container">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-slate-800 bg-slate-950">
              <div className="space-y-1">
                <span className="text-[11px] bg-sky-950 text-sky-400 border border-sky-900 font-bold px-2.5 py-0.5 rounded-full uppercase">
                  {activeRecord.toolName}
                </span>
                <h3 className="text-lg font-bold text-white font-display">
                  히스토리 정밀 판독 자료
                </h3>
              </div>
              <button 
                id="btn-close-modal"
                onClick={() => setActiveRecord(null)}
                className="text-slate-400 hover:text-white px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold pb-1.5 transition"
              >
                닫기 ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {/* Field configurations */}
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-300 border-b border-slate-800 pb-2">작성 매개 변수 정보</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(activeRecord.inputs).map(([key, value]) => (
                    <div key={key} className="text-xs">
                      <span className="text-slate-500 block text-[10px] font-semibold uppercase">{key}</span>
                      <span className="text-slate-200 mt-0.5 inline-block truncate max-w-full">{String(value)}</span>
                    </div>
                  ))}
                  <div className="text-xs">
                    <span className="text-slate-500 block text-[10px] font-semibold uppercase">생성 일자</span>
                    <span className="text-slate-200 mt-0.5 inline-block">
                      {new Date(activeRecord.createdAt).toLocaleString('ko-KR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rendering details output body */}
              <div className="border border-slate-800 bg-slate-950/60 p-5 rounded-xl">
                <MarkdownRenderer content={activeRecord.outputs} />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-4">
              <button
                id="btn-modal-download-txt"
                onClick={() => handleDownloadTxt(activeRecord)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 text-xs rounded-lg font-medium flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>기계 원문 다운로드</span>
              </button>

              <button
                id="btn-modal-copy-clipboard"
                onClick={() => handleCopyText(activeRecord.outputs, 'modal')}
                className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs rounded-lg font-bold flex items-center gap-1.5 transition"
              >
                <Copy className="w-3.5 h-3.5 text-slate-950" />
                <span>클립보드 즉시 복사</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
