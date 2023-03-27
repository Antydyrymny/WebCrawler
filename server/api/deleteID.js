import express from 'express';
import { userData } from './userData.js';

const router = express.Router();

// Handle delete user session ID after he leaves the webpage
export default router.post('/', (req, _) => {
    const uniqueId = req.body;
    console.log(uniqueId);
    userData.delete(uniqueId);
    console.log(userData);
});
