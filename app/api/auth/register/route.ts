import { NextResponse } from 'next/server';
import { createUser, getUserByEmail, createVerificationToken } from '@/lib/db';
import { hashPassword, generateVerificationToken } from '@/lib/password';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Un compte existe déjà avec cet email' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await hashPassword(password);

    // Créer l'utilisateur
    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      emailVerified: null,
      image: null
    });

    // Générer un token de vérification
    const token = generateVerificationToken();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

    await createVerificationToken(email, token, expires);

    // URL de vérification
    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    // TODO: Envoyer l'email de vérification
    // Pour l'instant, nous allons juste logger l'URL
    console.log('URL de vérification:', verificationUrl);
    
    // Dans un environnement de production, vous devriez envoyer un vrai email
    // Exemple avec Resend:
    // await sendEmail({
    //   to: email,
    //   subject: 'Vérifiez votre email',
    //   html: `<p>Cliquez sur ce lien pour vérifier votre email: <a href="${verificationUrl}">${verificationUrl}</a></p>`
    // });

    return NextResponse.json({
      message: 'Compte créé avec succès. Un email de vérification a été envoyé.',
      verificationUrl // Temporaire, pour le développement
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'inscription' },
      { status: 500 }
    );
  }
}


