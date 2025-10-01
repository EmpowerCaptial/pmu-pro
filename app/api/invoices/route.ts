import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        invoices: {
          include: {
            client: true,
            items: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ invoices: user.invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, providerName, memo, clientId, items, taxRate, dueDate, paymentSchedule } = body;

    // Generate invoice number
    const invoiceCount = await prisma.invoice.count({
      where: { userId: user.id }
    });
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(4, '0')}`;

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    const invoice = await prisma.invoice.create({
      data: {
        userId: user.id,
        clientId: clientId || null,
        invoiceNumber,
        title,
        providerName,
        memo,
        subtotal,
        taxRate,
        taxAmount,
        total,
        dueDate: dueDate ? new Date(dueDate) : null,
        paymentSchedule: paymentSchedule ? JSON.stringify(paymentSchedule) : null,
        items: {
          create: items.map((item: any) => ({
            type: item.type,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice
          }))
        }
      },
      include: {
        client: true,
        items: true
      }
    });

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
