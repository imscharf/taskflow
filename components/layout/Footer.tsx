// taskflow/components/layout/Footer.tsx
export function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-6 text-center mt-auto">
      <p>&copy; {new Date().getFullYear()} TaskFlow. Todos os direitos reservados.</p>
      <div className="mt-2 text-sm">
        <a href="#" className="hover:underline mx-2">Política de Privacidade</a> |
        <a href="#" className="hover:underline mx-2">Termos de Serviço</a>
      </div>
    </footer>
  );
}