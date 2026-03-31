import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import webpush from 'web-push';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Database connection (MariaDB/MySQL)
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hotel_db',
  };

  console.log('-----------------------------------------');
  console.log('🔍 Configuration de la base de données :');
  console.log(`   Hôte     : ${dbConfig.host}`);
  console.log(`   Port     : ${dbConfig.port}`);
  console.log(`   Utilisateur : ${dbConfig.user}`);
  console.log(`   Base     : ${dbConfig.database}`);
  console.log('-----------------------------------------');

  let pool: mysql.Pool;
  try {
    pool = mysql.createPool(dbConfig);
    // Test connection
    const connection = await pool.getConnection();
    console.log(`✅ Connecté à MariaDB/MySQL sur le port ${dbConfig.port}`);
    connection.release();
  } catch (error: any) {
    console.error('❌ Erreur de connexion à la base de données :');
    if (error.code === 'ECONNREFUSED') {
      console.error(`   Impossible de se connecter au serveur sur localhost:${dbConfig.port}.`);
      console.error('   Vérifiez que MariaDB est bien lancé dans WAMP et que le port est correct.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error(`   La base de données "${dbConfig.database}" n'existe pas.`);
      console.error('   Créez-la dans phpMyAdmin.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   Identifiants incorrects (Utilisateur ou Mot de passe).');
      console.error('   Par défaut dans WAMP : Utilisateur="root", Mot de passe="" (vide).');
    } else {
      console.error('   Détail de l\'erreur :', error.message);
    }
    // Ne pas arrêter le processus pour permettre à Vite de démarrer quand même
  }

  // Database Initialization (Create tables if they don't exist)
  async function initDb() {
    if (!pool) return;
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS config (
        id INT PRIMARY KEY AUTO_INCREMENT,
        hotelName VARCHAR(255),
        tagline VARCHAR(255),
        aboutText TEXT,
        heroImage TEXT,
        checkInTime VARCHAR(50),
        checkOutTime VARCHAR(50),
        currency VARCHAR(10),
        currencySymbol VARCHAR(10),
        paymentMode VARCHAR(50),
        depositPercentage INT,
        phone VARCHAR(50),
        email VARCHAR(255),
        address TEXT,
        city VARCHAR(100),
        hotelImage TEXT,
        mapImage TEXT,
        galleryTitle VARCHAR(255),
        galleryDescription TEXT,
        stripeEnabled TINYINT(1) DEFAULT 0,
        stripePublicKey TEXT,
        paypalEnabled TINYINT(1) DEFAULT 0,
        paypalPublicKey TEXT,
        smtpHost VARCHAR(255),
        smtpPort VARCHAR(10),
        smtpUser VARCHAR(255),
        smtpPass VARCHAR(255),
        smtpFrom VARCHAR(255),
        smtpSecure TINYINT(1) DEFAULT 0,
        confirmationMessage TEXT,
        notifyNewMessageEmail TINYINT(1) DEFAULT 1,
        notifyNewMessagePhone TINYINT(1) DEFAULT 0
      )
    `);

    // Migration: Add confirmationMessage if it doesn't exist
    try {
      await pool.query('SELECT confirmationMessage FROM config LIMIT 1');
    } catch (e) {
      console.log('Adding confirmationMessage column to config table...');
      await pool.query('ALTER TABLE config ADD COLUMN confirmationMessage TEXT');
    }

    // Migration: Add notifyNewMessageEmail if it doesn't exist
    try {
      await pool.query('SELECT notifyNewMessageEmail FROM config LIMIT 1');
    } catch (e) {
      console.log('Adding notifyNewMessageEmail column to config table...');
      await pool.query('ALTER TABLE config ADD COLUMN notifyNewMessageEmail TINYINT(1) DEFAULT 1');
    }

    // Migration: Add notifyNewMessagePhone if it doesn't exist
    try {
      await pool.query('SELECT notifyNewMessagePhone FROM config LIMIT 1');
    } catch (e) {
      console.log('Adding notifyNewMessagePhone column to config table...');
      await pool.query('ALTER TABLE config ADD COLUMN notifyNewMessagePhone TINYINT(1) DEFAULT 0');
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        endpoint TEXT NOT NULL,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        subject VARCHAR(255),
        message TEXT,
        createdAt DATETIME,
        isRead TINYINT(1) DEFAULT 0
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255),
        type VARCHAR(100),
        description TEXT,
        price DECIMAL(10, 2),
        capacity INT,
        images LONGTEXT,
        amenities LONGTEXT,
        available TINYINT(1) DEFAULT 1,
        size VARCHAR(50),
        bedType VARCHAR(100)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS reservations (
        id VARCHAR(50) PRIMARY KEY,
        roomId VARCHAR(50),
        clientId VARCHAR(50),
        checkIn DATE,
        checkOut DATE,
        totalPrice DECIMAL(10, 2),
        status VARCHAR(50),
        createdAt DATETIME,
        adults INT,
        children INT,
        addOns LONGTEXT,
        specialRequests TEXT
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id VARCHAR(50) PRIMARY KEY,
        firstName VARCHAR(100),
        lastName VARCHAR(100),
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255),
        description TEXT,
        icon VARCHAR(50)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS addOnServices (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255),
        price DECIMAL(10, 2),
        description TEXT,
        icon VARCHAR(50)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS galleryPhotos (
        id VARCHAR(50) PRIMARY KEY,
        url TEXT,
        category VARCHAR(100),
        title VARCHAR(255)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS amenities (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255),
        icon VARCHAR(50)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255),
        role VARCHAR(255),
        text TEXT,
        rating INT,
        createdAt DATETIME
      )
    `);

    // Seed initial data if empty
    const [configRows] = await pool.query('SELECT COUNT(*) as count FROM config');
    const configCount = Number((configRows as any)[0].count);
    
    if (configCount === 0) {
      console.log('🌱 Initialisation des paramètres de l\'hôtel...');
      await pool.query(`
        INSERT INTO config (
          hotelName, tagline, aboutText, heroImage, checkInTime, checkOutTime,
          currency, currencySymbol, paymentMode, depositPercentage, phone, email,
          address, city, hotelImage, mapImage, galleryTitle, galleryDescription,
          smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom, smtpSecure
        ) VALUES (
          'Hôtel de la Plage', 'Votre havre de paix face à l’océan',
          'Situé sur la côte sauvage, l’Hôtel de la Plage vous accueille dans un cadre idyllique pour un séjour inoubliable.',
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1920',
          '14:00', '11:00', 'EUR', '€', 'sur place', 30, '+33 1 23 45 67 89',
          'contact@hoteldelaplage.com', '123 Rue de la Mer', 'Biarritz',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=800',
          'Notre Galerie', 'Découvrez la beauté de notre établissement en images.',
          '', '587', '', '', '', 0
        )
      `);
    }
 
    const [roomRows] = await pool.query('SELECT COUNT(*) as count FROM rooms');
    const roomCount = Number((roomRows as any)[0].count);
    
    if (roomCount === 0) {
      console.log('🌱 Création des chambres de démonstration...');
      const initialRooms = [
        {
          id: '1',
          name: 'Chambre Standard',
          type: 'Standard',
          description: 'Une chambre confortable avec vue sur le jardin.',
          price: 85,
          capacity: 2,
          images: JSON.stringify(['https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800']),
          amenities: JSON.stringify(['Wi-Fi', 'TV', 'Climatisation']),
          available: 1,
          size: '25m²',
          bedType: '1 Lit Double'
        },
        {
          id: '2',
          name: 'Chambre Deluxe Vue Mer',
          type: 'Deluxe',
          description: 'Chambre spacieuse avec balcon privé et vue imprenable sur l’océan.',
          price: 150,
          capacity: 2,
          images: JSON.stringify(['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800']),
          amenities: JSON.stringify(['Wi-Fi', 'TV', 'Climatisation', 'Minibar', 'Balcon']),
          available: 1,
          size: '35m²',
          bedType: '1 Lit King Size'
        },
        {
          id: '3',
          name: 'Suite Familiale',
          type: 'Suite',
          description: 'Idéale pour les familles, avec deux espaces séparés.',
          price: 220,
          capacity: 4,
          images: JSON.stringify(['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800']),
          amenities: JSON.stringify(['Wi-Fi', 'TV', 'Climatisation', 'Cuisine', 'Salon']),
          available: 1,
          size: '50m²',
          bedType: '1 Lit King Size + 2 Lits Simples'
        }
      ];
 
      for (const room of initialRooms) {
        await pool.query(`
          INSERT INTO rooms (id, name, type, description, price, capacity, images, amenities, available, size, bedType)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [room.id, room.name, room.type, room.description, room.price, room.capacity, room.images, room.amenities, room.available, room.size, room.bedType]);
      }
    }
 
    const [amenityRows] = await pool.query('SELECT COUNT(*) as count FROM amenities');
    const amenityCount = Number((amenityRows as any)[0].count);
    
    if (amenityCount === 0) {
      console.log('🌱 Ajout des équipements...');
      const initialAmenities = [
        { id: '1', name: 'Wi-Fi Gratuit', icon: 'Wifi' },
        { id: '2', name: 'Climatisation', icon: 'Wind' },
        { id: '3', name: 'Petit-déjeuner', icon: 'Coffee' },
        { id: '4', name: 'Parking', icon: 'Car' },
        { id: '5', name: 'Piscine', icon: 'Waves' },
        { id: '6', name: 'Télévision', icon: 'Tv' }
      ];
      for (const amenity of initialAmenities) {
        await pool.query('INSERT INTO amenities (id, name, icon) VALUES (?, ?, ?)', [amenity.id, amenity.name, amenity.icon]);
      }
    }
 
    const [addOnRows] = await pool.query('SELECT COUNT(*) as count FROM addOnServices');
    const addOnCount = Number((addOnRows as any)[0].count);
    
    if (addOnCount === 0) {
      console.log('🌱 Ajout des services additionnels...');
      const initialAddOns = [
        { id: '1', name: 'Petit-déjeuner Buffet', price: 15, description: 'Un large choix de produits frais chaque matin.', icon: 'Coffee' },
        { id: '2', name: 'Transfert Aéroport', price: 45, description: 'Navette privée depuis ou vers l’aéroport.', icon: 'Plane' },
        { id: '3', name: 'Accès Spa & Bien-être', price: 30, description: 'Accès illimité au sauna, hammam et jacuzzi.', icon: 'Sparkles' }
      ];
      for (const addOn of initialAddOns) {
        await pool.query('INSERT INTO addOnServices (id, name, price, description, icon) VALUES (?, ?, ?, ?, ?)', [addOn.id, addOn.name, addOn.price, addOn.description, addOn.icon]);
      }
    }

    const [serviceRows] = await pool.query('SELECT COUNT(*) as count FROM services');
    const serviceCount = Number((serviceRows as any)[0].count);
    
    if (serviceCount === 0) {
      console.log('🌱 Ajout des services de l\'hôtel...');
      const initialServices = [
        { id: '1', name: 'Réception 24h/24', description: 'Notre équipe est à votre disposition jour et nuit.', icon: 'Clock' },
        { id: '2', name: 'Service de Chambre', description: 'Dégustez nos plats dans le confort de votre chambre.', icon: 'Utensils' },
        { id: '3', name: 'Conciergerie', description: 'Nous organisons vos sorties et réservations.', icon: 'UserCheck' }
      ];
      for (const svc of initialServices) {
        await pool.query('INSERT INTO services (id, name, description, icon) VALUES (?, ?, ?, ?)', [svc.id, svc.name, svc.description, svc.icon]);
      }
    }

    const [galleryRows] = await pool.query('SELECT COUNT(*) as count FROM galleryPhotos');
    const galleryCount = Number((galleryRows as any)[0].count);
    
    if (galleryCount === 0) {
      console.log('🌱 Ajout des photos de la galerie...');
      const initialPhotos = [
        { id: '1', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800', category: 'Extérieur', title: 'Vue de l\'hôtel' },
        { id: '2', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800', category: 'Chambres', title: 'Suite Royale' },
        { id: '3', url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=800', category: 'Restaurant', title: 'Notre Table' }
      ];
      for (const photo of initialPhotos) {
        await pool.query('INSERT INTO galleryPhotos (id, url, category, title) VALUES (?, ?, ?, ?)', [photo.id, photo.url, photo.category, photo.title]);
      }
    }

    const [reviewRows] = await pool.query('SELECT COUNT(*) as count FROM reviews');
    const reviewCount = Number((reviewRows as any)[0].count);
    
    if (reviewCount === 0) {
      console.log('🌱 Ajout des avis clients...');
      const initialReviews = [
        {
          id: '1',
          name: 'Jean-Pierre D.',
          role: "Voyageur d'affaires",
          text: "Un service impeccable et une vue imprenable sur la mer. Le personnel est aux petits soins, rendant chaque séjour exceptionnel.",
          rating: 5
        },
        {
          id: '2',
          name: 'Sophie M.',
          role: "Séjour en famille",
          text: "Nos enfants ont adoré la piscine et nous avons apprécié le calme et le luxe de notre suite. Une adresse incontournable à Cannes.",
          rating: 5
        },
        {
          id: '3',
          name: 'Marc A.',
          role: "Escapade romantique",
          text: "Le dîner au restaurant de l'hôtel était divin. L'atmosphère est à la fois intime et prestigieuse. Nous reviendrons sans hésiter.",
          rating: 4
        }
      ];
      for (const review of initialReviews) {
        await pool.query('INSERT INTO reviews (id, name, role, text, rating, createdAt) VALUES (?, ?, ?, ?, ?, ?)', [review.id, review.name, review.role, review.text, review.rating, new Date()]);
      }
    }
    
    console.log('✅ Base de données initialisée avec succès.');
  }

  try {
    await initDb();
  } catch (error) {
    console.error('⚠️ Impossible d\'initialiser les tables car la base de données est injoignable.');
  }

  app.use(express.json());

  // Configure Multer for file uploads
  const uploadDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  });

  // Serve uploads statically
  app.use('/uploads', express.static(uploadDir));

  // Upload endpoint
  app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });

  // API Routes
  app.get('/api/config', async (req, res) => {
    try {
      if (!pool) return res.status(500).json({ error: 'Database not connected' });
      const [rows] = await pool.query('SELECT * FROM config WHERE id = 1');
      const config = (rows as any)[0];
      if (!config) return res.status(404).json({ error: 'Config not found' });
      
      // Replace nulls with empty strings
      Object.keys(config).forEach(key => {
        if (config[key] === null) config[key] = '';
      });

      // Format back to nested object
      const formattedConfig = {
        ...config,
        stripe: { enabled: !!config.stripeEnabled, publicKey: config.stripePublicKey || '', successUrl: '', cancelUrl: '' },
        paypal: { enabled: !!config.paypalEnabled, publicKey: config.paypalPublicKey || '', successUrl: '', cancelUrl: '' },
        smtpSecure: !!config.smtpSecure,
        notifyNewMessageEmail: !!config.notifyNewMessageEmail,
        notifyNewMessagePhone: !!config.notifyNewMessagePhone
      };
      delete formattedConfig.stripeEnabled;
      delete formattedConfig.stripePublicKey;
      delete formattedConfig.paypalEnabled;
      delete formattedConfig.paypalPublicKey;
      
      res.json(formattedConfig);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch config' });
    }
  });

  app.post('/api/config', async (req, res) => {
    try {
      if (!pool) return res.status(500).json({ error: 'Database not connected' });
      const config = req.body;
      await pool.query(`
        UPDATE config SET
          hotelName = ?, tagline = ?, aboutText = ?, heroImage = ?,
          checkInTime = ?, checkOutTime = ?, currency = ?, currencySymbol = ?,
          paymentMode = ?, depositPercentage = ?, phone = ?, email = ?,
          address = ?, city = ?, hotelImage = ?, mapImage = ?,
          galleryTitle = ?, galleryDescription = ?,
          stripeEnabled = ?, stripePublicKey = ?,
          paypalEnabled = ?, paypalPublicKey = ?,
          smtpHost = ?, smtpPort = ?, smtpUser = ?, smtpPass = ?,
          smtpFrom = ?, smtpSecure = ?, confirmationMessage = ?,
          notifyNewMessageEmail = ?, notifyNewMessagePhone = ?
        WHERE id = 1
      `, [
        config.hotelName, config.tagline, config.aboutText, config.heroImage,
        config.checkInTime, config.checkOutTime, config.currency, config.currencySymbol,
        config.paymentMode, config.depositPercentage, config.phone, config.email,
        config.address, config.city, config.hotelImage, config.mapImage,
        config.galleryTitle, config.galleryDescription,
        config.stripe?.enabled ? 1 : 0, config.stripe?.publicKey || '',
        config.paypal?.enabled ? 1 : 0, config.paypal?.publicKey || '',
        config.smtpHost, config.smtpPort, config.smtpUser, config.smtpPass,
        config.smtpFrom, config.smtpSecure ? 1 : 0, config.confirmationMessage,
        config.notifyNewMessageEmail ? 1 : 0, config.notifyNewMessagePhone ? 1 : 0
      ]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update config' });
    }
  });

  app.post('/api/push/subscribe', async (req, res) => {
    try {
      if (!pool) return res.status(500).json({ error: 'Database not connected' });
      const subscription = req.body;
      await pool.query(
        'INSERT INTO push_subscriptions (endpoint, p256dh, auth) VALUES (?, ?, ?)',
        [subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth]
      );
      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Error saving push subscription:', error);
      res.status(500).json({ error: 'Failed to save subscription' });
    }
  });

  app.get('/api/messages', async (req, res) => {
    try {
      if (!pool) return res.status(500).json({ error: 'Database not connected' });
      const [messages] = await pool.query('SELECT * FROM messages ORDER BY createdAt DESC');
      res.json((messages as any[]).map(m => ({
        ...m,
        isRead: !!m.isRead,
        createdAt: m.createdAt.toISOString()
      })));
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  app.post('/api/messages', async (req, res) => {
    try {
      if (!pool) return res.status(500).json({ error: 'Database not connected' });
      const msg = req.body;
      const id = Math.random().toString(36).substr(2, 9);
      const createdAt = new Date();
      
      await pool.query(`
        INSERT INTO messages (id, name, email, phone, subject, message, createdAt, isRead)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0)
      `, [id, msg.name, msg.email, msg.phone || '', msg.subject, msg.message, createdAt]);

      // Notifications
      const [configRows] = await pool.query('SELECT * FROM config WHERE id = 1');
      const config = (configRows as any)[0];

      if (config && config.notifyNewMessageEmail && config.smtpHost && config.smtpUser && config.smtpPass) {
        const transporter = nodemailer.createTransport({
          host: config.smtpHost,
          port: parseInt(config.smtpPort),
          secure: config.smtpPort === '465',
          auth: {
            user: config.smtpUser,
            pass: config.smtpPass,
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        const mailOptions = {
          from: config.smtpFrom || config.smtpUser,
          to: config.email, // Send to hotel email
          subject: `Nouveau message de ${msg.name} - ${config.hotelName}`,
          html: `
            <h2>Nouveau message reçu via le formulaire de contact</h2>
            <p><strong>Nom :</strong> ${msg.name}</p>
            <p><strong>Email :</strong> ${msg.email}</p>
            <p><strong>Téléphone :</strong> ${msg.phone || 'Non renseigné'}</p>
            <p><strong>Sujet :</strong> ${msg.subject}</p>
            <p><strong>Message :</strong></p>
            <p>${msg.message}</p>
          `,
        };

        try {
          await transporter.sendMail(mailOptions);
        } catch (emailError) {
          console.error('Failed to send notification email:', emailError);
        }
      }

      if (config && config.notifyNewMessagePhone) {
        // Web Push Integration
        const vapidPublic = process.env.VAPID_PUBLIC_KEY;
        const vapidPrivate = process.env.VAPID_PRIVATE_KEY;

        if (vapidPublic && vapidPrivate) {
          try {
            webpush.setVapidDetails(
              'mailto:admin@serenite.com',
              vapidPublic,
              vapidPrivate
            );

            const [subscriptions]: any = await pool.query('SELECT * FROM push_subscriptions');
            const pushPayload = JSON.stringify({
              title: 'Nouveau Message - Sérénité',
              body: `${msg.name} vous a envoyé un message : "${msg.subject}"`,
              url: '/admin/messages'
            });

            for (const sub of subscriptions) {
              try {
                await webpush.sendNotification(
                  {
                    endpoint: sub.endpoint,
                    keys: {
                      p256dh: sub.p256dh,
                      auth: sub.auth
                    }
                  },
                  pushPayload
                );
              } catch (err) {
                console.error('Error sending push to subscription:', err);
                // If subscription is expired, remove it
                if (err.statusCode === 410 || err.statusCode === 404) {
                  await pool.query('DELETE FROM push_subscriptions WHERE id = ?', [sub.id]);
                }
              }
            }
            console.log(`[PUSH SENT] Notifications envoyées à ${subscriptions.length} appareils`);
          } catch (pushError) {
            console.error('Failed to send push notifications:', pushError);
          }
        } else {
          console.log(`[PUSH SIMULATION] Nouveau message de ${msg.name} (Configurez VAPID_PUBLIC_KEY pour l'envoi réel)`);
        }
      }

      res.json({ success: true, id });
    } catch (error) {
      console.error('Message error:', error);
      res.status(500).json({ error: 'Failed to save message' });
    }
  });

  app.patch('/api/messages/:id/read', async (req, res) => {
    try {
      if (!pool) return res.status(500).json({ error: 'Database not connected' });
      await pool.query('UPDATE messages SET isRead = 1 WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update message' });
    }
  });

  app.delete('/api/messages/:id', async (req, res) => {
    try {
      if (!pool) return res.status(500).json({ error: 'Database not connected' });
      await pool.query('DELETE FROM messages WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete message' });
    }
  });

  app.get('/api/rooms', async (req, res) => {
    try {
      if (!pool) return res.status(500).json({ error: 'Database not connected' });
      const [rooms] = await pool.query('SELECT * FROM rooms');
      res.json((rooms as any[]).map(r => ({
        ...r,
        images: JSON.parse(r.images || '[]'),
        amenities: JSON.parse(r.amenities || '[]'),
        available: !!r.available
      })));
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch rooms' });
    }
  });

  app.post('/api/rooms', async (req, res) => {
    try {
      if (!pool) return res.status(500).json({ error: 'Database not connected' });
      const room = req.body;
      await pool.query(`
        INSERT INTO rooms (id, name, type, description, price, capacity, images, amenities, available, size, bedType)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name), type = VALUES(type), description = VALUES(description),
          price = VALUES(price), capacity = VALUES(capacity), images = VALUES(images),
          amenities = VALUES(amenities), available = VALUES(available),
          size = VALUES(size), bedType = VALUES(bedType)
      `, [
        room.id, room.name, room.type, room.description, room.price, room.capacity,
        JSON.stringify(room.images), JSON.stringify(room.amenities),
        room.available ? 1 : 0, room.size, room.bedType
      ]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save room' });
    }
  });

  app.delete('/api/rooms/:id', async (req, res) => {
    try {
      if (!pool) return res.status(500).json({ error: 'Database not connected' });
      await pool.query('DELETE FROM rooms WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete room' });
    }
  });

  app.get('/api/reservations', async (req, res) => {
    try {
      if (!pool) return res.status(500).json({ error: 'Database not connected' });
      const [reservations] = await pool.query('SELECT * FROM reservations');
      const [clients] = await pool.query('SELECT * FROM clients');
      
      const formattedReservations = (reservations as any[]).map(resv => {
        const client = (clients as any[]).find(c => c.id === resv.clientId);
        return {
          ...resv,
          client,
          addOns: JSON.parse(resv.addOns || '[]'),
          checkIn: resv.checkIn.toISOString().split('T')[0],
          checkOut: resv.checkOut.toISOString().split('T')[0],
          createdAt: resv.createdAt.toISOString()
        };
      });
      res.json(formattedReservations);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch reservations' });
    }
  });

  app.post('/api/reservations', async (req, res) => {
    try {
      if (!pool) return res.status(500).json({ error: 'Database not connected' });
      
      let reservation, client;
      
      // Handle both nested and flat structures
      if (req.body.reservation && req.body.client) {
        reservation = req.body.reservation;
        client = req.body.client;
      } else {
        reservation = req.body;
        client = {
          id: reservation.clientId,
          firstName: reservation.clientInfo?.firstName || '',
          lastName: reservation.clientInfo?.lastName || '',
          email: reservation.clientInfo?.email || '',
          phone: reservation.clientInfo?.phone || '',
          address: ''
        };
      }

      if (!reservation || !client || !client.id) {
        return res.status(400).json({ error: 'Invalid reservation data' });
      }
      
      // Save client
      await pool.query(`
        INSERT INTO clients (id, firstName, lastName, email, phone, address)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          firstName = VALUES(firstName), lastName = VALUES(lastName),
          email = VALUES(email), phone = VALUES(phone), address = VALUES(address)
      `, [client.id, client.firstName, client.lastName, client.email, client.phone, client.address]);

      // Save reservation
      const adults = reservation.adults || reservation.guests || 1;
      const children = reservation.children || 0;

      await pool.query(`
        INSERT INTO reservations (id, roomId, clientId, checkIn, checkOut, totalPrice, status, createdAt, adults, children, addOns, specialRequests)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        reservation.id, reservation.roomId, client.id, reservation.checkIn, reservation.checkOut,
        reservation.totalPrice, reservation.status, new Date(),
        adults, children, JSON.stringify(reservation.addOns || []),
        reservation.specialRequests || ''
      ]);

      // Send confirmation email
      const [configRows] = await pool.query('SELECT * FROM config WHERE id = 1');
      const config = (configRows as any)[0];
      
      if (config && config.smtpHost && config.smtpUser && config.smtpPass) {
        const [addOnRows] = await pool.query('SELECT * FROM addOnServices');
        const allAddOns = addOnRows as any[];
        const selectedAddOns = (reservation.addOns || []).map((id: string) => 
          allAddOns.find(a => a.id === id)
        ).filter(Boolean);

        const addOnsText = selectedAddOns.length > 0 
          ? selectedAddOns.map(a => `${a.name} (${a.price} ${config.currencySymbol})`).join(', ')
          : 'Aucun service supplémentaire';

        const addOnsHtml = selectedAddOns.length > 0
          ? `<ul style="margin: 0; padding-left: 20px;">${selectedAddOns.map(a => `<li>${a.name} (${a.price} ${config.currencySymbol})</li>`).join('')}</ul>`
          : 'Aucun service supplémentaire';

        const transporter = nodemailer.createTransport({
          host: config.smtpHost,
          port: parseInt(config.smtpPort),
          secure: config.smtpPort === '465',
          auth: {
            user: config.smtpUser,
            pass: config.smtpPass,
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        const mailOptions = {
          from: config.smtpFrom || config.smtpUser,
          to: client.email,
          replyTo: config.email,
          subject: `Confirmation de réservation - ${config.hotelName}`,
          html: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
              <div style="background-color: #18181b; color: white; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">${config.hotelName}</h1>
                <p style="margin: 10px 0 0; opacity: 0.8;">Confirmation de votre séjour</p>
              </div>
              <div style="padding: 40px;">
                <p style="font-size: 16px;">Bonjour <strong>${client.firstName} ${client.lastName}</strong>,</p>
                
                <p style="font-size: 16px; margin: 20px 0;">
                  ${(config.confirmationMessage || "Merci pour votre réservation ! Voici les détails de votre séjour :")
                    .replace(/{{clientName}}/g, `${client.firstName} ${client.lastName}`)
                    .replace(/{{checkIn}}/g, reservation.checkIn)
                    .replace(/{{checkOut}}/g, reservation.checkOut)
                    .replace(/{{id}}/g, reservation.id)
                    .replace(/{{totalPrice}}/g, reservation.totalPrice)
                    .replace(/{{currencySymbol}}/g, config.currencySymbol)
                    .replace(/{{hotelName}}/g, config.hotelName)
                    .replace(/{{addOns}}/g, addOnsHtml)
                  }
                </p>

                <div style="background-color: #f9f9f9; padding: 25px; border-radius: 8px; margin: 30px 0;">
                  <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #71717a;">Détails de la réservation</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #71717a;">Numéro :</td>
                      <td style="padding: 8px 0; font-weight: bold; text-align: right;">#${reservation.id}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #71717a;">Arrivée :</td>
                      <td style="padding: 8px 0; font-weight: bold; text-align: right;">${reservation.checkIn}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #71717a;">Départ :</td>
                      <td style="padding: 8px 0; font-weight: bold; text-align: right;">${reservation.checkOut}</td>
                    </tr>
                    ${selectedAddOns.length > 0 ? `
                      <tr>
                        <td style="padding: 8px 0; color: #71717a; vertical-align: top;">Services :</td>
                        <td style="padding: 8px 0; font-weight: bold; text-align: right; font-size: 12px;">
                          ${selectedAddOns.map(a => `<div>${a.name} (${a.price} ${config.currencySymbol})</div>`).join('')}
                        </td>
                      </tr>
                    ` : ''}
                    <tr>
                      <td style="padding: 8px 0; color: #71717a;">Total :</td>
                      <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #18181b; font-size: 18px;">${reservation.totalPrice} ${config.currencySymbol}</td>
                    </tr>
                  </table>
                </div>

                <p style="font-size: 14px; color: #71717a; text-align: center; margin-top: 40px;">
                  Nous avons hâte de vous accueillir !<br>
                  Si vous avez des questions, n'hésitez pas à nous contacter à <a href="mailto:${config.email}" style="color: #18181b; font-weight: bold; text-decoration: none;">${config.email}</a> ou au <span style="color: #18181b; font-weight: bold;">${config.phone}</span>.
                </p>
              </div>
              <div style="background-color: #f4f4f5; padding: 20px; text-align: center; font-size: 12px; color: #a1a1aa;">
                &copy; ${new Date().getFullYear()} ${config.hotelName}. ${config.address}, ${config.city}.
              </div>
            </div>
          `,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log('Confirmation email sent to:', client.email);
        } catch (emailError: any) {
          console.error('Failed to send confirmation email:', emailError);
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Reservation error:', error);
      res.status(500).json({ error: 'Failed to save reservation' });
    }
  });

  app.put('/api/reservations/:id', async (req, res) => {
    try {
      if (!pool) return res.status(500).json({ error: 'Database not connected' });
      const { status, checkIn, checkOut, roomId, totalPrice, specialRequests } = req.body;
      
      await pool.query(`
        UPDATE reservations 
        SET status = ?, checkIn = ?, checkOut = ?, roomId = ?, totalPrice = ?, specialRequests = ?
        WHERE id = ?
      `, [status, checkIn, checkOut, roomId, totalPrice, specialRequests, req.params.id]);
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update reservation' });
    }
  });

  app.delete('/api/reservations/:id', async (req, res) => {
    try {
      if (!pool) return res.status(500).json({ error: 'Database not connected' });
      await pool.query('DELETE FROM reservations WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete reservation' });
    }
  });

  app.get('/api/services', async (req, res) => {
    try {
      if (!pool) return res.status(500).json({ error: 'Database not connected' });
      const [services] = await pool.query('SELECT * FROM services');
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch services' });
    }
  });

  app.post('/api/services', async (req, res) => {
    try {
      if (!pool) return res.status(500).json({ error: 'Database not connected' });
      const svc = req.body;
      await pool.query(`
        INSERT INTO services (id, name, description, icon)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name), description = VALUES(description), icon = VALUES(icon)
      `, [svc.id, svc.name, svc.description, svc.icon]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save service' });
    }
  });

  app.delete('/api/services/:id', async (req, res) => {
    try {
      if (!pool) return res.status(500).json({ error: 'Database not connected' });
      await pool.query('DELETE FROM services WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete service' });
    }
  });

  app.get('/api/gallery', async (req, res) => {
    try {
      if (!pool) return res.status(500).json({ error: 'Database not connected' });
      const [photos] = await pool.query('SELECT * FROM galleryPhotos');
      res.json(photos);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch gallery' });
    }
  });

  app.post('/api/gallery', async (req, res) => {
    try {
      if (!pool) return res.status(500).json({ error: 'Database not connected' });
      const photo = req.body;
      await pool.query(`
        INSERT INTO galleryPhotos (id, url, category, title)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          url = VALUES(url), category = VALUES(category), title = VALUES(title)
      `, [photo.id, photo.url, photo.category, photo.title]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save photo' });
    }
  });

  app.delete('/api/gallery/:id', async (req, res) => {
    try {
      if (!pool) return res.status(500).json({ error: 'Database not connected' });
      await pool.query('DELETE FROM galleryPhotos WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete photo' });
    }
  });

  app.get('/api/clients', async (req, res) => {
    try {
      if (!pool) return res.status(500).json({ error: 'Database not connected' });
      const [clients] = await pool.query('SELECT * FROM clients');
      res.json(clients);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch clients' });
    }
  });

  app.get('/api/amenities', async (req, res) => {
    try {
      if (!pool) return res.status(500).json({ error: 'Database not connected' });
      const [amenities] = await pool.query('SELECT * FROM amenities');
      res.json(amenities);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch amenities' });
    }
  });

  app.get('/api/addOnServices', async (req, res) => {
    try {
      if (!pool) return res.status(500).json({ error: 'Database not connected' });
      const [services] = await pool.query('SELECT * FROM addOnServices');
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch add-on services' });
    }
  });

  app.post('/api/addOnServices', async (req, res) => {
    try {
      if (!pool) return res.status(500).json({ error: 'Database not connected' });
      const svc = req.body;
      await pool.query(`
        INSERT INTO addOnServices (id, name, price, description, icon)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name), price = VALUES(price), description = VALUES(description), icon = VALUES(icon)
      `, [svc.id, svc.name, svc.price, svc.description, svc.icon]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save add-on service' });
    }
  });

  app.delete('/api/addOnServices/:id', async (req, res) => {
    try {
      if (!pool) return res.status(500).json({ error: 'Database not connected' });
      await pool.query('DELETE FROM addOnServices WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete add-on service' });
    }
  });

  app.get('/api/reviews', async (req, res) => {
    try {
      if (!pool) return res.status(500).json({ error: 'Database not connected' });
      const [reviews] = await pool.query('SELECT * FROM reviews ORDER BY createdAt DESC');
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  });

  app.post('/api/reviews', async (req, res) => {
    try {
      if (!pool) return res.status(500).json({ error: 'Database not connected' });
      const review = req.body;
      await pool.query(`
        INSERT INTO reviews (id, name, role, text, rating, createdAt)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name), role = VALUES(role), text = VALUES(text), rating = VALUES(rating)
      `, [review.id, review.name, review.role, review.text, review.rating, new Date()]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save review' });
    }
  });

  app.delete('/api/reviews/:id', async (req, res) => {
    try {
      if (!pool) return res.status(500).json({ error: 'Database not connected' });
      await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete review' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
