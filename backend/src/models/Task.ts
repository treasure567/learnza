import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    required: true,
    min: 0
  },
  requiredCount: {
    type: Number,
    required: true,
    min: 1
  },
  category: {
    type: String,
    required: true,
    enum: ['LESSON', 'CONTENT', 'STREAK', 'ACHIEVEMENT']
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  level: {
    type: Number,
    required: true,
    min: 1
  },
  order: {
    type: Number,
    required: true,
    unique: true
  }
}, {
  timestamps: true
})

taskSchema.index({ order: 1 })
taskSchema.index({ category: 1 })
taskSchema.index({ level: 1 })

const Task = mongoose.model('Task', taskSchema)

export default Task 