import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import signatureImg from '../src/assets/signature.jpeg';

export const generateInvoice = (order) => {

    const doc = new jsPDF({ unit: "mm", format: "a4" });

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    const brandDeep = [15, 23, 42];
    const brandAccent = [79, 70, 229];
    const slate500 = [100, 116, 139];
    const slate200 = [226, 232, 240];
    const white = [255, 255, 255];

    // Helper function to format currency
    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return "Rs. 0";

        // Convert to number and fix to 2 decimal places
        const num = Number(amount);
        if (isNaN(num)) return "Rs. 0";

        // Format with 2 decimal places and remove trailing .00 if not needed
        const formatted = num.toFixed(2).replace(/\.00$/, '');
        return `Rs. ${formatted}`;
    };

    // Helper to get safe number
    const getSafeNumber = (value) => {
        if (value === undefined || value === null) return 0;
        const num = Number(value);
        return isNaN(num) ? 0 : num;
    };

    /* ---------------- ORDER INFO ---------------- */

    const orderId = order.orderId || "ORD-UNKNOWN";

    const dateStr = order.createdAt
        ? new Date(order.createdAt).toLocaleDateString("en-IN")
        : "N/A";

    /* ---------------- TABLE DATA ---------------- */

    const tableData = (order.items || []).map((item, i) => [
        i + 1,
        item.name,
        item.size || "-",
        item.quantity,
        formatCurrency(item.price),
        formatCurrency(item.totalPrice)
    ]);

    /* ---------------- HEADER DRAWER ---------------- */

    const drawHeader = (continued = false) => {

        doc.setFontSize(26);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...brandDeep);
        doc.text("Namma", 18, 25);

        doc.setTextColor(...brandAccent);
        doc.text("Cart", 18 + doc.getTextWidth("Namma") + 2, 25);

        doc.setFontSize(18);
        doc.setTextColor(...brandDeep);
        doc.text("INVOICE", pageWidth - 15, 22, { align: "right" });

        doc.setFontSize(9);
        doc.setTextColor(...slate500);

        doc.text(`Order: ${orderId}`, pageWidth - 15, 30, { align: "right" });
        doc.text(`Date: ${dateStr}`, pageWidth - 15, 35, { align: "right" });

        doc.setDrawColor(...slate200);
        doc.line(15, 40, pageWidth - 15, 40);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...brandDeep);

        doc.text(
            continued ? "ORDER ITEMS (continued)" : "ORDER ITEMS",
            15,
            48
        );

    };

    /* ---------------- TABLE ---------------- */

    autoTable(doc, {
        startY: 50,

        head: [["#", "Product", "Size", "Qty", "Unit Price", "Amount"]],

        body: tableData,

        theme: "grid",

        margin: { left: 15, right: 15 },

        headStyles: {
            fillColor: brandDeep,
            textColor: white,
            fontSize: 9
        },

        bodyStyles: {
            fontSize: 9
        },

        didDrawPage: (data) => {

            const continued = data.pageNumber > 1;
            drawHeader(continued);

        }

    });

    /* ---------------- SAFE POSITION ---------------- */

    let finalY = doc.lastAutoTable.finalY;

    if (finalY + 80 > pageHeight) {

        doc.addPage();
        finalY = 20;

    }

    /* ---------------- TOTAL CALCULATIONS ---------------- */

    // Get values from order with proper field names
    const subtotal = getSafeNumber(order.subtotal);
    const gstAmount = getSafeNumber(order.gst);
    const deliveryCharge = getSafeNumber(order.deliveryCharge);
    const discount = getSafeNumber(order.discount);
    const totalAmount = getSafeNumber(order.totalAmount);

    /* ---------------- SUMMARY ---------------- */

    const sumX = 120;
    const sumW = pageWidth - sumX - 15;
    const tY = finalY + 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");

    // Subtotal
    doc.text("Subtotal", sumX, tY);
    doc.text(formatCurrency(subtotal), sumX + sumW, tY, { align: "right" });

    // GST
    doc.text("GST (18%)", sumX, tY + 8);
    doc.text(formatCurrency(gstAmount), sumX + sumW, tY + 8, { align: "right" });

    // Delivery Charge
    doc.text("Delivery", sumX, tY + 16);
    doc.text(
        deliveryCharge === 0 ? "FREE" : formatCurrency(deliveryCharge),
        sumX + sumW,
        tY + 16,
        { align: "right" }
    );

    // Discount (if any)
    if (discount > 0) {
        doc.text("Discount", sumX, tY + 24);
        doc.text(`-${formatCurrency(discount)}`, sumX + sumW, tY + 24, { align: "right" });

        doc.setFontSize(12);
        doc.text("TOTAL", sumX, tY + 34);
        doc.text(formatCurrency(totalAmount), sumX + sumW, tY + 34, { align: "right" });
    } else {
        doc.setFontSize(12);
        doc.text("TOTAL", sumX, tY + 24);
        doc.text(formatCurrency(totalAmount), sumX + sumW, tY + 24, { align: "right" });
    }

    /* ---------------- SIGNATURE ---------------- */

    /* ---------------- SIGNATURE ---------------- */

    const sigY = pageHeight - 60;

    // Add signature image (without the box)
    try {
        doc.addImage(
            signatureImg,
            'PNG',
            pageWidth - 65,
            sigY - 5,
            40,
            20,
            undefined,
            'FAST'
        );
    } catch (error) {
        console.error("Error adding signature image:", error);
        // Fallback
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.text("Signature", pageWidth - 45, sigY + 9, { align: "center" });
    }

    // Text below signature
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Authorised Signatory", pageWidth - 45, sigY + 24, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.text("Namma Cart Pvt. Ltd.", pageWidth - 45, sigY + 30, { align: "center" });

    /* ---------------- PAGE NUMBERS ---------------- */

    const pageCount = doc.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {

        doc.setPage(i);

        doc.setFontSize(8);
        doc.setTextColor(...slate500);

        doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth / 2,
            pageHeight - 25,
            { align: "center" }
        );

    }

    /* ---------------- FOOTER ---------------- */

    doc.setPage(pageCount);

    const footerY = pageHeight - 20;

    doc.setFillColor(...brandDeep);
    doc.rect(0, footerY, pageWidth, 20, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(199, 210, 254);

    doc.text(
        "Thank you for shopping with Namma Cart!",
        pageWidth / 2,
        footerY + 8,
        { align: "center" }
    );

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");

    doc.text(
        "support@nammacart.com | +91 98765 43210 | www.nammacart.com",
        pageWidth / 2,
        footerY + 14,
        { align: "center" }
    );

    /* ---------------- SAVE ---------------- */

    const safeId = (order.orderId || "order").replace(/[^a-zA-Z0-9_-]/g, "-");

    doc.save(`invoice.pdf`);

};