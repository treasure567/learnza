import mongoose from 'mongoose'
import Task from '@/models/Task'

const tasks = [
    {
        title: 'Create your first lesson',
        description: 'Generate your very first lesson using our AI-powered system',
        points: 50,
        requiredCount: 1,
        category: 'LESSON',
        level: 1,
        order: 1
    },
    {
        title: 'Complete your first content',
        description: 'Complete your first lesson content',
        points: 50,
        requiredCount: 1,
        category: 'CONTENT',
        level: 1,
        order: 2
    },
    {
        title: 'Login streak - 3 days',
        description: 'Login for 3 consecutive days',
        points: 30,
        requiredCount: 3,
        category: 'STREAK',
        level: 1,
        order: 3
    },
    {
        title: 'Generate 5 lessons',
        description: 'Create a total of 5 lessons',
        points: 100,
        requiredCount: 5,
        category: 'LESSON',
        level: 2,
        order: 4
    },
    {
        title: 'Complete 5 contents',
        description: 'Complete 5 lesson contents',
        points: 100,
        requiredCount: 5,
        category: 'CONTENT',
        level: 2,
        order: 5
    },
    {
        title: 'Login streak - 7 days',
        description: 'Login for 7 consecutive days',
        points: 100,
        requiredCount: 7,
        category: 'STREAK',
        level: 2,
        order: 6
    },
    {
        title: 'Generate 10 lessons',
        description: 'Create a total of 10 lessons',
        points: 200,
        requiredCount: 10,
        category: 'LESSON',
        level: 3,
        order: 7
    },
    {
        title: 'Complete 15 contents',
        description: 'Complete 15 lesson contents',
        points: 300,
        requiredCount: 15,
        category: 'CONTENT',
        level: 3,
        order: 8
    },
    {
        title: 'Login streak - 14 days',
        description: 'Login for 14 consecutive days',
        points: 200,
        requiredCount: 14,
        category: 'STREAK',
        level: 3,
        order: 9
    },
    {
        title: 'Generate 25 lessons',
        description: 'Create a total of 25 lessons',
        points: 500,
        requiredCount: 25,
        category: 'LESSON',
        level: 4,
        order: 10
    }
]

const generateMoreTasks = () => {
    let order = tasks.length + 1
    let currentLevel = 4

    const lessonCounts = [50, 75, 100, 150, 200, 300, 400, 500]
    const contentCounts = [30, 50, 75, 100, 150, 200, 300, 400]
    const streakDays = [30, 60, 90, 120, 180, 240, 300, 365]
    const achievementTitles = [
        'Content Creator',
        'Learning Machine',
        'Dedication Master',
        'Knowledge Seeker',
        'Education Pioneer',
        'Learning Legend',
        'Wisdom Keeper',
        'Grand Master'
    ]

    for (let i = 0; i < lessonCounts.length; i++) {
        currentLevel++
        const basePoints = 1000 + (i * 500)

        tasks.push({
            title: `Generate ${lessonCounts[i]} lessons`,
            description: `Create a total of ${lessonCounts[i]} lessons`,
            points: basePoints,
            requiredCount: lessonCounts[i],
            category: 'LESSON',
            level: currentLevel,
            order: order++
        })

        tasks.push({
            title: `Complete ${contentCounts[i]} contents`,
            description: `Complete ${contentCounts[i]} lesson contents`,
            points: basePoints + 200,
            requiredCount: contentCounts[i],
            category: 'CONTENT',
            level: currentLevel,
            order: order++
        })

        tasks.push({
            title: `Login streak - ${streakDays[i]} days`,
            description: `Login for ${streakDays[i]} consecutive days`,
            points: basePoints - 200,
            requiredCount: streakDays[i],
            category: 'STREAK',
            level: currentLevel,
            order: order++
        })

        tasks.push({
            title: achievementTitles[i],
            description: `Reach level ${currentLevel} and unlock the ${achievementTitles[i]} achievement`,
            points: basePoints + 500,
            requiredCount: 1,
            category: 'ACHIEVEMENT',
            level: currentLevel,
            order: order++
        })
    }
}

const addPrerequisites = async () => {
    const dbTasks = await Task.find().sort({ order: 1 })
    
    for (let i = 0; i < dbTasks.length; i++) {
        const task = dbTasks[i]
        const prerequisites = []

        if (i >= 3) {
            const prevLevelTasks = dbTasks
                .filter(t => t.level < task.level && t.category === task.category)
                .slice(-1)
            prerequisites.push(...prevLevelTasks.map(t => t._id))
        }

        if (prerequisites.length > 0) {
            await Task.findByIdAndUpdate(task._id, { prerequisites })
        }
    }
}

export const seedTasks = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI!)
        
        await Task.deleteMany({})
        
        generateMoreTasks()
        
        await Task.insertMany(tasks)
        
        await addPrerequisites()
        
        console.log('Tasks seeded successfully')
    } catch (error) {
        console.error('Error seeding tasks:', error)
    } finally {
        await mongoose.disconnect()
    }
}

if (require.main === module) {
    seedTasks()
} 