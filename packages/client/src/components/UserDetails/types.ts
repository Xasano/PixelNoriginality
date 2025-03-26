import { User } from '../../model/User';

export interface UserActionButtonsProps {
    handleNavigateToHome: () => void;
    currentUser?: User;
  }
  
export interface ProfileFormData {
    id: string;
    name: string;
    email: string;
    prefTheme: string;
    avatar: string;
}
  
export interface PasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}
  
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser?: User;
}