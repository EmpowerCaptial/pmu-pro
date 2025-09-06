import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Client API called');
    
    // Get authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log('❌ Missing or invalid authorization header');
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    console.log('🔑 Token received:', token.substring(0, 20) + '...');
    
    // Verify the JWT token and get user
    const user = await AuthService.verifyToken(token);
    if (!user) {
      console.log('❌ Invalid or expired token');
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    
    console.log('✅ User authenticated:', user.email);

    // Get client data from request body
    const { name, email, phone, notes } = await req.json();
    
    console.log('👤 Client data:', { name, email, phone });
    
    if (!name) {
      console.log('❌ Missing required fields');
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create client in database
    console.log('💾 Creating client in database...');
    const client = await prisma.client.create({
      data: {
        userId: user.id,
        name,
        email: email || null,
        phone: phone || null,
        notes: notes || null
      }
    });
    
    console.log('✅ Client created in database:', client.id);

    return NextResponse.json({ 
      success: true,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        notes: client.notes
      }
    });

  } catch (error) {
    console.error("❌ Create client error:", error);
    return NextResponse.json(
      { 
        error: "Failed to create client", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }, 
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Verify the JWT token and get user
    const user = await AuthService.verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // Get clients for this user
    const clients = await prisma.client.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        notes: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ 
      success: true,
      clients
    });

  } catch (error) {
    console.error("Get clients error:", error);
    return NextResponse.json(
      { 
        error: "Failed to get clients", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }, 
      { status: 500 }
    );
  }
}