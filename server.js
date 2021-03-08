// eslint-disablenext-line import/no-extraneous-dependencies
import express from 'express';
import path from 'path';
import { getVideoData } from './getVideoData';

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'src/css')));

app.get('/', getVideoData);

app.listen(PORT);
