// taskflow/app/signup/page.tsx
import { SignUpForm } from "../../../components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <SignUpForm />
    </div>
  );
}