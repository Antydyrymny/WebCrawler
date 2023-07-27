import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
