import { motion } from 'framer-motion'
import { fadeUp, stagger } from '../../../../shared/utils/animations'
import type { FeatureItem } from '../viewModels/useHomeViewModel'

const FeatureColumn = ({ label, items }: { label: string; items: FeatureItem[] }) => (
  <div>
    <h3 className="mb-5 font-display text-3xl font-bold uppercase text-ember">{label}</h3>
    <div className="space-y-4">
      {items.map(({ icon: Icon, title, description }) => (
        <motion.div
          key={title}
          variants={fadeUp}
          className="flex gap-4 rounded-xl border border-coal-600 bg-coal-800 p-5"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-ember/15 text-ember">
            <Icon size={22} />
          </div>
          <div>
            <h4 className="text-lg font-semibold">{title}</h4>
            <p className="mt-1 text-sm text-steel">{description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
)

export const FeaturesSection = ({ memberFeatures, adminFeatures }: { memberFeatures: FeatureItem[]; adminFeatures: FeatureItem[] }) => (
  <section id="features" className="bg-coal-900 py-20">
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className="mx-auto max-w-6xl px-5"
    >
      <motion.h2 variants={fadeUp} className="font-display text-5xl font-extrabold uppercase">
        Built for the iron
      </motion.h2>
      <motion.p variants={fadeUp} className="mt-3 max-w-2xl text-steel">
        One simple system for lifters and for the people running the gym.
      </motion.p>
      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <FeatureColumn label="For members" items={memberFeatures} />
        <FeatureColumn label="For gym owners" items={adminFeatures} />
      </div>
    </motion.div>
  </section>
)
