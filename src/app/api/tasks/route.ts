import { NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase';
import { collection, getDocs, addDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';

// GET: Lista tarefas de um usuário
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
  }

  try {
    const tasksRef = collection(db, 'tasks');
    // Nota: O index composto (userId + createdAt) deve estar criado no Firebase Console
    const q = query(
      tasksRef, 
      where('userId', '==', userId), 
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    const tasks = snapshot.docs.map(doc => {
      const data = doc.data();
      // Converter Timestamp do Firestore para número/string para serialização JSON
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().getTime() : Date.now(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().getTime() : Date.now(),
      };
    });

    return NextResponse.json(tasks);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Cria uma nova tarefa
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, title, description, dueDate, priority, subtasks, progress, status } = body;

    if (!userId || !title || !dueDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

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