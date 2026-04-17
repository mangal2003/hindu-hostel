const mongoose = require("mongoose");
const Scholar = require("./models/Scholar"); // Ensure this path is correct
require("dotenv").config();

const archive = [
  {
    name: "Pt. Madan Mohan Malaviya",
    role: "Bharat Ratna | Founder of BHU",
    tag: "National Icon",
    era: "Founder Era",
  },
  {
    name: "Pt. Govind Ballabh Pant",
    role: "Former CM of UP & Home Minister",
    tag: "National Icon",
    era: "1905-1909",
  },
  {
    name: "Gulzari Lal Nanda",
    role: "Two-time Acting Prime Minister",
    tag: "Statesman",
    era: "1920s",
  },
  {
    name: "V.P. Singh",
    role: "7th Prime Minister of India",
    tag: "Prime Minister",
    era: "1950s",
  },
  {
    name: "Chandra Shekhar",
    role: "8th Prime Minister of India",
    tag: "Young Turk",
    era: "1950s",
  },
  {
    name: "Dr. Shankar Dayal Sharma",
    role: "9th President of India",
    tag: "Head of State",
    era: "1930s",
  },
  {
    name: "Madan Lal Khurana",
    role: "Former CM of Delhi",
    tag: "Leader",
    era: "1950s",
  },
  {
    name: "N.D. Tiwari",
    role: "Former CM of UP & Uttarakhand",
    tag: "Statesman",
    era: "1940s",
  },
  {
    name: "H.N. Bahuguna",
    role: "Former CM of Uttar Pradesh",
    tag: "Leader",
    era: "1940s",
  },
  {
    name: "Murli Manohar Joshi",
    role: "Former Union HRD Minister",
    tag: "Educationist",
    era: "1950s",
  },
  {
    name: "Arjun Singh",
    role: "Former CM of MP & Union Minister",
    tag: "Statesman",
    era: "1950s",
  },
  {
    name: "K.C. Pant",
    role: "Former Defense Minister",
    tag: "Leader",
    era: "1950s",
  },
  {
    name: "Satish Chandra",
    role: "Former Union Minister",
    tag: "Leader",
    era: "1940s",
  },
  {
    name: "Harivansh Rai Bachchan",
    role: "Renowned Poet (Madhushala)",
    tag: "Literature",
    era: "1920s",
  },
  {
    name: "Mahadevi Varma",
    role: "Modern Meera | Jnanpith Awardee",
    tag: "Poetry",
    era: "1920s",
  },
  {
    name: "Firaq Gorakhpuri",
    role: "Legendary Urdu Poet",
    tag: "Ghazal",
    era: "1910s",
  },
  {
    name: "Dharamvir Bharati",
    role: "Author of 'Gunahon Ka Devta'",
    tag: "Novelist",
    era: "1940s",
  },
  {
    name: "Ibn-e-Safi",
    role: "Mystery & Detective Novelist",
    tag: "Novelist",
    era: "1940s",
  },
  {
    name: "Kamleshwar",
    role: "Hindi Writer & Scriptwriter",
    tag: "Literary",
    era: "1950s",
  },
  {
    name: "Upendranath Ashk",
    role: "Playwright & Novelist",
    tag: "Literature",
    era: "1930s",
  },
  {
    name: "Dr. Vidya Niwas Mishra",
    role: "Scholar & Journalist",
    tag: "Education",
    era: "1940s",
  },
  {
    name: "Prof. Harish Chandra",
    role: "Mathematician (Representation Theory)",
    tag: "Science",
    era: "1940s",
  },
  {
    name: "Dr. Meghnad Saha",
    role: "Astrophysicist (Saha Equation)",
    tag: "Scientist",
    era: "1910s",
  },
  {
    name: "Dr. D.S. Kothari",
    role: "Architect of Defense Science",
    tag: "Physicist",
    era: "1920s",
  },
  {
    name: "Prof. Rajju Bhaiya",
    role: "Physicist & RSS Chief",
    tag: "Leader",
    era: "1940s",
  },
  {
    name: "Dr. Amar Nath Jha",
    role: "Renowned Educationist",
    tag: "Academic",
    era: "1910s",
  },
  {
    name: "Dr. Birbal Sahni",
    role: "Paleobotanist",
    tag: "Scientist",
    era: "1910s",
  },
  {
    name: "Justice J.S. Verma",
    role: "Former Chief Justice of India",
    tag: "Law",
    era: "1950s",
  },
  {
    name: "Justice Ranganath Mishra",
    role: "Former Chief Justice of India",
    tag: "Law",
    era: "1940s",
  },
  {
    name: "Justice V.N. Khare",
    role: "Former Chief Justice of India",
    tag: "Law",
    era: "1950s",
  },
  {
    name: "Justice K.N. Singh",
    role: "Former Chief Justice of India",
    tag: "Law",
    era: "1940s",
  },
];

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Database connected for seeding...");

    // Optional: Clear existing scholars if you want a fresh start
    // await Scholar.deleteMany({});

    await Scholar.insertMany(archive);
    console.log(
      `🚀 Successfully seeded ${archive.length} scholars into the database!`,
    );

    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Seeding Error:", err);
    mongoose.connection.close();
  }
}

seedDB();
