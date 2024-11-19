const express = require('express');
const fs = require('fs'); 
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = 3000;

const readUsersFromFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err); 
      } else {
        try {
          const users = JSON.parse(data); 
          resolve(users);
        } catch (parseError) {
          reject(parseError); 
        }
      }
    });
  });
};

app.get('/korisnici', async (req, res) => {
    const { ime, prezime, id } = req.query;
  
    try {
      const users = await readUsersFromFile('./data.json');
  
      let filteredUsers = users;
  
      if (id) {
        filteredUsers = filteredUsers.filter((user) => user.id === parseInt(id));
        if (filteredUsers.length === 0) {
          return res.status(404).json({ poruka: `Korisnik s ID-em ${id} nije pronađen.` });
        }
      }

      if (ime) {
        filteredUsers = filteredUsers.filter((user) => user.ime.toLowerCase() === ime.toLowerCase());
        if (filteredUsers.length === 0) {
          return res.status(404).json({ poruka: `Korisnik s imenom ${ime} nije pronađen.` });
        }
      }
  
      if (prezime) {
        filteredUsers = filteredUsers.filter((user) => user.prezime.toLowerCase() === prezime.toLowerCase());
        if (filteredUsers.length === 0) {
          return res.status(404).json({ poruka: `Korisnik s prezimenom ${prezime} nije pronađen.` });
        }
      }
  
      res.status(200).json(filteredUsers);
    } catch (error) {
      console.error('Greška prilikom dohvaćanja korisnika:', error.message);
      res.status(500).json({ poruka: 'Došlo je do greške prilikom dohvaćanja korisnika.' });
    }
  });
    

app.get('/', (req, res) => {
  res.send('Pozdrav, Antonio Labinjan!');
});


  
const writeUserToFile = (filePath, newUser) => {
    return new Promise((resolve, reject) => {
      readUsersFromFile(filePath)
        .then((users) => {
          users.push(newUser);
  
          fs.writeFile(filePath, JSON.stringify(users, null, 2), 'utf8', (err) => {
            if (err) {
              return reject(err);
            }
            resolve();
          });
        })
        .catch(reject); 
    });
  };
  

app.post('/korisnici', async (req, res) => {
    const { ime, prezime } = req.body;
  
    if (!ime) {
      return res.status(400).json({ poruka: 'Greška! Nedostaje atribut ime.' });
    }
    if (!prezime) {
      return res.status(400).json({ poruka: 'Greška! Nedostaje atribut prezime.' });
    }
  
    try {
      const users = await readUsersFromFile('./data.json');
  
    
      const newId = users.length > 0 ? Math.max(...users.map((user) => user.id)) + 1 : 1;
  

      const newUser = { id: newId, ime, prezime };
  
      await writeUserToFile('./data.json', newUser);
  
      res.status(200).json({ poruka: 'Korisnik uspješno dodan!', korisnik: newUser });
    } catch (error) {
      console.error('Greška prilikom dodavanja korisnika:', error.message);
      res.status(500).json({ poruka: 'Došlo je do greške prilikom dodavanja korisnika.' });
    }
  });
    

  app.get('/protected', (req, res) => {
    const apiKey = req.query.api_key;
    const validApiKey = process.env.API_KEY; // Čitamo API ključ iz environmenta
  
    // Provjeravamo poklapanje API ključa
    if (apiKey === validApiKey) {
      res.status(200).json({ message: 'Super secret protected content!!!' });
    } else {
      res.status(401).json({ error: 'Pristup nije dozvoljen.' });
    }
  });  

// Pokretanje servera
app.listen(PORT, () => {
  console.log(`Server radi na http://localhost:${PORT}`);
});
