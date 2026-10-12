import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import ExcelJS from 'exceljs';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { eventId } = await params;
  const { searchParams } = new URL(request.url);
  const sideFilter = searchParams.get('side') || 'all'; // 'all' | 'groom' | 'bride'

  try {
    const event = await prisma.event.findFirst({
      where: {
        OR: [{ id: eventId }, { slug: eventId }],
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const whereClause: any = { eventId: event.id };
    if (sideFilter === 'groom') {
      whereClause.OR = [{ side: 'groom' }, { side: null }, { side: '' }];
    } else if (sideFilter === 'bride') {
      whereClause.side = 'bride';
    }

    const guests = await prisma.guest.findMany({
      where: whereClause,
      include: {
        rsvps: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: [{ giftReceived: 'desc' }, { createdAt: 'asc' }],
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'MyWedding App';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('ចំណងដៃ', {
      pageSetup: {
        paperSize: 9, // A4
        orientation: 'landscape',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        printTitlesRow: '1:1',
        margins: {
          left: 0.4,
          right: 0.4,
          top: 0.5,
          bottom: 0.5,
          header: 0.2,
          footer: 0.2,
        },
      },
    });

    // Define Columns
    worksheet.columns = [
      { header: 'ល.រ', key: 'index', width: 6 },
      { header: 'ឈ្មោះភ្ញៀវ', key: 'name', width: 26 },
      { header: 'ភាគី', key: 'side', width: 14 },
      { header: 'លេខទូរស័ព្ទ', key: 'phone', width: 16 },
      { header: 'ស្ថានភាព RSVP', key: 'rsvp', width: 15 },
      { header: 'ចំនួនអញ្ជើញ', key: 'invitedCount', width: 12 },
      { header: 'បានចងដៃ', key: 'giftReceived', width: 13 },
      { header: 'ប្រាក់រៀល (KHR)', key: 'giftAmountKhr', width: 18 },
      { header: 'ប្រាក់ដុល្លារ (USD)', key: 'giftAmountUsd', width: 18 },
      { header: 'កំណត់ចំណាំ', key: 'giftNote', width: 28 },
      { header: 'កាលបរិច្ឆេទចងដៃ', key: 'giftReceivedAt', width: 18 },
    ];

    // Style Header Row
    const headerRow = worksheet.getRow(1);
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.font = {
        name: 'Khmer OS Siemreap',
        size: 11,
        bold: true,
        color: { argb: 'FFFFFFFF' },
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1F2937' }, // Dark Slate / Charcoal
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF4B5563' } },
        left: { style: 'thin', color: { argb: 'FF4B5563' } },
        bottom: { style: 'medium', color: { argb: 'FF111827' } },
        right: { style: 'thin', color: { argb: 'FF4B5563' } },
      };
    });

    let totalKhr = 0;
    let totalUsd = 0;
    let countGiftReceived = 0;
    let countNotGiftReceived = 0;

    // Add Data Rows
    guests.forEach((guest, i) => {
      const isGroom = guest.side === 'groom' || !guest.side;
      const sideText = isGroom ? 'ខាងកូនកម្លោះ' : 'ខាងកូនក្រមុំ';

      const latestRsvp = guest.rsvps && guest.rsvps.length > 0 ? guest.rsvps[0] : null;
      let rsvpText = 'មិនទាន់ឆ្លើយតប';
      if (latestRsvp) {
        if (latestRsvp.status === 'ATTENDING') rsvpText = 'ចូលរួម';
        else if (latestRsvp.status === 'NOT_ATTENDING') rsvpText = 'មិនចូលរួម';
        else if (latestRsvp.status === 'MAYBE') rsvpText = 'មិនទាន់ច្បាស់';
      }

      const giftReceivedText = guest.giftReceived ? 'បានចងដៃ' : 'មិនទាន់';
      if (guest.giftReceived) {
        countGiftReceived++;
      } else {
        countNotGiftReceived++;
      }

      const khrVal = guest.giftReceived && guest.giftAmountKhr ? Number(guest.giftAmountKhr) : null;
      const usdVal = guest.giftReceived && guest.giftAmountUsd ? Number(guest.giftAmountUsd) : null;

      if (khrVal) totalKhr += khrVal;
      if (usdVal) totalUsd += usdVal;

      let dateFormatted = '-';
      if (guest.giftReceivedAt) {
        const d = new Date(guest.giftReceivedAt);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const mins = String(d.getMinutes()).padStart(2, '0');
        dateFormatted = `${day}/${month}/${year} ${hours}:${mins}`;
      }

      const row = worksheet.addRow({
        index: i + 1,
        name: guest.name,
        side: sideText,
        phone: guest.phone || '-',
        rsvp: rsvpText,
        invitedCount: guest.invitedCount || 1,
        giftReceived: giftReceivedText,
        giftAmountKhr: khrVal !== null ? khrVal : '',
        giftAmountUsd: usdVal !== null ? usdVal : '',
        giftNote: guest.giftNote || '',
        giftReceivedAt: dateFormatted,
      });

      row.height = 24;

      // Styling each cell
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.font = {
          name: 'Khmer OS Siemreap',
          size: 10,
          color: { argb: 'FF1F2937' },
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        };

        // Alignments & Number formats
        if (colNumber === 1 || colNumber === 3 || colNumber === 4 || colNumber === 5 || colNumber === 6 || colNumber === 7 || colNumber === 11) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (colNumber === 8) {
          // KHR column
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
          cell.numFmt = '#,##0 "៛"';
        } else if (colNumber === 9) {
          // USD column
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
          cell.numFmt = '$#,##0.00';
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }

        // Highlight gifted status
        if (colNumber === 7 && guest.giftReceived) {
          cell.font = { name: 'Khmer OS Siemreap', size: 10, bold: true, color: { argb: 'FF047857' } };
        }
      });
    });

    // Add Blank Separator Row
    const blankRow = worksheet.addRow([]);
    blankRow.height = 12;

    // Summary Section Header
    const summaryHeaderRow = worksheet.addRow(['', 'សរុបចំណងដៃសរុប', '', '', '', '', '', '', '', '', '']);
    worksheet.mergeCells(`B${summaryHeaderRow.number}:K${summaryHeaderRow.number}`);
    summaryHeaderRow.height = 24;
    const summaryTitleCell = summaryHeaderRow.getCell(2);
    summaryTitleCell.font = { name: 'Khmer OS Siemreap', size: 11, bold: true, color: { argb: 'FF1E3A8A' } };
    summaryTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
    summaryTitleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

    // Summary Row 1: Total KHR
    const rowKhr = worksheet.addRow(['', 'សរុបប្រាក់រៀល (KHR)', '', '', '', '', '', totalKhr, '', '', '']);
    worksheet.mergeCells(`B${rowKhr.number}:G${rowKhr.number}`);
    rowKhr.height = 22;
    rowKhr.getCell(2).font = { name: 'Khmer OS Siemreap', size: 10, bold: true };
    const khrCell = rowKhr.getCell(8);
    khrCell.font = { name: 'Khmer OS Siemreap', size: 11, bold: true, color: { argb: 'FF047857' } };
    khrCell.alignment = { vertical: 'middle', horizontal: 'right' };
    khrCell.numFmt = '#,##0 "៛"';

    // Summary Row 2: Total USD
    const rowUsd = worksheet.addRow(['', 'សរុបប្រាក់ដុល្លារ (USD)', '', '', '', '', '', '', totalUsd, '', '']);
    worksheet.mergeCells(`B${rowUsd.number}:G${rowUsd.number}`);
    rowUsd.height = 22;
    rowUsd.getCell(2).font = { name: 'Khmer OS Siemreap', size: 10, bold: true };
    const usdCell = rowUsd.getCell(9);
    usdCell.font = { name: 'Khmer OS Siemreap', size: 11, bold: true, color: { argb: 'FF047857' } };
    usdCell.alignment = { vertical: 'middle', horizontal: 'right' };
    usdCell.numFmt = '$#,##0.00';

    // Summary Row 3: Count Gift Received
    const rowCount = worksheet.addRow(['', 'ចំនួនភ្ញៀវបានចងដៃ', '', '', '', '', `${countGiftReceived} នាក់ (មិនទាន់ចងដៃ ${countNotGiftReceived} នាក់)`, '', '', '', '']);
    worksheet.mergeCells(`B${rowCount.number}:F${rowCount.number}`);
    worksheet.mergeCells(`G${rowCount.number}:K${rowCount.number}`);
    rowCount.height = 22;
    rowCount.getCell(2).font = { name: 'Khmer OS Siemreap', size: 10, bold: true };
    rowCount.getCell(7).font = { name: 'Khmer OS Siemreap', size: 10, bold: true };
    rowCount.getCell(7).alignment = { vertical: 'middle', horizontal: 'left' };

    // Apply borders to summary rows
    [rowKhr, rowUsd, rowCount].forEach((r) => {
      r.eachCell({ includeEmpty: true }, (c, colNum) => {
        if (colNum >= 2 && colNum <= 11) {
          c.border = {
            top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          };
        }
      });
    });

    // Generate Excel Buffer
    const buffer = await workbook.xlsx.writeBuffer();
    const cleanSlug = event.slug || event.id;
    const filename = `gift-records-${cleanSlug}.xlsx`;
    const encodedFilename = encodeURIComponent(`ចំណងដៃ-${cleanSlug}.xlsx`);

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodedFilename}`,
      },
    });
  } catch (error: any) {
    console.error('Export gifts excel error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to export Excel' },
      { status: 500 }
    );
  }
}
