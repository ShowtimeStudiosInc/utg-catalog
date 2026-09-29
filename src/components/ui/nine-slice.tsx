const slices = [
  ["top-left", "top-left.png"],
  ["top-middle", "top-middle.png"],
  ["top-right", "top-right.png"],
  ["center-left", "center-left.png"],
  ["center-middle", "center-middle.png"],
  ["center-right", "center-right.png"],
  ["bottom-left", "bottom-left.png"],
  ["bottom-middle", "bottom-middle.png"],
  ["bottom-right", "bottom-right.png"],
] as const

export function NineSlice() {
  return (
    <div className="tile-panel__slice" aria-hidden="true">
      {slices.map(([name, file]) => (
        <span
          key={name}
          className={`tile-panel__slice-cell tile-panel__slice-cell--${name}`}
          style={{ backgroundImage: `url("/images/text-box/${file}")` }}
        />
      ))}
    </div>
  )
}
