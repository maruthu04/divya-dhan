'use client';

import { useState, useEffect } from 'react';
import { getNotes, addNote, togglePinNote, deleteNote } from '@/actions/notes';
import { NOTE_CATEGORIES, NOTE_COLORS } from '@/lib/constants';
import { getRelativeTime } from '@/lib/formatters';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import { StickyNote, Plus, Pin, PinOff, X, Search, Trash2, Loader2 } from 'lucide-react';

const mapColor = (c: string) => {
  const mapping: Record<string, string> = {
    // Old dark colors mapping to new requested ones
    '#111827': '#F1F5F9', // map white/dark-default to Slate Gray
    '#FFFFFF': '#F1F5F9',
    '#1E3A5F': '#E0F2FE', // map dark blue to Sky Blue
    '#1E3B2F': '#DCFCE7', // map dark green to Mint Green
    '#3B2F1E': '#FEF3C7', // map dark brown to Soft Amber
    '#3B1E2F': '#FCE7F3', // map dark pink/rose to Rose Pink
    '#2F1E3B': '#F3E8FF', // map dark purple to Lavender Purple
    '#1E2F3B': '#CCFBF1', // map dark teal to Teal
    
    // Intermediate pastels mapping to new requested ones
    '#EFF6FF': '#E0F2FE',
    '#F0F6FF': '#E0F2FE',
    '#ECFDF5': '#DCFCE7',
    '#F2FBF6': '#DCFCE7',
    '#FFFBEB': '#FEF3C7',
    '#FFFDF0': '#FEF3C7',
    '#FFF1F2': '#FCE7F3',
    '#FFF5F6': '#FCE7F3',
    '#F5F3FF': '#F3E8FF',
    '#FAF5FF': '#F3E8FF',
    '#F0FDFA': '#CCFBF1',
  };
  return mapping[c] || c;
};

const colorThemes: Record<
  string,
  {
    light: {
      bg: string;
      border: string;
      text: string;
      subtext: string;
      tagBg: string;
      tagText: string;
    };
    dark: {
      bg: string;
      border: string;
      text: string;
      subtext: string;
      tagBg: string;
      tagText: string;
    };
  }
> = {
  // Mint Green
  '#DCFCE7': {
    light: {
      bg: '#DCFCE7',
      border: '#22C55E',
      text: '#166534',
      subtext: '#1b8042',
      tagBg: '#DCFCE7',
      tagText: '#166534',
    },
    dark: {
      bg: 'rgba(20, 83, 45, 0.15)',
      border: 'rgba(34, 197, 94, 0.4)',
      text: '#86EFAC',
      subtext: 'rgba(134, 239, 172, 0.8)',
      tagBg: 'rgba(20, 83, 45, 0.25)',
      tagText: '#86EFAC',
    },
  },
  // Sky Blue
  '#E0F2FE': {
    light: {
      bg: '#E0F2FE',
      border: '#0EA5E9',
      text: '#075985',
      subtext: '#0a6c9f',
      tagBg: '#E0F2FE',
      tagText: '#075985',
    },
    dark: {
      bg: 'rgba(12, 74, 110, 0.15)',
      border: 'rgba(14, 165, 233, 0.4)',
      text: '#7DD3FC',
      subtext: 'rgba(125, 211, 252, 0.8)',
      tagBg: 'rgba(12, 74, 110, 0.25)',
      tagText: '#7DD3FC',
    },
  },
  // Lavender Purple
  '#F3E8FF': {
    light: {
      bg: '#F3E8FF',
      border: '#A855F7',
      text: '#6B21A8',
      subtext: '#7e22ce',
      tagBg: '#F3E8FF',
      tagText: '#6B21A8',
    },
    dark: {
      bg: 'rgba(88, 28, 135, 0.15)',
      border: 'rgba(168, 85, 247, 0.4)',
      text: '#D8B4FE',
      subtext: 'rgba(216, 180, 254, 0.8)',
      tagBg: 'rgba(88, 28, 135, 0.25)',
      tagText: '#D8B4FE',
    },
  },
  // Soft Amber
  '#FEF3C7': {
    light: {
      bg: '#FEF3C7',
      border: '#F59E0B',
      text: '#92400E',
      subtext: '#a15014',
      tagBg: '#FEF3C7',
      tagText: '#92400E',
    },
    dark: {
      bg: 'rgba(120, 53, 15, 0.15)',
      border: 'rgba(245, 158, 11, 0.4)',
      text: '#FDE68A',
      subtext: 'rgba(253, 230, 138, 0.8)',
      tagBg: 'rgba(120, 53, 15, 0.25)',
      tagText: '#FDE68A',
    },
  },
  // Rose Pink
  '#FCE7F3': {
    light: {
      bg: '#FCE7F3',
      border: '#EC4899',
      text: '#9D174D',
      subtext: '#be185d',
      tagBg: '#FCE7F3',
      tagText: '#9D174D',
    },
    dark: {
      bg: 'rgba(131, 24, 67, 0.15)',
      border: 'rgba(236, 72, 153, 0.4)',
      text: '#F9A8D4',
      subtext: 'rgba(249, 168, 212, 0.8)',
      tagBg: 'rgba(131, 24, 67, 0.25)',
      tagText: '#F9A8D4',
    },
  },
  // Teal
  '#CCFBF1': {
    light: {
      bg: '#CCFBF1',
      border: '#14B8A6',
      text: '#115E59',
      subtext: '#137a72',
      tagBg: '#CCFBF1',
      tagText: '#115E59',
    },
    dark: {
      bg: 'rgba(19, 78, 94, 0.15)',
      border: 'rgba(20, 184, 166, 0.4)',
      text: '#99F6E4',
      subtext: 'rgba(153, 246, 228, 0.8)',
      tagBg: 'rgba(19, 78, 94, 0.25)',
      tagText: '#99F6E4',
    },
  },
  // Slate Gray
  '#F1F5F9': {
    light: {
      bg: '#F1F5F9',
      border: '#64748B',
      text: '#334155',
      subtext: '#475569',
      tagBg: '#F1F5F9',
      tagText: '#334155',
    },
    dark: {
      bg: 'rgba(51, 65, 85, 0.15)',
      border: 'rgba(100, 116, 139, 0.4)',
      text: '#CBD5E1',
      subtext: 'rgba(203, 213, 225, 0.8)',
      tagBg: 'rgba(51, 65, 85, 0.25)',
      tagText: '#CBD5E1',
    },
  },
};

export default function NotesPage() {
  const { theme: activeTheme } = useTheme();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [color, setColor] = useState('#DCFCE7');

  const loadData = async () => {
    setLoading(true);
    const data = await getNotes();
    setNotes(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    const res = await addNote({
      title,
      content,
      category,
      color,
      pinned: false,
    });

    if (!res.error) {
      setTitle('');
      setContent('');
      setCategory('general');
      setColor('#DCFCE7');
      setShowForm(false);
      loadData();
    }
  };

  const handleTogglePin = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await togglePinNote(id);
    if (!res.error) {
      loadData();
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this note?')) {
      const res = await deleteNote(id);
      if (!res.error) {
        loadData();
      }
    }
  };

  const filteredNotes = notes
    .filter(n => filterCategory === 'all' || n.category === filterCategory)
    .filter(n => !searchQuery || n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><StickyNote className="w-6 h-6 text-warning" /> Wealth Notes</h1>
          <p className="text-sm text-text-muted mt-1">Your personal financial journal and idea board</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-background text-sm font-medium rounded-lg transition-colors cursor-pointer"><Plus className="w-4 h-4" /> New Note</button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 animate-slide-up">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilterCategory('all')} className={cn('px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer', filterCategory === 'all' ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-text-secondary hover:bg-surface-hover')}>All</button>
          {NOTE_CATEGORIES.map(c => (
            <button key={c.value} onClick={() => setFilterCategory(c.value)} className={cn('px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer', filterCategory === c.value ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-text-secondary hover:bg-surface-hover')}>{c.label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <>
          {/* Notes Grid — Masonry style */}
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {filteredNotes.map((note, i) => {
              const catMeta = NOTE_CATEGORIES.find(c => c.value === note.category);
              const mappedColor = mapColor(note.color);
              const rawThemeObj = colorThemes[mappedColor] || colorThemes['#F1F5F9'];
              const isDark = activeTheme === 'dark';
              const theme = isDark ? rawThemeObj.dark : rawThemeObj.light;

              return (
                <div
                  key={note.id}
                  className="break-inside-avoid border rounded-xl p-5 card-hover animate-slide-up group relative transition-all duration-300"
                  style={{
                    animationDelay: `${i * 50}ms`,
                    backgroundColor: theme.bg,
                    borderColor: theme.border,
                  }}
                >
                  {/* Pin & Actions */}
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full border transition-colors"
                      style={{
                        backgroundColor: theme.tagBg,
                        borderColor: `${theme.border}40`,
                        color: theme.tagText,
                      }}
                    >
                      {catMeta?.label}
                    </span>
                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleTogglePin(note.id, e)}
                        className="p-1 rounded cursor-pointer transition-all hover:bg-black/5 dark:hover:bg-white/10"
                        title="Pin note"
                        style={{ color: theme.text }}
                      >
                        {note.pinned ? (
                          <Pin className="w-3.5 h-3.5" />
                        ) : (
                          <PinOff className="w-3.5 h-3.5 opacity-60 hover:opacity-100" />
                        )}
                      </button>
                      <button
                        onClick={(e) => handleDelete(note.id, e)}
                        className="p-1 rounded cursor-pointer transition-all hover:bg-black/5 dark:hover:bg-white/10"
                        title="Delete note"
                        style={{ color: theme.text }}
                      >
                        <Trash2 className="w-3.5 h-3.5 opacity-60 hover:opacity-100" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-sm font-bold mb-2" style={{ color: theme.text }}>
                    {note.title}
                  </h3>
                  <p className="text-xs whitespace-pre-line leading-relaxed" style={{ color: theme.subtext }}>
                    {note.content}
                  </p>
                  <p className="text-[10px] mt-4 font-medium" style={{ color: theme.text, opacity: 0.6 }}>
                    {getRelativeTime(note.createdAt)}
                  </p>
                </div>
              );
            })}
          </div>

          {filteredNotes.length === 0 && (
            <div className="text-center py-16 border border-border border-dashed rounded-xl">
              <StickyNote className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <p className="text-sm text-text-muted">No notes logged yet.</p>
            </div>
          )}
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-surface border border-border rounded-2xl p-6 w-full max-w-lg animate-slide-up shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-semibold text-text">New Note</h2><button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-surface-hover cursor-pointer"><X className="w-5 h-5 text-text-muted" /></button></div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div><label className="block text-xs font-medium text-text-secondary mb-1.5">Title</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Note title..." className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50" /></div>
              <div><label className="block text-xs font-medium text-text-secondary mb-1.5">Category</label><select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50">{NOTE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
              <div><label className="block text-xs font-medium text-text-secondary mb-1.5">Content</label><textarea value={content} onChange={e => setContent(e.target.value)} required placeholder="Write your note..." className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary/50 resize-none h-40" /></div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Color</label>
                <div className="flex flex-wrap gap-3">
                  {NOTE_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 hover:scale-110 transition-all cursor-pointer shadow-sm",
                        color === c ? "border-primary scale-110 ring-2 ring-primary/20" : "border-border"
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-primary hover:bg-primary-hover text-background font-medium rounded-lg transition-colors cursor-pointer">Create Note</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
