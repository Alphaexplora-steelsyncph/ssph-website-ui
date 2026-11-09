import { Button } from '../../../../shared/components/Button'

export const CtaSection = () => (
  <section className="px-5 pb-20">
    <div className="mx-auto max-w-6xl rounded-2xl bg-ember px-6 py-12 text-center text-charcoal">
      <h2 className="font-display text-5xl font-extrabold uppercase leading-none sm:text-6xl">Connecting the iron.</h2>
      <p className="mx-auto mt-3 max-w-xl font-medium">Join your gym on SteelSync and let every rep count.</p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Button to="/register" className="bg-charcoal !text-ember hover:bg-coal-700">
          Create member account
        </Button>
        <Button to="/admin/login" variant="outline" className="!border-charcoal/50 !text-charcoal hover:!border-charcoal hover:!text-charcoal">
          Gym admin login
        </Button>
      </div>
    </div>
  </section>
)
