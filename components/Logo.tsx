export default function Logo({ small, icon }: { small?: boolean; icon?: boolean }) {
  return (
    <h1 className="inline logo-cp">
        {icon ? (
          <img className="w-9 mx-auto" alt="Cal" title="Cal" src="/cp-logo.jpg" />
        ) : (
          <img
          className={small ? "h-4 w-auto" : "h-5 w-auto"}
          alt="Cal"
          title="Cal"
          width="100"
          src="/cp-logo.jpg"
          />
        )}
        <p>
          CompletePair
        </p>
    </h1>
  );
}
