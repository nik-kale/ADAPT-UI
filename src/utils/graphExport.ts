import html2canvas from 'html2canvas';
import { logger } from './logger';

/**
 * Export graph as PNG image
 */
export const exportGraphAsPNG = async (
  element: HTMLElement,
  filename: string = 'rca-graph.png'
): Promise<void> => {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#0f172a', // adapt-bg-primary
      scale: 2, // Higher resolution
      logging: false,
    });

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();

    logger.info('Graph exported as PNG', { filename });
  } catch (error) {
    logger.error('Failed to export graph as PNG', error);
    throw error;
  }
};

/**
 * Export graph as SVG image
 */
export const exportGraphAsSVG = async (
  element: HTMLElement,
  filename: string = 'rca-graph.svg'
): Promise<void> => {
  try {
    // Clone the element
    const clone = element.cloneNode(true) as HTMLElement;
    const bbox = element.getBoundingClientRect();

    // Create SVG wrapper
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', String(bbox.width));
    svg.setAttribute('height', String(bbox.height));
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    // Create foreignObject to embed HTML
    const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    foreignObject.setAttribute('width', String(bbox.width));
    foreignObject.setAttribute('height', String(bbox.height));
    foreignObject.appendChild(clone);

    svg.appendChild(foreignObject);

    // Serialize SVG
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    // Create download link
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);

    logger.info('Graph exported as SVG', { filename });
  } catch (error) {
    logger.error('Failed to export graph as SVG', error);
    throw error;
  }
};

/**
 * Export graph as JSON data
 */
export const exportGraphAsJSON = (
  data: any,
  filename: string = 'rca-graph.json'
): void => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);

    logger.info('Graph exported as JSON', { filename });
  } catch (error) {
    logger.error('Failed to export graph as JSON', error);
    throw error;
  }
};

/**
 * Copy graph to clipboard as image
 */
export const copyGraphToClipboard = async (element: HTMLElement): Promise<void> => {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#0f172a',
      scale: 2,
      logging: false,
    });

    canvas.toBlob(async (blob) => {
      if (!blob) {
        throw new Error('Failed to create blob');
      }

      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);

      logger.info('Graph copied to clipboard');
    });
  } catch (error) {
    logger.error('Failed to copy graph to clipboard', error);
    throw error;
  }
};

/**
 * Print graph
 */
export const printGraph = (element: HTMLElement): void => {
  try {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Failed to open print window');
    }

    const clone = element.cloneNode(true) as HTMLElement;

    // Create document structure safely without XSS vulnerability
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>RCA Graph</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              background: #0f172a;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body id="print-body">
        </body>
      </html>
    `);

    printWindow.document.close();

    // Append clone safely using DOM API instead of string interpolation
    const body = printWindow.document.getElementById('print-body');
    if (body) {
      body.appendChild(clone);
    }

    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);

    logger.info('Graph sent to printer');
  } catch (error) {
    logger.error('Failed to print graph', error);
    throw error;
  }
};
