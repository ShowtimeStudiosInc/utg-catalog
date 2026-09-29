export function ScrollGridBackground() {
  return (
    <div className="scroll-grid-background" aria-hidden="true">
      <div className="scroll-grid-background__layer scroll-grid-background__layer--near" />
      <div className="scroll-grid-background__layer scroll-grid-background__layer--far" />
    </div>
  );
}
