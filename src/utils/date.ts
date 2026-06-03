export const formatDateToDDMMYYYY = (isoDateString?: string): string => {
  if (!isoDateString) return '';
  // Extrai apenas a parte da data caso seja uma string ISO completa (ex: YYYY-MM-DDT...)
  const dateOnly = isoDateString.split('T')[0];
  
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateOnly)) {
    return dateOnly;
  }
  
  const parts = dateOnly.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return isoDateString;
};

export const formatDateToYYYYMMDD = (ddmmyyyyString?: string): string => {
  if (!ddmmyyyyString) return '';
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(ddmmyyyyString)) {
    return ddmmyyyyString;
  }
  
  const parts = ddmmyyyyString.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  }
  return ddmmyyyyString;
};
