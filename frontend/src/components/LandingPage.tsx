import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, ShieldCheck, FileCheck2 } from "lucide-react";

// Page d'accueil publique (marketing), affichée avant connexion — hero
// sombre et spectaculaire. Toute la navigation mène à l'app elle-même
// (/web/user/login) ; la garde d'authentification déjà en place relaie
// ensuite vers le tableau de bord une fois connecté.
//
// La "carte" flottante représente un rapport DSF certifié, pas une carte
// bancaire: HevGestion ne vend pas de carte, reprendre le motif visuel sans
// laisser croire à un produit qu'on n'offre pas.

const NAV_LINKS = ["Experts-comptables", "Cabinets", "Entreprises", "À propos"];

export function LandingPage() {
  const navigate = useNavigate();
  const goToApp = () => navigate("/fr/web/user/login");

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Background photo + dark gradient wash for contrast */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&w=2400&q=70"
          alt=""
          className="h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/60" />
        {/* Brand accent glow */}
        <div className="absolute -left-32 top-1/3 h-[500px] w-[500px] rounded-full bg-primary/30 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between gap-6 px-6 py-6 md:px-12">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white">
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          <span className="text-lg font-bold text-white">HevGestion</span>
        </div>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((label) => (
            <button
              key={label}
              onClick={goToApp}
              className="text-sm font-medium text-white/80 transition-colors hover:text-white"
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={goToApp}
            className="hidden text-sm font-semibold text-white hover:text-white/80 sm:inline"
          >
            Connexion
          </button>
          <button
            onClick={goToApp}
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-lg transition-opacity hover:opacity-90"
          >
            S'inscrire
          </button>
        </div>
      </header>

      {/* Hero content */}
      <div className="relative z-10 grid min-h-[calc(100vh-88px)] items-center gap-12 px-6 md:px-12 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-white md:text-7xl">
            Allez au-delà
            <br />
            de la conformité
            <br />
            habituelle.
          </h1>

          <p className="mt-8 max-w-md text-lg text-white/70">
            Simplifiez votre conformité DSF avec une plateforme pensée pour
            l'efficacité, conçue pour les experts-comptables.
          </p>

          <button
            onClick={goToApp}
            className="mt-10 rounded-full bg-white px-8 py-4 text-sm font-semibold text-gray-900 shadow-xl transition-transform hover:scale-[1.03]"
          >
            Commencer
          </button>
        </motion.div>

        {/* Floating certified-report card */}
        <motion.div
          initial={{ opacity: 0, x: 30, rotate: 8 }}
          animate={{ opacity: 1, x: 0, rotate: -6 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative hidden justify-self-end lg:block"
          style={{ perspective: 1200 }}
        >
          <motion.div
            animate={{ rotate: [-6, -3, -6] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative h-[340px] w-[520px] rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900 via-gray-950 to-black p-8 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl font-semibold text-white">
                HevGestion <span className="font-normal text-white/50">DSF</span>
              </span>
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
            </div>

            <div className="mt-10 flex h-9 w-12 items-center justify-center rounded-md bg-gradient-to-br from-amber-200 to-amber-400">
              <div className="h-5 w-8 rounded-sm border border-amber-600/40" />
            </div>

            <div className="mt-10">
              <p className="text-xs font-medium uppercase tracking-widest text-white/40">
                Rapport certifié
              </p>
              <p className="mt-1 text-2xl font-semibold text-white">
                Exercice fiscal 2025
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs font-medium text-white/50">
              <FileCheck2 className="h-3.5 w-3.5 text-emerald-400" />
              51 notes générées · conforme SYSCOHADA
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 flex h-11 items-center justify-center border-t border-white/10">
        <p className="text-[11px] text-white/30">Fourni par nashsoft systems</p>
      </footer>
    </div>
  );
}

export default LandingPage;
