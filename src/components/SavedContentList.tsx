import React, { useState } from 'react';
import { GenerationRecord } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import { 
  Bookmark, Copy, Check, Download, ExternalLink,
  Search, Trash, Inbox, RefreshCw, Star
} from 'lucide-react';

interface SavedContentListProps {
  records: GenerationRecord[];
  onToggleBookmark: (id: string) => void;
}

export default function SavedContentList({
  records,
  onToggleBookmark,
}: SavedContentListProps) {
  const [search, setSearch] = useState('');
  const [activeRecord, setActiveRecord] = useState<GenerationRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter bookmarked only
  const savedRecords = records.filter(rec => rec.bookmarked);

  const filteredRecords = savedRecords.filter(rec => {
    return rec.outputs.toLowerCase().includes(search.toLowerCase()) || 
           rec.toolName.toLowerCase().includes(search.toLowerCase()) ||
           JSON.stringify(rec.inputs).toLowerCase().includes(search.toLowerCase());
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
    element.download = `DyMonth_Fav_${rec.toolId}_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6" id="bookmarks-panel">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">즐겨찾기 보관함</h1>
          <p className="text-slate-400 text-xs mt-1">
            마케팅 최적화 결과 원고 중 특별히 보관 처리해주신 명품 카피라이팅 리스트입니다.
          </p>
        </div>
        <div className="text-xs bg-amber-950/40 border border-amber-900 rounded-lg py-2 px-3.5 text-amber-400 flex items-center gap-1.5 font-medium">
          <Star className="w-4 h-4 fill-current text-amber-500" />
          <span>보관 중인 파일: <strong>{savedRecords.length}개</strong></span>
        </div>
      </div>

      {/* Search box */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
        <input
          id="bookmarks-search"
          type="text"
          placeholder="보관함 내에서 텍스트 또는 제목 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none transition"
        />
      </div>

      {/* Content list */}
      {filteredRecords.length === 0 ? (
        <div className="py-20 text-center bg-slate-900/10 border border-slate-850 rounded-xl" id="bookmarks-empty">
          <Bookmark className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-slate-300">보관된 자료가 존재하지 않습니다</h3>
          <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
            생성기 사용 도중 결과 우측 상단이나 하단의 북마크 버튼을 누르시면, 우량 카피라이팅이 여기에 안전하게 누적됩니다.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4" id="bookmarks-list">
          {filteredRecords.map((rec) => (
            <div 
              key={rec.id}
              className="bg-slate-900/40 hover:bg-slate-900 border border-slate-800 rounded-xl p-5 transition flex flex-col justify-between gap-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-sky-400 border border-sky-950 bg-sky-950/50 px-2 py-0.5 rounded">
                    {rec.toolName}
                  </span>
                  <div className="text-xs text-slate-400">
                    등록일: {new Date(rec.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id={`btn-unbookmark-${rec.id}`}
                    onClick={() => onToggleBookmark(rec.id)}
                    className="p-1 px-2.5 bg-slate-950 flex items-center gap-1 hover:bg-slate-800 border border-slate-850 rounded text-[11px] text-amber-400 hover:text-amber-300 transition"
                  >
                    <Bookmark className="w-3.5 h-3.5 fill-current" />
                    <span>보관제거</span>
                  </button>

                  <button
                    id={`btn-copy-bookmark-${rec.id}`}
                    onClick={() => handleCopyText(rec.outputs, rec.id)}
                    className="p-1 px-2.5 bg-slate-950 flex items-center gap-1 hover:bg-slate-800 border border-slate-850 rounded text-[11px] text-slate-300 hover:text-white transition"
                  >
                    {copiedId === rec.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>복사성공</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>빠른복사</span>
                      </>
                    )}
                  </button>

                  <button
                    id={`btn-download-bookmark-${rec.id}`}
                    onClick={() => handleDownloadTxt(rec)}
                    className="p-1 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-850 rounded transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    id={`btn-view-bookmark-modal-${rec.id}`}
                    onClick={() => setActiveRecord(rec)}
                    className="p-1 px-2 text-xs bg-sky-950 hover:bg-sky-900 border border-sky-900 text-sky-400 rounded transition"
                  >
                    상세보기
                  </button>
                </div>
              </div>

              {/* Collapsible/collapsed small view */}
              <div className="bg-slate-950/80 p-4 border border-slate-850/60 rounded-lg text-xs hover:border-slate-800 transition">
                <p className="line-clamp-3 text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {rec.outputs.replace(/#/g, '').replace(/\*/g, '')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details modal overlay */}
      {activeRecord && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-slate-800 bg-slate-950">
              <div className="space-y-1">
                <span className="text-[11px] bg-slate-800 text-amber-400 font-bold px-2.5 py-0.5 rounded-full">
                  즐겨찾는 본문 보관
                </span>
                <h3 className="text-lg font-bold text-white font-display">
                  {activeRecord.toolName} - 저장본
                </h3>
              </div>
              <button 
                id="btn-close-bookmark-modal"
                onClick={() => setActiveRecord(null)}
                className="text-slate-400 hover:text-white px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold pb-1.5 transition"
              >
                닫기 ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="border border-slate-800 bg-slate-950/60 p-5 rounded-xl">
                <MarkdownRenderer content={activeRecord.outputs} />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-4">
              <button
                id="btn-bookmark-modal-download-txt"
                onClick={() => handleDownloadTxt(activeRecord)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 text-xs rounded-lg font-medium flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>TXT 파일 소장</span>
              </button>

              <button
                id="btn-bookmark-modal-copy"
                onClick={() => handleCopyText(activeRecord.outputs, 'bookmark-modal')}
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
