import { NextResponse } from 'next/server';
import { db } from '../../../../../lib/firebase';
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

// PUT: Atualiza uma tarefa
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Next.js 15+ params é Promise
) {
  const { id } = await params;
  
  try {
    const body = await request.json();
    // Remove campos que não devem ser atualizados diretamente ou undefined
    const updateData = { ...body, updatedAt: serverTimestamp() };
    delete updateData.id;
    delete updateData.createdAt;

    const taskRef = doc(db, 'tasks', id);
    await updateDoc(taskRef, updateData);

    return NextResponse.json({ message: 'Task updated' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Deleta uma tarefa
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const taskRef = doc(db, 'tasks', id);
    await deleteDoc(taskRef);

    return NextResponse.json({ message: 'Task deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}