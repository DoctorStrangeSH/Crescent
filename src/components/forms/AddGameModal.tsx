import { useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import GameForm from './GameForm';
import { useGameForm, toGame } from '../../hooks/useGameForm';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';

function AddGameModal() {
  const { isGameModalOpen, closeGameModal, editingGameId, collectionId } = useUIStore();
  const { games, addGame, updateGame } = useGameStore();
  const editing = editingGameId ? games.find(g => g.id === editingGameId) : undefined;
  const isEditing = !!editing;
  const isInCollection = !!collectionId;

  const def = editing ? {
    title: editing.title, titleOriginal: editing.titleOriginal, kind: editing.kind,
    year: editing.year, publisher: editing.publisher,
    designers: editing.designers.join(', '), artists: editing.artists.join(', '),
    playerCountMin: editing.playerCountMin, playerCountMax: editing.playerCountMax,
    playTimeMin: editing.playTimeMin, playTimeMax: editing.playTimeMax,
    complexity: editing.complexity, genres: editing.genres.join(', '), mechanics: editing.mechanics.join(', '),
    status: editing.status, purchaseDate: editing.purchaseDate?.toISOString().split('T')[0] || '',
    purchasePrice: editing.purchasePrice, language: editing.language,
    hasProtectors: editing.hasProtectors, notes: editing.notes,
    isFavorite: editing.isFavorite, tags: editing.tags.join(', '),
    photos: editing.photos, collectionId: editing.collectionId,
  } : undefined;

  const form = useGameForm(def);
  useEffect(() => { if (isGameModalOpen) form.reset(def); }, [isGameModalOpen]);

  const onSubmit = async (d: any) => {
    const data = toGame(d);
    if (!isEditing && collectionId) data.collectionId = collectionId;
    if (isEditing && editing) await updateGame(editing.id, data);
    else await addGame(data);
    closeGameModal(); form.reset();
  };

  const showKind = isEditing ? true : true;
  const showStatus = !isEditing || editing?.kind !== 'collection';

  return (
    <Modal isOpen={isGameModalOpen} onClose={closeGameModal} title={isEditing ? 'Редактировать' : isInCollection ? 'Добавить в хранилище' : 'Создать'} size="xl">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <GameForm form={form} showKind={showKind} showStatus={showStatus} showDetails={showStatus} isInsideCollection={isInCollection}>
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