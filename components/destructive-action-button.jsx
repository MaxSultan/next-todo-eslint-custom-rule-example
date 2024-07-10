import { forwardRef, useRef } from "react";
import styled from "styled-components";

const ConfirmationModal = forwardRef(({ onConfirm }, ref) => {
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

ConfirmationModal.displayName = "ConfirmationModal";

export const DestructiveActionButton = styled(
  ({ children, onDelete, className }) => {
    const confirmationModalRef = useRef();

    const handleClick = () => {
      confirmationModalRef.current.showModal();
    };

    return (
      <div className={className}>
        <button onClick={handleClick}>{children}</button>
        <ConfirmationModal ref={confirmationModalRef} onConfirm={onDelete} />
      </div>
    );
  }
)`
  & > ${ConfirmationModal} {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, 50%);
  }

  & > button {
    width: 100%;
  }
`;
