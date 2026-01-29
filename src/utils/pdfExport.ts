import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Export the decision tree canvas as a high-definition PDF
 */
export async function exportTreeToPDF(
  treeName: string,
  canvasElement: HTMLElement | null
): Promise<void> {
  if (!canvasElement) {
    alert('No tree to export. Please create a tree first.');
    return;
  }

  try {
    // Find the React Flow viewport element
    const viewport = canvasElement.querySelector('.react-flow__viewport') as HTMLElement;
    if (!viewport) {
      alert('Could not find the tree viewport.');
      return;
    }

    // Get the bounding box of all nodes to determine the tree size
    const nodes = canvasElement.querySelectorAll('.react-flow__node');
    if (nodes.length === 0) {
      alert('No nodes to export. Please create a tree first.');
      return;
    }

    // Calculate bounds of all nodes
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach((node) => {
      const rect = node.getBoundingClientRect();
      const containerRect = canvasElement.getBoundingClientRect();
      const x = rect.left - containerRect.left;
      const y = rect.top - containerRect.top;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + rect.width);
      maxY = Math.max(maxY, y + rect.height);
    });

    // Add padding around the tree
    const padding = 100;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    // Capture the canvas with high resolution
    const scale = 3; // Higher scale for better quality
    const canvas = await html2canvas(canvasElement, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#f8fafc',
      logging: false,
      // Capture the full element
      width: canvasElement.offsetWidth,
      height: canvasElement.offsetHeight,
    } as Parameters<typeof html2canvas>[1]);

    // Calculate PDF dimensions to fit the tree on a single page
    const treeWidth = maxX - minX;
    const treeHeight = maxY - minY;

    // Determine orientation based on tree dimensions
    const isLandscape = treeWidth > treeHeight;

    // Create PDF with appropriate size
    // Use a larger page size to accommodate the tree
    const pdfWidth = isLandscape ? Math.max(297, treeWidth * 0.5) : Math.max(210, treeWidth * 0.5);
    const pdfHeight = isLandscape ? Math.max(210, treeHeight * 0.5) : Math.max(297, treeHeight * 0.5);

    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [pdfWidth, pdfHeight],
    });

    // Convert canvas to image
    const imgData = canvas.toDataURL('image/png', 1.0);

    // Calculate scaling to fit the image on the page with margins
    const margin = 10;
    const availableWidth = pdfWidth - (margin * 2);
    const availableHeight = pdfHeight - (margin * 2) - 15; // Extra space for title

    const imgWidth = canvas.width / scale;
    const imgHeight = canvas.height / scale;

    const scaleX = availableWidth / imgWidth;
    const scaleY = availableHeight / imgHeight;
    const finalScale = Math.min(scaleX, scaleY, 1); // Don't scale up

    const finalWidth = imgWidth * finalScale;
    const finalHeight = imgHeight * finalScale;

    // Center the image
    const xOffset = margin + (availableWidth - finalWidth) / 2;
    const yOffset = margin + 10; // Space for title

    // Add title
    pdf.setFontSize(16);
    pdf.setTextColor(30, 41, 59); // slate-800
    pdf.text(treeName, pdfWidth / 2, margin + 5, { align: 'center' });

    // Add the image
    pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);

    // Add footer with timestamp
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184); // slate-400
    const timestamp = new Date().toLocaleString();
    pdf.text(`Generated: ${timestamp}`, pdfWidth / 2, pdfHeight - 5, { align: 'center' });

    // Save the PDF
    const fileName = `${treeName.replace(/\s+/g, '_')}.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('Error exporting PDF:', error);
    alert('Failed to export PDF. Please try again.');
  }
}
