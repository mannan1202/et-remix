export default function ExpensesIndexRoute() {
  return (
    <div>
      <p>Here's a expense:</p>
      <p className="text-green-500">Apple : 40Rs</p>
    </div>
  );
}

export function ErrorBoundary() {
  return <div className="text-red-500">I did a whoopsies.</div>;
}
