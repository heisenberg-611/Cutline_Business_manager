import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/modules/core/db/prisma';
import { requireAdmin } from '../../actions';
import { format } from 'date-fns';

export async function GET(_request: NextRequest) {
  try {
    await requireAdmin();
    
    const logs = await prisma.adminAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const csvRows: string[] = [];
    // CSV Header
    csvRows.push(['Timestamp', 'Admin Email', 'Action', 'Target ID', 'Metadata'].join(','));
    
    // CSV Data
    for (const log of logs) {
      const timestamp = format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss');
      const email = `"${log.adminEmail.replace(/"/g, '""')}"`;
      const action = `"${log.action}"`;
      const targetId = `"${log.targetId}"`;
      const metadata = log.metadata ? `"${JSON.stringify(log.metadata).replace(/"/g, '""')}"` : '""';
      
      csvRows.push([timestamp, email, action, targetId, metadata].join(','));
    }
    
    const csvContent = csvRows.join('\n');
    const dateStr = new Date().toISOString().split('T')[0];

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="audit-logs-${dateStr}.csv"`,
      },
    });
  } catch (error) {
    console.error('Audit Export Error:', error);
    return new NextResponse('Unauthorized', { status: 401 });
  }
}
