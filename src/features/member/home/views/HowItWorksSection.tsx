import { motion } from 'framer-motion'
import { fadeUp, stagger } from '../../../../shared/utils/animations'
import type { StepItem } from '../viewModels/useHomeViewModel'

export const HowItWorksSection = ({ steps }: { steps: StepItem[] }) => (
  <section id="how-it-works" className="py-20">
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className="mx-auto max-w-6xl px-5"
    >
      <motion.h2 variants={fadeUp} className="font-display text-5xl font-extrabold uppercase">
        How it works
      </motion.h2>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {steps.map(({ icon: Icon, title, description }, i) => (
          <motion.div key={title} variants={fadeUp} className="relative rounded-xl border border-coal-600 bg-coal-800 p-6">
            <span className="absolute right-5 top-4 font-display text-6xl font-extrabold text-coal-600">{i + 1}</span>
            <Icon size={30} className="text-ember" />
            <h3 className="mt-4 font-display text-3xl font-bold uppercase">{title}</h3>
            <p className="mt-2 text-steel">{description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </section>
)
