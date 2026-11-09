import { motion } from 'framer-motion'
import { ArrowRight, ScanLine } from 'lucide-react'
import { Button } from '../../../../shared/components/Button'
import { fadeUp, stagger } from '../../../../shared/utils/animations'

export const HeroSection = () => (
  <section className="relative overflow-hidden">
    <div
      aria-hidden="true"
      className="absolute inset-0"
      style={{
        backgroundImage:
          'radial-gradient(circle at 80% 0%, rgba(243,239,230,0.08), transparent 50%), repeating-linear-gradient(135deg, transparent 0 28px, rgba(255,255,255,0.025) 28px 29px)',
      }}
    />
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 md:grid-cols-[1.3fr_1fr] md:py-28"
    >
      <div>
        <motion.p variants={fadeUp} className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-ember">
          Para sa mga sikap sa bakal gym
        </motion.p>
        <motion.h1 variants={fadeUp} className="font-display text-6xl font-extrabold uppercase leading-[0.92] sm:text-7xl md:text-8xl">
          Buhat.
          <br />
          Scan. <span className="text-ember">Sync.</span>
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-6 max-w-xl text-lg text-steel">
          Scan the QR at the gym door and your visit is logged. Members track their membership, gym owners track
          everything else. No more notebooks, no more guessing.
        </motion.p>
        <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button to="/login">
            Member login <ArrowRight size={18} />
          </Button>
          <Button to="/admin/login" variant="outline">
            Gym admin login
          </Button>
        </motion.div>
      </div>

      <motion.div variants={fadeUp} className="mx-auto w-full max-w-xs">
        <div className="rounded-3xl border border-coal-500 bg-coal-800 p-6 shadow-2xl shadow-black/50">
          <div className="flex aspect-square items-center justify-center rounded-2xl bg-charcoal">
            <ScanLine size={120} strokeWidth={1.25} className="text-ember" />
          </div>
          <div className="mt-5 rounded-xl bg-emerald-500/10 px-4 py-3 text-center">
            <p className="font-display text-2xl font-bold uppercase text-emerald-400">Success</p>
            <p className="text-xs text-steel">Welcome back. Visit logged.</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  </section>
)
