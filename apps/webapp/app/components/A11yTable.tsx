export interface A11yTableProps {
  data: Array<{ month: number; cumulative: number }>;
}

export default function A11yTable({ data }: A11yTableProps) {
  if (!data.length) return null;
  return (
    <table aria-hidden="true" className="sr-only">
      <caption>月別累積金額</caption>
      <thead>
        <tr>
          <th scope="col">月</th>
          <th scope="col">累積額 (円)</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.month}>
            <td>{row.month}</td>
            <td>{row.cumulative}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
