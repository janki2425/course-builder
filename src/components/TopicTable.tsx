import React from 'react'

type TableEditorProps = {
    value: string[][];
    onChange: (val: string[][]) => void;
};

const TopicTable: React.FC<TableEditorProps> = ({ value, onChange }) => {
    const maxColumns = 10;
    const addRow = () => onChange([...value, Array(value[0].length).fill('')]);
    const addCol = () => {
      if (value[0].length < maxColumns) {
        onChange(value.map((row: string[], i: number) =>
          [...row, i === 0 ? `Header ${row.length + 1}` : '']
        ));
      }
    };
    const updateCell = (rowIdx: number, colIdx: number, val: string) => {
      const newTable = value.map((row: string[], r: number) =>
        row.map((cell: string, c: number) => (r === rowIdx && c === colIdx ? val : cell))
      );
      onChange(newTable);
    };
    return (
      <div className="mb-6">
        <table className="w-full border mb-4">
          <thead>
            <tr>
              {value[0]?.map((cell: string, idx: number) => (
                <th key={idx} className="px-2 py-1 border">{cell}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {value.slice(1).map((row: string[], rIdx: number) => (
              <tr key={rIdx}>
                {row.map((cell: string, cIdx: number) => (
                  <td key={cIdx} className="border px-2 py-1">
                    <input
                      className="w-full focus:border p-1 rounded-sm focus:outline-none"
                      placeholder='Cell content'
                      value={cell}
                      onChange={e => updateCell(rIdx + 1, cIdx, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
         </tbody>
        </table>
        <button 
        type="button" 
        className="mr-2 px-2 py-1 border rounded hover:bg-[#ececec]" 
        onClick={addRow}>Add Row</button>
        <button
          type="button"
          className="px-2 py-1 mr-2 border rounded hover:bg-[#ececec]"
          onClick={e => { e.stopPropagation(); addCol(); }}
          disabled={value[0].length >= maxColumns}
        >
          Add Column
          </button>
          <button 
            type="button" 
            className="mr-2 px-2 py-1 border rounded text-red-400 hover:bg-[#ececec]"
            onClick={e => { e.stopPropagation(); onChange([['Header 1', 'Header 2']]); }}
          >
            Clear Table
          </button>
      </div>
  );
}

export default TopicTable
