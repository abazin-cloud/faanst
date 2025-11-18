-- Migration pour ajouter les colonnes manquantes à la table users existante

-- Ajouter la colonne password si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'password'
  ) THEN
    ALTER TABLE users ADD COLUMN password TEXT;
  END IF;
END $$;

-- Mettre à jour les colonnes optionnelles si nécessaire
DO $$ 
BEGIN
  -- Ajouter image si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'image'
  ) THEN
    ALTER TABLE users ADD COLUMN image TEXT;
  END IF;

  -- Ajouter email_verified si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE users ADD COLUMN email_verified TIMESTAMP;
  END IF;

  -- Ajouter created_at si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
  END IF;

  -- Ajouter updated_at si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
  END IF;
END $$;

COMMENT ON COLUMN users.password IS 'Mot de passe hashé avec bcrypt';
COMMENT ON COLUMN users.email_verified IS 'Date de vérification de l''email';
COMMENT ON COLUMN users.image IS 'URL de l''image de profil de l''utilisateur';

