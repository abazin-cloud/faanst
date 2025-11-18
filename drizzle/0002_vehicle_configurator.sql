-- Migration pour le configurateur de véhicules étape par étape

-- Ajouter les colonnes supplémentaires à la table vehicles
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS base_price NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Créer la table vehicle_options pour les options et accessoires
CREATE TABLE IF NOT EXISTS vehicle_options (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'option' or 'accessoire'
  price NUMERIC(10, 2) NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Créer la table vehicle_configurations pour sauvegarder les configurations
CREATE TABLE IF NOT EXISTS vehicle_configurations (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  selected_options TEXT, -- JSON string of option IDs
  financing_type TEXT, -- 'comptant', 'credit', 'leasing'
  financing_duration INTEGER, -- in months
  financing_down_payment NUMERIC(10, 2),
  total_price NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'brouillon', -- 'brouillon', 'envoye', 'accepte'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_vehicle_options_category ON vehicle_options(category);
CREATE INDEX IF NOT EXISTS idx_vehicle_configurations_vehicle_id ON vehicle_configurations(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_configurations_status ON vehicle_configurations(status);

-- Insérer quelques options d'exemple (optionnel - à supprimer si vous voulez partir de zéro)
INSERT INTO vehicle_options (name, category, price, description) VALUES
('Toit panoramique', 'option', 1500.00, 'Toit ouvrant panoramique électrique'),
('Sièges chauffants', 'option', 800.00, 'Sièges avant chauffants réglables'),
('Pack hiver', 'option', 1200.00, 'Volant chauffant + sièges chauffants arrière + lave-phares'),
('Navigation GPS Premium', 'option', 2000.00, 'Système de navigation 3D avec trafic en temps réel'),
('Caméra 360°', 'option', 900.00, 'Caméra de recul avec vision 360°'),
('Pack LED', 'option', 1100.00, 'Phares LED full + feux arrière LED'),
('Tapis de sol caoutchouc', 'accessoire', 150.00, 'Ensemble de tapis caoutchouc toutes saisons'),
('Barres de toit', 'accessoire', 350.00, 'Barres de toit aluminium'),
('Housse de protection', 'accessoire', 200.00, 'Housse de protection extérieure'),
('Kit de gonflage', 'accessoire', 80.00, 'Kit de gonflage et réparation rapide');

COMMENT ON TABLE vehicle_options IS 'Options et accessoires disponibles pour les véhicules';
COMMENT ON TABLE vehicle_configurations IS 'Configurations de véhicules sauvegardées par les clients';



