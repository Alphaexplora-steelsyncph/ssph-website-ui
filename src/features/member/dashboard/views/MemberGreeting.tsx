export const MemberGreeting = ({ firstName, gymName }: { firstName: string; gymName: string }) => (
  <>
    <p className="text-sm uppercase tracking-widest text-ember">{gymName}</p>
    <h1 className="mt-1 font-display text-5xl font-extrabold uppercase">Hi, {firstName}</h1>
  </>
)
