export default function Comprendre() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center sm:text-3xl sm:mb-8">Comprendre l’analyse</h1>
        <section className="bg-slate-800 rounded-lg p-4 mb-4 sm:p-6 sm:mb-6">
          <h2 className="text-lg font-semibold mb-4 sm:text-xl">Ce qui a été observé</h2>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Mouvements :</strong> L’analyse observe les gestes, la posture et les déplacements de ton chien pour détecter des signes de calme, d’excitation ou de stress.</li>
            <li><strong>Sons :</strong> Les aboiements, gémissements ou autres bruits sont analysés pour compléter l’évaluation du comportement.</li>
          </ul>
        </section>
        <section className="bg-slate-800 rounded-lg p-4 mb-4 sm:p-6 sm:mb-6">
          <h2 className="text-lg font-semibold mb-4 sm:text-xl">Niveau de confiance</h2>
          <p>Le niveau de confiance indique la fiabilité de l’analyse basée sur la clarté des observations. Un niveau élevé signifie que les signes sont clairs et cohérents.</p>
        </section>
        <section className="bg-slate-800 rounded-lg p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4 sm:text-xl">À retenir</h2>
          <p>Les résultats de Canisense sont des indications pour t’aider à mieux comprendre ton chien. Ils ne remplacent pas un avis vétérinaire ou professionnel. Utilise-les comme un outil complémentaire pour prendre soin de ton compagnon.</p>
        </section>
      </div>
    </div>
  );
}
