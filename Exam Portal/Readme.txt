cd LMS-PROJECT

npm init -y

npm install --save-dev concurrently

{
  "name": "project-name",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "concurrently \"npm run server\" \"npm run client\"",
    "server": "cd server && npm start",
    "client": "cd client && npm start",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "devDependencies": {
    "concurrently": "^9.1.2"
  }
}

in client
"scripts": {
  "start": "react-scripts start"
}

in server
"scripts": {
  "start": "node index.js"  
}

npm start


PROJECT/
├── client/               <-- React frontend code
│   ├── node_modules/     <-- Frontend dependencies
│   ├── package.json      <-- Frontend dependencies and scripts
│   ├── package-lock.json <-- Locked versions of frontend dependencies
│   ├── public/           <-- Public files (HTML, icons, etc.)
│   └── src/              <-- Source code for the React app
├── node_modules/         <-- Root node_modules for running concurrently
├── server/               <-- Node.js backend code
│   ├── dbconfig/         <-- Database configuration files
│   ├── node_modules/     <-- Backend dependencies
│   ├── routes/           <-- Express routes for the backend
│   ├── package.json      <-- Backend dependencies and scripts
│   ├── package-lock.json <-- Locked versions of backend dependencies
│   ├── index.js          <-- Main backend entry point
│   ├── Logindata.js      <-- Login data handling
│   └── .env              <-- Environment variables
├── package.json          <-- Root package.json (for running concurrently)
├── package-lock.json     <-- Root package-lock.json (locks root dependencies)
└── .gitignore            <-- Git ignore file


