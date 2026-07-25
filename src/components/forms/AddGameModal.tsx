// Файл: src/components/forms/AddGameModal.tsx
import { useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import GameForm from './GameForm';
import { useGameForm, formDataToCreateData } from '../../hooks/useGameForm';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';

function AddGameModal() {
  const { isGameModalOpen, closeGameModal, editingGameId, pendingSeriesId } = useUIStore();
  const { games, addGame, updateGame } = useGameStore();
  const editingGame = editingGameId ? games.find(g => g.id === editingGameId) : undefined;
  const isEditing = !!editingGame;

  const defaultValues = editingGame ? {
    title: editingGame.title,
    titleOriginal: editingGame.titleOriginal,
    year: editingGame.year,
    publisher: editingGame.publisher,
    designers: editingGame.designers.join(', '),
    artists: editingGame.artists.join(', '),
    playerCountMin: editingGame.playerCountMin,
    playerCountMax: editingGame.playerCountMax,
    bestPlayerCount: editingGame.bestPlayerCount,
    playTimeMin: editingGame.playTimeMin,
    playTimeMax: editingGame.playTimeMax,
    age: editingGame.age,
    complexity: editingGame.complexity,
    bggRating: editingGame.bggRating,
    bggLink: editingGame.bggLink,
    teseraLink: editingGame.teseraLink,
    hobbygameLink: editingGame.hobbygameLink,
    genres: editingGame.genres.join(', '),
    mechanics: editingGame.mechanics.join(', '),
    status: editingGame.status,
    myRating: editingGame.myRating,
    purchaseDate: editingGame.purchaseDate?.toISOString().split('T')[0] || '',
    purchasePrice: editingGame.purchasePrice,
    language: editingGame.language,
    hasProtectors: editingGame.hasProtectors,
    protectorDetails: editingGame.protectorDetails,
    notes: editingGame.notes,
    isFavorite: editingGame.isFavorite,
    tags: editingGame.tags.join(', '),
    missingComponents: editingGame.missingComponents,
    acquisitionSource: editingGame.acquisitionSource,
    isBaseGame: editingGame.isBaseGame,
    sortOrder: editingGame.sortOrder,
    seriesId: editingGame.seriesId,
  } : undefined;

  const form = useGameForm(defaultValues);

  useEffect(() => {
    if (isGameModalOpen) {
      form.reset(defaultValues);
    }
  }, [isGameModalOpen, editingGameId]);

  const onSubmit = async (data: any) => {
    const gameData = formDataToCreateData(data);
    // Если добавляем через «Добавить игру в серию» — принудительно ставим seriesId
    if (!isEditing && pendingSeriesId) {
      gameData.seriesId = pendingSeriesId;
    }
    if (isEditing && editingGame) {
      await updateGame(editingGame.id, gameData);
    } else {
      await addGame(gameData);
    }
    closeGameModal();
    form.reset();
  };

  return (
    <Modal
      isOpen={isGameModalOpen}
      onClose={closeGameModal}
      title={isEditing ? 'Редактировать игру' : pendingSeriesId ? 'Добавить игру в серию' : 'Добавить игру'}
      size="xl"
    >
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <GameForm form={form}>
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800/50 mt-6">
            <Button type="button" variant="ghost" onClick={closeGameModal}>Отмена</Button>
            <Button type="submit" variant="primary">{isEditing ? 'Сохранить' : 'Добавить'}</Button>
          </div>
        </GameForm>
      </form>
    </Modal>
  );
}

export default AddGameModal;