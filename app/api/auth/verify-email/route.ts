import { NextResponse } from 'next/server';
import { getVerificationToken, deleteVerificationToken, updateUser, getUserByEmail } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, email } = body;

    if (!token || !email) {
      return NextResponse.json(
        { success: false, error: 'Token ou email manquant' },
        { status: 400 }
      );
    }

    // Vérifier le token
    const verificationToken = await getVerificationToken(email, token);

    if (!verificationToken) {
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 400 }
      );
    }

    // Vérifier si le token a expiré
    if (new Date() > new Date(verificationToken.expires)) {
      await deleteVerificationToken(email, token);
      return NextResponse.json(
        { success: false, error: 'Le token a expiré. Veuillez vous réinscrire.' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur
    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Marquer l'email comme vérifié
    await updateUser(user.id, {
      emailVerified: new Date()
    });

    // Supprimer le token
    await deleteVerificationToken(email, token);

    return NextResponse.json({
      success: true,
      message: 'Email vérifié avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la vérification de l\'email:', error);
    return NextResponse.json(
      { success: false, error: 'Une erreur est survenue lors de la vérification' },
      { status: 500 }
    );
  }
}


















