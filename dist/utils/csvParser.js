"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCSVContent = void 0;
const parseCSVContent = (csvContent) => {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
        throw new Error('CSV file must contain header and at least one data row');
    }
    const headers = lines[0].split(',').map(h => h.trim());
    const items = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length >= 8) {
            const item = {
                id: parseInt(values[0]) || i,
                categoria: values[1] || '',
                proveedor: values[2] || '',
                servicio: values[3] || '',
                plan: values[4] || '',
                precio_mensual: parsePrice(values[5]),
                detalles: values[6] || '',
                estado: values[7] || 'Activo'
            };
            items.push(item);
        }
    }
    return items;
};
exports.parseCSVContent = parseCSVContent;
const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        }
        else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        }
        else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
};
const parsePrice = (priceString) => {
    // Remove currency symbols, dots, and convert to cents
    const cleaned = priceString
        .replace(/[^\d,]/g, '')
        .replace(',', '.');
    const price = parseFloat(cleaned);
    return isNaN(price) ? 0 : Math.round(price * 100); // Convert to cents
};
//# sourceMappingURL=csvParser.js.map