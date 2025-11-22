import { NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase';
import { collection, getDocs, addDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';

// --- IMPORTANTE: Força o Next.js a não fazer cache desta rota ---
export const dynamic = 'force-dynamic'; 

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  // LOG DE DEBUG: Verifique isso no terminal do VS Code
  console.log("🔍 [API] Buscando tarefas para UserID:", userId);

  if (!userId) {
    return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
  }

  try {
    const tasksRef = collection(db, 'tasks');
    
    // Tente primeiro SEM o orderBy para ver se o problema é o índice
    // Se funcionar, descomente o orderBy depois.
    const q = query(
      tasksRef, 
      where('userId', '==', userId), 
      orderBy('createdAt', 'desc') 
    );
    
    const snapshot = await getDocs(q);
    
    console.log(`📦 [API] Documentos encontrados: ${snapshot.size}`);

    const tasks = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Tratamento seguro para datas
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().getTime() : Date.now(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().getTime() : Date.now(),
      };
    });

    return NextResponse.json(tasks);
  } catch (error: any) {
    console.error("❌ [API ERROR]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, title, description, dueDate, priority, subtasks, progress, status } = body;

    const docRef = await addDoc(collection(db, 'tasks'), {
      userId,
      title,
      description,
      dueDate,
      priority,
      status: status || 'A Fazer',
      subtasks: subtasks || [],
      progress: progress || 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ id: docRef.id, message: 'Task created' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}