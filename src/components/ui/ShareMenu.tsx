// Файл: src/components/ui/ShareMenu.tsx
import { useState, useRef, useEffect } from 'react';
import { Share2, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { seriesService } from '../../core/services/seriesService';
import Button from './Button';

function ShareMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const games = useGameStore(s => s.games);
  const series = useGameStore(s => s.series);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Проверяем, есть ли уже сохранённая ссылка
  useEffect(() => {
    const saved = localStorage.getItem('crescent-share-url');
    if (saved) {
      setShareUrl(saved);
    }
  }, []);

  const createShareLink = async () => {
    setIsCreating(true);
    try {
      // Собираем данные коллекции
      const allGames = games.map(g => ({
        title: g.title,
        titleOriginal: g.titleOriginal,
        status: g.status,
        seriesId: g.seriesId,
        myRating: g.myRating,
        year: g.year,
        playerCountMin: g.playerCountMin,
        playerCountMax: g.playerCountMax,
        playTimeMin: g.playTimeMin,
        playTimeMax: g.playTimeMax,
        complexity: g.complexity,
        isFavorite: g.isFavorite,
        hasProtectors: g.hasProtectors,
      }));

      const allSeries = await Promise.all(series.map(async s => {
        const stats = await seriesService.getStats(s.id);
        return {
          id: s.id,
          title: s.title,
          description: s.description,
          photoUrl: s.photoUrl,
          stats: {
            totalGames: stats.totalGames,
            ownedGames: stats.ownedGames,
            completionPercent: stats.completionPercent,
          },
        };
      }));

      const shareData = {
        version: '1.0',
        createdAt: new Date().toISOString(),
        games: allGames,
        series: allSeries,
        totalGames: games.length,
        ownedGames: games.filter(g => g.status === 'owned').length,
      };

      // Кодируем в base64
      const encoded = btoa(encodeURIComponent(JSON.stringify(shareData)));
      const url = `${window.location.origin}/shared#${encoded}`;

      setShareUrl(url);
      localStorage.setItem('crescent-share-url', url);
      localStorage.setItem('crescent-share-public', 'true');
    } catch (err) {
      alert('Не удалось создать ссылку');
    } finally {
      setIsCreating(false);
    }
  };

  const removeShareLink = () => {
    setShareUrl(null);
    localStorage.removeItem('crescent-share-url');
    localStorage.removeItem('crescent-share-public');
  };

  const copyToClipboard = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        icon={<Share2 className="w-4 h-4" />}
        onClick={() => setIsOpen(!isOpen)}
        title="Поделиться коллекцией"
      >
        {''}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Поделиться коллекцией
            </p>
          </div>

          {!shareUrl ? (
            <button
              onClick={createShareLink}
              disabled={isCreating}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Eye className="w-4 h-4 text-crescent-accent" />
              <div className="text-left">
                <p className="font-medium">Создать публичную ссылку</p>
                <p className="text-xs text-gray-400">Коллекция будет доступна только для просмотра</p>
              </div>
            </button>
          ) : (
            <>
              <div className="px-4 py-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 text-xs text-gray-600 dark:text-gray-400 truncate select-all">
                    {shareUrl}
                  </div>
                  <Button
                    size="sm"
                    variant={copied ? 'success' : 'secondary'}
                    icon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    onClick={copyToClipboard}
                  >
                    {copied ? 'Готово' : ''}
                  </Button>
                </div>
                <p className="text-[10px] text-crescent-muted">
                  🔗 Кто угодно с этой ссылкой сможет посмотреть вашу коллекцию
                </p>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                <button
                  onClick={removeShareLink}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <EyeOff className="w-4 h-4" />
                  <span>Отключить публичный доступ</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ShareMenu;