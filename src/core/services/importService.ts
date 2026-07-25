// Файл: src/core/services/importService.ts

/**
 * Результат парсинга игры с BGG
 */
export interface BggGameData {
  title: string;
  titleOriginal: string;
  year: number | null;
  publisher: string;
  designers: string[];
  artists: string[];
  playerCountMin: number;
  playerCountMax: number;
  playTimeMin: number;
  playTimeMax: number;
  age: number | null;
  complexity: number | null;
  bggRating: number | null;
  bggLink: string;
  description: string;
  genres: string[];
  mechanics: string[];
  photoUrl: string | null;
}

/**
 * Извлекает ID игры из ссылки BGG
 * Поддерживает форматы:
 * - https://boardgamegeek.com/boardgame/822/carcassonne
 * - https://boardgamegeek.com/boardgame/822
 */
export function extractBggId(input: string): string | null {
  // Пробуем найти ID в URL
  const urlMatch = input.match(/boardgamegeek\.com\/boardgame\/(\d+)/);
  if (urlMatch) {
    return urlMatch[1];
  }

  // Если ввели просто число
  const numberMatch = input.match(/^(\d+)$/);
  if (numberMatch) {
    return numberMatch[1];
  }

  return null;
}

/**
 * Парсит XML ответ от BGG API и извлекает данные игры
 */
function parseBggXml(xmlText: string, bggId: string): BggGameData | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');

  // Проверка на ошибки
  const errorNode = doc.querySelector('error');
  if (errorNode) {
    console.error('BGG API error:', errorNode.textContent);
    return null;
  }

  const item = doc.querySelector('item');
  if (!item) return null;

  // Тип должен быть boardgame
  const type = item.getAttribute('type');
  if (type !== 'boardgame' && type !== 'boardgameexpansion') {
    console.warn('Тип элемента не boardgame:', type);
  }

  // Названия
  const names = item.querySelectorAll('name');
  let title = '';
  let titleOriginal = '';

  names.forEach((name) => {
    const typeAttr = name.getAttribute('type');
    const value = name.textContent || '';
    if (typeAttr === 'primary') {
      title = value;
    }
    // Ищем английское или первое попавшееся для оригинального
    if (!titleOriginal && value && /^[a-zA-Z0-9\s:.!?\-'&()]+$/.test(value)) {
      titleOriginal = value;
    }
  });

  if (!title) {
    title = names[0]?.textContent || 'Без названия';
  }

  // Год
  const yearPublished = item.querySelector('yearpublished');
  const year = yearPublished ? parseInt(yearPublished.getAttribute('value') || '0') : null;

  // Издатель
  const publishers: string[] = [];
  item.querySelectorAll('link[type="boardgamepublisher"]').forEach((link) => {
    publishers.push(link.getAttribute('value') || '');
  });

  // Авторы
  const designers: string[] = [];
  item.querySelectorAll('link[type="boardgamedesigner"]').forEach((link) => {
    designers.push(link.getAttribute('value') || '');
  });

  // Художники
  const artists: string[] = [];
  item.querySelectorAll('link[type="boardgameartist"]').forEach((link) => {
    artists.push(link.getAttribute('value') || '');
  });

  // Количество игроков
  const minPlayers = item.querySelector('minplayers');
  const maxPlayers = item.querySelector('maxplayers');
  const playerCountMin = minPlayers ? parseInt(minPlayers.getAttribute('value') || '1') : 1;
  const playerCountMax = maxPlayers ? parseInt(maxPlayers.getAttribute('value') || '4') : 4;

  // Время игры
  const minPlaytime = item.querySelector('minplaytime');
  const maxPlaytime = item.querySelector('maxplaytime');
  const playTimeMin = minPlaytime ? parseInt(minPlaytime.getAttribute('value') || '30') : 30;
  const playTimeMax = maxPlaytime ? parseInt(maxPlaytime.getAttribute('value') || '60') : 60;

  // Возраст
  const minAge = item.querySelector('minage');
  const age = minAge ? parseInt(minAge.getAttribute('value') || '0') : null;

  // Сложность (average weight)
  const averageWeight = item.querySelector('averageweight');
  const complexity = averageWeight
    ? Math.round(parseFloat(averageWeight.getAttribute('value') || '0'))
    : null;
  const normalizedComplexity = complexity
    ? (Math.min(Math.max(complexity, 1), 5) as 1 | 2 | 3 | 4 | 5)
    : 2;

  // Рейтинг BGG
  const averageRating = item.querySelector('average');
  const bggRating = averageRating
    ? Math.round(parseFloat(averageRating.getAttribute('value') || '0') * 10) / 10
    : null;

  // Ссылка
  const bggLink = `https://boardgamegeek.com/boardgame/${bggId}`;

  // Описание
  const descriptionNode = item.querySelector('description');
  const description = descriptionNode
    ? descriptionNode.textContent?.replace(/&#10;/g, '\n').replace(/<[^>]*>/g, '').trim() || ''
    : '';

  // Жанры и механики
  const genres: string[] = [];
  const mechanics: string[] = [];

  item.querySelectorAll('link[type="boardgamecategory"]').forEach((link) => {
    genres.push(link.getAttribute('value') || '');
  });

  item.querySelectorAll('link[type="boardgamemechanic"]').forEach((link) => {
    mechanics.push(link.getAttribute('value') || '');
  });

  // Фото
  const imageNode = item.querySelector('image');
  const photoUrl = imageNode ? imageNode.textContent : null;

  return {
    title,
    titleOriginal: titleOriginal || title,
    year: year && year > 0 ? year : null,
    publisher: publishers[0] || '',
    designers,
    artists,
    playerCountMin,
    playerCountMax,
    playTimeMin,
    playTimeMax,
    age: age && age > 0 ? age : null,
    complexity: normalizedComplexity,
    bggRating,
    bggLink,
    description: description.substring(0, 1000), // Ограничиваем длину
    genres,
    mechanics,
    photoUrl,
  };
}

/**
 * Импортирует данные игры с BGG по ссылке или ID
 */
export async function importFromBgg(input: string): Promise<BggGameData | null> {
  const bggId = extractBggId(input);

  if (!bggId) {
    throw new Error('Не удалось извлечь ID игры. Вставьте ссылку с BoardGameGeek или ID игры.');
  }

  try {
    // Используем BGG XML API v2
    const response = await fetch(
      `https://boardgamegeek.com/xmlapi2/thing?id=${bggId}&stats=1`,
      {
        headers: {
          'Accept': 'application/xml',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Ошибка API: ${response.status} ${response.statusText}`);
    }

    const xmlText = await response.text();
    const gameData = parseBggXml(xmlText, bggId);

    if (!gameData) {
      throw new Error('Не удалось распарсить данные игры. Возможно, ID указан неверно.');
    }

    return gameData;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Неизвестная ошибка при импорте из BGG');
  }
}

/**
 * Импортирует данные из BGG и возвращает готовый объект для формы
 */
export async function importFromBggForForm(input: string) {
  const data = await importFromBgg(input);
  if (!data) return null;

  return {
    title: data.title,
    titleOriginal: data.titleOriginal,
    year: data.year,
    publisher: data.publisher,
    designers: data.designers.join(', '),
    artists: data.artists.join(', '),
    playerCountMin: data.playerCountMin,
    playerCountMax: data.playerCountMax,
    playTimeMin: data.playTimeMin,
    playTimeMax: data.playTimeMax,
    age: data.age,
    complexity: data.complexity || 2,
    bggRating: data.bggRating,
    bggLink: data.bggLink,
    genres: data.genres.join(', '),
    mechanics: data.mechanics.join(', '),
    notes: data.description ? `Описание с BGG:\n${data.description}` : '',
    photoUrl: data.photoUrl,
  };
}