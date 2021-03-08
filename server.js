// eslint-disablenext-line import/no-extraneous-dependencies
import express from 'express';
import { getVideoData } from './getVideoData';

const app = express();
const PORT = 3000;

app.get('/', getVideoData);

app.listen(process.env.PORT || PORT);
