import dotenv from 'dotenv';
import app from './app.js';

// Start the server
dotenv.config();

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
