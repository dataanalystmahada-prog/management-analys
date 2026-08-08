export function exportToCSV(data: any[], filename: string) {
  if (!data || !data.length) return;

  const keys = Object.keys(data[0]);
  const headerRow = keys.join(',');
  const rows = data.map(row => 
    keys.map(k => {
      let val = row[k] === null || row[k] === undefined ? '' : String(row[k]);
      // Escape commas and quotes
      if (val.includes(',') || val.includes('"')) {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',')
  );

  const csvContent = [headerRow, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}