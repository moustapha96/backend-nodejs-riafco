# RIAFCO Backoffice Management System

## 📋 Description Générale
Un système de gestion backoffice pour RIAFCO (Réseau International des Associations Francophones de Comptables et d'Organisations) permettant la gestion complète des ressources et activités de l'organisation.

## 🚀 Fonctionnalités Principales

### 1. Gestion des Utilisateurs
- Système CRUD complet
- Gestion des rôles (ADMIN, MODERATOR, MEMBER, GUEST)
- Authentification JWT sécurisée

### 2. Gestion du Contenu
- Activités de l'organisation
- Événements et calendrier
- Actualités et newsletter
- Ressources documentaires
- Partenaires et bureaux IFCL
- Timeline historique
- Pays membres

### 3. Dashboard Administratif
- Statistiques globales
- Suivi des activités récentes
- Gestion des paramètres du site

## 🛠️ Architecture Technique

### 1. Backend
- Node.js + Express.js
- PostgreSQL avec Prisma ORM
- JWT pour l'authentification
- Multer pour les uploads
- Swagger pour la documentation API

### 2. Structure
- Architecture MVC
- API REST documentée
- Gestion des uploads sécurisée
- Validation des données
- Audit logging

### 3. Sécurité
- Hashage des mots de passe (bcrypt)
- Protection CORS
- Validation des données entrantes
- Gestion des permissions par rôle

## 📁 Base de Données
Utilise PostgreSQL avec les modèles principaux :
- Users
- Activities
- Events
- Resources
- Partners
- HistoryItems
- Countries
- SiteSettings

## 🔧 Outils de Développement
- Environnement de développement configurable
- Scripts NPM automatisés
- Système de migration Prisma
- Seeding de données de test

---

*Ce projet est conçu pour être robuste, sécurisé et facilement maintenable, avec une documentation complète et des processus