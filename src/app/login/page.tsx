// taskflow/app/login/page.tsx
import { SignInForm } from "../../../components/auth/SignInForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <SignInForm />
    </div>
  );
}