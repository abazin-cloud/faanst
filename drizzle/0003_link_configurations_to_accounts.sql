-- Migration pour lier les configurations de véhicules aux comptes

-- Ajouter la colonne account_id à vehicle_configurations
ALTER TABLE vehicle_configurations 
ADD COLUMN IF NOT EXISTS account_id INTEGER REFERENCES accounts(id);

-- Ajouter des colonnes supplémentaires pour capturer plus d'informations de la configuration
ALTER TABLE vehicle_configurations
ADD COLUMN IF NOT EXISTS model_name TEXT,
ADD COLUMN IF NOT EXISTS finish_name TEXT,
ADD COLUMN IF NOT EXISTS color_name TEXT,
ADD COLUMN IF NOT EXISTS selected_accessories TEXT, -- JSON string of accessory IDs
ADD COLUMN IF NOT EXISTS insurance_plan TEXT, -- JSON string of insurance details
ADD COLUMN IF NOT EXISTS monthly_payment NUMERIC(10, 2);

-- Créer un index pour améliorer les performances de recherche par compte
CREATE INDEX IF NOT EXISTS idx_vehicle_configurations_account_id ON vehicle_configurations(account_id);

-- Mettre à jour le commentaire de la table
COMMENT ON TABLE vehicle_configurations IS 'Configurations de véhicules sauvegardées et liées aux comptes clients';
COMMENT ON COLUMN vehicle_configurations.account_id IS 'ID du compte client associé à cette configuration';



