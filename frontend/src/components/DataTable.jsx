export default function DataTable({ columns, rows, rowKey = 'id', emptyMessage = 'No data yet' }) {
  if (!rows?.length) {
    return <p className="py-10 text-center text-sm text-muted">{emptyMessage}</p>
  }

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            {columns.map((col) => (
              <th key={col.key} className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[rowKey]} className="border-b border-border/60 transition-colors last:border-0 hover:bg-canvas">
              {columns.map((col) => (
                <td key={col.key} className="whitespace-nowrap px-3 py-3 text-ink-soft">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
