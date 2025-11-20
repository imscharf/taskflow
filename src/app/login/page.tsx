import { SignInForm } from "../../../components/auth/SignInForm";

export default function LoginPage() {
  return (
    // Usando bg-muted para criar contraste com o bg-card do formulário
    <div className="min-h-[calc(100vh-11rem)] flex items-center justify-center bg-muted/40 p-4">
      <SignInForm />
    </div>
  );
}