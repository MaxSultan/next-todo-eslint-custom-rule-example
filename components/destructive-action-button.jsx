import { forwardRef, useRef } from "react";

const ConfirmationModal = forwardRef(({ onConfirm, onCancel }, ref) => {
  const handleCancel = () => {
    ref.current.close();
  };
  return (
    <dialog ref={ref}>
      Are you sure you want to delete?
      <button onClick={() => onConfirm()}>Confirm</button>
      <button onClick={handleCancel}>Cancel</button>
    </dialog>
  );
});

export const DestructiveActionButton = ({ children, onDelete }) => {
  const confirmationModalRef = useRef();

  const handleClick = () => {
    confirmationModalRef.current.showModal();
  };

  return (
    <>
      <button onClick={handleClick}>{children}</button>
      <ConfirmationModal ref={confirmationModalRef} onConfirm={onDelete} />
    </>
  );
};
