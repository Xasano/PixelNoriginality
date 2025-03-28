import { User } from "@interfaces/User";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User;
}
