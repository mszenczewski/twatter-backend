'use strict';

import mongoose from 'mongoose';
const { Schema } = mongoose;

const ItemSchema = new Schema({
  id: {
    type: String
  },
  username: {
    type: String,
    index: true
  },
  property: {
    likes: {
      type: Number
    }
  },
  retweeted: {
    type: Number
  },
  content: {
    type: String
  },
  timestamp: {
    type: String
  },
  parent: {
    type: String
  },
  media: {
    type: Array
  }
}, {shardKey: {id: 1}});

ItemSchema.index( { content: 'text' , id: 'text'} );

export default mongoose.model('Items', ItemSchema);