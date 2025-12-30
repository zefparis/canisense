import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-4xl font-bold mb-6 sm:text-5xl">Canisense</h1>
        <p className="text-lg mb-10 max-w-md mx-auto sm:text-xl">
          Canisense t’aide à mieux comprendre le comportement de ton chien.
        </p>
        <Link
          href="/observer"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-base transition-colors sm:px-8 sm:py-4 sm:text-lg"
        >
          Observer mon chien
        </Link>
      </div>
    </div>
  );
}
