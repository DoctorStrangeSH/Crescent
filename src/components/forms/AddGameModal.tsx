import { useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import GameForm from './GameForm';
import { useGameForm, formDataToCreateData } from '../../hooks/useGameForm';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';

function AddGameModal() {
  const { isGameModalOpen, closeGameModal, editingGameId, collectionId } = useUIStore();
  const { games, addGame, updateGame } = useGameStore();
  const editingGame = editingGameId ? games.find(g => g.id === editingGameId) : undefined;
  const isEditing = !!editingGame;
  const isInCollection = !!collectionId;

  const defaultValues = editingGame ? {
    title: editingGame.title, titleOriginal: editingGame.titleOriginal, kind: editingGame.kind,
    year: editingGame.year, publisher: editingGame.publisher,
    designers: editingGame.designers.join(', '), artists: editingGame.artists.join(', '),
    playerCountMin: editingGame.playerCountMin, playerCountMax: editingGame.playerCountMax,
    playTimeMin: editingGame.playTimeMin, playTimeMax: editingGame.playTimeMax,
    complexity: editingGame.complexity, genres: editingGame.genres.join(', '), mechanics: editingGame.mechanics.join(', '),
    status: editingGame.status, purchaseDate: editingGame.purchaseDate?.toISOString().split('T')[0] || '',
    purchasePrice: editingGame.purchasePrice, language: editingGame.language,
    hasProtectors: editingGame.hasProtectors, notes: editingGame.notes,
    isFavorite: editingGame.isFavorite, tags: editingGame.tags.join(', '),
    photos: editingGame.photos, collectionId: editingGame.collectionId,
  } : undefined;

  const form = useGameForm(defaultValues);

  useEffect(() => { if (isGameModalOpen) form.reset(defaultValues); }, [isGameModalOpen, editingGameId]);

  const onSubmit = async (data: any) => {
    const gameData = formDataToCreateData(data);
    if (!isEditing && collectionId) gameData.collectionId = collectionId;
    if (isEditing && editingGame) await updateGame(editingGame.id, gameData);
    else await addGame(gameData);
    closeGameModal(); form.reset();
  };

  const showKind = !isEditing || editingGame?.kind === 'base';
  const showStatus = !isEditing || editingGame?.kind !== 'base';

  return (
    <Modal isOpen={isGameModalOpen} onClose={closeGameModal} title={isEditing ? 'Редактировать' : isInCollection ? 'Добавить в хранилище' : 'Добавить игру'} size="xl">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <GameForm form={form} showKind={!isInCollection && showKind} showStatus={showStatus} showDetails={showStatus}>
          <div className="flex justify-end gap-2 pt-4 border-t border-surface-border dark:border-surface-border-dark mt-6">
            <Button type="button" variant="ghost" onClick={closeGameModal}>Отмена</Button>
            <Button type="submit" variant="primary">{isEditing ? 'Сохранить' : 'Добавить'}</Button>
          </div>
        </GameForm>
      </form>
    </Modal>
  );
}

export default AddGameModal;