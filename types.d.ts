// define your mf types here

declare module "aos";

declare module "*.svg" {
  const content: string;
  export default content;
}

interface SVGProps {
  fill?: string;
  className?: string;
  onClick?: () => void;
}

type Props = {
  show?: boolean;
};

type InputProps = {
  id?: string;
  error?: string;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
} & (
    | React.InputHTMLAttributes<HTMLInputElement>
    | React.TextareaHTMLAttributes<HTMLTextAreaElement>
  );

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  disabled?: boolean;
  loading?: boolean;
  noDefault?: boolean;
  size?: "default" | "sm" | "lg";
  variant?: "primary" | "default" | "secondary" | "danger" | "google";
}

type ModalProps = {
  close?: boolean;
  title?: string;
  isOpen: boolean;
  className?: string;
  onClose: () => void;
  children: React.ReactNode;
};

type Option = {
  label: string;
  value: string;
};

type SelectProps = {
  options: Option[];
  defaultValue?: string;
  className?: string;
  onChange?: (value: string) => void;
};

type Tab = {
  label: string;
  value: string;
};

type TabsProps = {
  tabs: Tab[];
  className?: string;
  defaultValue?: string;
  buttonClassName?: string;
  onChange?: (value: string) => void;
};

type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
};

type TextareaProps = {
  name: string;
  value: string;
  onChange: (e: any) => void;
  placeholder?: string;
  className?: string;
};

type OTPState = {
  [key: string]: string;
};

// Auth Types
type User = {
  id: string;
  email: string;
  name: string;
  isEmailApproved: boolean;
  createdAt: string;
  updatedAt: string;
};

type LoginCredentials = {
  email: string;
  password: string;
};

type RegisterCredentials = {
  email: string;
  name: string;
  password: string;
};

type AuthFormProps = {
  route: "register" | "login";
};

type AuthResponse = {
  token: string;
  user: User;
};

type VerificationResponse = {
  verified: boolean;
};

type ResetPasswordResponse = {
  success: boolean;
};

// Settings Types
type AccessibilitySettings = {
  highContrast?: boolean;
  fontSize?: "small" | "medium" | "large";
  reduceMotion?: boolean;
  screenReader?: boolean;
  signLanguage?: boolean;
  [key: string]: any;
};

type LanguageSettings = {
  language: string;
};

// API Types
type ApiResponse<T = any> = {
  success: boolean;
  message: string;
  data: T;
};

type ApiError = {
  status: number;
  message: string;
};

// Lesson Types
type Lesson = {
  _id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: number;
  userId: string;
  userRequest: string;
  createdAt: string;
  updatedAt: string;
  status: "not_started" | "in_progress" | "completed";
  progress: number;
  lastAccessedAt: string;
  __v: number;
};

type PaginationInfo = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

interface ProgressStats {
  averageProgress: number;
  totalLessons: number;
}

type LessonResponse = {
  lessons: Lesson[];
  progressStats: ProgressStats;
};

type PaginatedResponse<T> = {
  data: T[];
  pagination: PaginationInfo;
};
