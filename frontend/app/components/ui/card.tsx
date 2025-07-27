export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-light rounded-[24px] p-5 animate-float shadow-lg">
      {children}
    </div>
  );
}
