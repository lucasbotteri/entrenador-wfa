import styles from './QuickRefTable.module.css'

export function QuickRefTable({ rows }: { rows: Array<[string, string]> }) {
  return (
    <table className={styles.table}>
      <tbody>
        {rows.map(([k, v], i) => (
          <tr key={`${k}-${i}`}>
            <td>{k}</td>
            <td>{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
