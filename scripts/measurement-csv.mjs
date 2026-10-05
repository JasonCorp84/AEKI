export function parseMeasurementCsv(csvText) {
  const records = [];
  let record = [];
  let field = '';
  let isQuoted = false;
  const normalizedText = csvText
    .replace(/^\uFEFF/, '')
    .replaceAll('\r\n', '\n');
  for (let index = 0; index < normalizedText.length; index += 1) {
    const character = normalizedText[index];
    if (character === '"') {
      if (isQuoted && normalizedText[index + 1] === '"') {
        field += '"';
        index += 1;
      } else isQuoted = !isQuoted;
    } else if (!isQuoted && (character === ',' || character === '\n')) {
      record.push(field);
      field = '';
      if (character === '\n') {
        records.push(record);
        record = [];
      }
    } else field += character;
  }
  if (isQuoted)
    throw new Error('Measurement CSV contains an unclosed quoted field.');
  if (field || record.length) records.push([...record, field]);
  const [headers, ...dataRecords] = records;
  if (!headers || new Set(headers).size !== headers.length)
    throw new Error('Measurement CSV requires unique headers.');
  return dataRecords
    .filter(values => values.some(value => value !== ''))
    .map(values => {
      if (values.length !== headers.length)
        throw new Error('Measurement CSV row has the wrong number of columns.');
      return Object.fromEntries(
        headers.map((header, index) => [header, values[index]]),
      );
    });
}

export function serializeMeasurementCsv(rows) {
  const headers = Object.keys(rows[0]);
  const quoteField = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
  return (
    [
      headers.map(quoteField).join(','),
      ...rows.map(row =>
        headers.map(header => quoteField(row[header])).join(','),
      ),
    ].join('\n') + '\n'
  );
}
