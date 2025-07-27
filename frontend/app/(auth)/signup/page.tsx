import AuthForm from "@/app/components/auth/AuthForm";

export default function SignUpPage() {
  return (
    <div className="w-full max-w-[430px] mx-auto">
      <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-8 backdrop-blur-sm">
        <AuthForm route="register" />
      </div>
    </div>
  );
}
