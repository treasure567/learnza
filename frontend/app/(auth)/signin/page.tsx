import AuthForm from "@/app/components/auth/AuthForm";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AuthForm route="login" />
    </div>
  );
}
