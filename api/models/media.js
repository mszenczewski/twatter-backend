'use strict';

import mongoose from 'mongoose';
const { Schema } = mongoose;

const MediaSchema = new Schema({
  id: {
    type: String,
    index: true
  },
  by: {
    username: {
      type: String
    },
    tweetid: {
      type: String,
    }
  },
  content: {
    contentType: String,
    data: Buffer
  },
}, {shardKey: {id: 1}});

export default mongoose.model('Media', MediaSchema);