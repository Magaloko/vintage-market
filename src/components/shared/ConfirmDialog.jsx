import Modal from '../ui/Modal'
import Button from '../ui/Button'

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, danger, loading }) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            Отмена
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            Подтвердить
          </Button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  )
}
