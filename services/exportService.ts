import { HistoryItem } from '../types';

// Declare globals from CDN scripts
declare var jspdf: any;
declare var html2canvas: any;

const triggerDownload = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const getSanitizedTitle = (item: HistoryItem) => {
    return (item.customTitle || item.listingData.itemName).replace(/[^a-z0-9]/gi, '_').toLowerCase();
};

export const exportAsTxt = (item: HistoryItem) => {
    const { itemName, suggestedPrice, listing } = item.listingData;
    const priceInfo = typeof suggestedPrice === 'string' ? suggestedPrice : suggestedPrice.range;
    let content = `Item: ${itemName}\n`;
    content += `Platform: ${item.platform}\n`;
    content += `Suggested Price: ${priceInfo}\n\n`;
    content += `--- Listing ---\n`;
    content += `Title: ${listing.title}\n\n`;
    content += `Description:\n${listing.description.replace(/<[^>]+>/g, '')}\n\n`; // Strip HTML for TXT
    if (listing.tags) {
        content += `Tags: ${listing.tags.join(', ')}\n`;
    }
    triggerDownload(content, `${getSanitizedTitle(item)}.txt`, 'text/plain');
};

export const exportAsJson = (item: HistoryItem) => {
    triggerDownload(JSON.stringify(item, null, 2), `${getSanitizedTitle(item)}.json`, 'application/json');
};

export const exportAsCsv = (item: HistoryItem) => {
    const { itemName, suggestedPrice, listing } = item.listingData;
    const priceInfo = typeof suggestedPrice === 'string' ? suggestedPrice : suggestedPrice.range;
    const headers = "itemName,platform,price,title,description,tags";
    const values = [
        `"${itemName.replace(/"/g, '""')}"`,
        `"${item.platform}"`,
        `"${priceInfo}"`,
        `"${listing.title.replace(/"/g, '""')}"`,
        `"${listing.description.replace(/"/g, '""')}"`,
        `"${(listing.tags || []).join(', ')}"`,
    ].join(',');
    const content = `${headers}\n${values}`;
    triggerDownload(content, `${getSanitizedTitle(item)}.csv`, 'text/csv');
};

export const exportAsDoc = (item: HistoryItem) => {
    const { itemName, suggestedPrice, listing } = item.listingData;
    const priceInfo = typeof suggestedPrice === 'string' ? suggestedPrice : suggestedPrice.range;
    const content = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Export</title></head>
        <body>
            <h1>${itemName}</h1>
            <p><strong>Platform:</strong> ${item.platform}</p>
            <p><strong>Suggested Price:</strong> ${priceInfo}</p>
            <hr/>
            <h2>${listing.title}</h2>
            <div>${listing.description}</div>
            ${listing.tags ? `<p><strong>Tags:</strong> ${listing.tags.join(', ')}</p>` : ''}
        </body>
        </html>`;
    triggerDownload(content, `${getSanitizedTitle(item)}.doc`, 'application/msword');
};

export const exportAsSql = (item: HistoryItem) => {
    const { itemName, suggestedPrice, listing } = item.listingData;
    const priceInfo = typeof suggestedPrice === 'string' ? suggestedPrice : suggestedPrice.range;
    const escapeSql = (str: string) => str.replace(/'/g, "''");
    
    const content = `
-- Exported from AI Marketplace Listing Generator
INSERT INTO listings (item_name, platform, suggested_price, title, description, tags, generated_at)
VALUES (
  '${escapeSql(itemName)}',
  '${escapeSql(item.platform)}',
  '${escapeSql(priceInfo)}',
  '${escapeSql(listing.title)}',
  '${escapeSql(listing.description)}',
  '${escapeSql((listing.tags || []).join(','))}',
  '${item.timestamp}'
);`;
    triggerDownload(content.trim(), `${getSanitizedTitle(item)}.sql`, 'application/sql');
};

export const exportAsPdf = async (element: HTMLElement | null, item: HistoryItem) => {
    if (!element) return;
    try {
        const { jsPDF } = jspdf;
        const canvas = await html2canvas(element, { useCORS: true, scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`${getSanitizedTitle(item)}.pdf`);
    } catch (e) {
        console.error("Error generating PDF:", e);
        alert("Sorry, an error occurred while generating the PDF.");
    }
};