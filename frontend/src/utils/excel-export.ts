import * as XLSX from 'xlsx';

export interface ExportOptions {
  filename?: string;
  sheetName?: string;
  includeTimestamp?: boolean;
}

export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  options: ExportOptions = {}
) {
  const {
    filename = 'produtos',
    sheetName = 'Produtos',
    includeTimestamp = true
  } = options;

  try {
    const workbook = XLSX.utils.book_new();

    const worksheet = XLSX.utils.json_to_sheet(data);

    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    const columnWidths: { wch: number }[] = [];

    for (let col = range.s.c; col <= range.e.c; col++) {
      let maxWidth = 0;
      
      for (let row = range.s.r; row <= range.e.r; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];
        
        if (cell && cell.v) {
          const cellLength = cell.v.toString().length;
          maxWidth = Math.max(maxWidth, cellLength);
        }
      }
      
      columnWidths[col] = { wch: Math.min(Math.max(maxWidth + 2, 10), 50) };
    }
    
    worksheet['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const timestamp = includeTimestamp 
      ? new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      : '';
    const finalFilename = `${filename}${timestamp ? `_${timestamp}` : ''}.xlsx`;

    XLSX.writeFile(workbook, finalFilename);

    return {
      success: true,
      filename: finalFilename,
      recordCount: data.length
    };
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}