import Modal from './Modal';
import PrimaryButton from '../buttons/PrimaryButton';
import SecondaryButton from '../buttons/SecondaryButton';
import DangerButton from '../buttons/DangerButton';
import type { ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  loading?: boolean;
}

export default function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDanger = false,
  loading = false,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex items-center gap-2">
          <SecondaryButton onClick={onClose} disabled={loading}>
            {cancelLabel}
          </SecondaryButton>
          {isDanger ? (
            <DangerButton onClick={onConfirm} disabled={loading}>
              {loading ? 'Processing...' : confirmLabel}
            </DangerButton>
          ) : (
            <PrimaryButton onClick={onConfirm} loading={loading} variant="primary">
              {confirmLabel}
            </PrimaryButton>
          )}
        </div>
      }
    >
      <div className="text-sm text-gray-600 leading-relaxed">
        {description}
      </div>
    </Modal>
  );
}

