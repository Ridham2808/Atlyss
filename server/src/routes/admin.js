const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// All admin routes require auth + admin role
router.use(verifyToken);
router.use(requireRole('admin'));

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
    try {
        const [totalMembers, totalTrainers, totalClasses, todayAttendance] = await Promise.all([
            prisma.member.count(),
            prisma.trainer.count(),
            prisma.class.count(),
            prisma.attendance.count({
                where: {
                    checkinTime: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            })
        ]);

        // Active members: attended in last 30 days
        const activeMembers = await prisma.member.count({
            where: {
                lastAttendance: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            }
        });

        // Attendance last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const weeklyAttendance = await prisma.attendance.groupBy({
            by: ['checkinTime'],
            _count: true,
            where: { checkinTime: { gte: sevenDaysAgo } },
            orderBy: { checkinTime: 'asc' }
        });

        res.json({
            totalMembers,
            totalTrainers,
            totalClasses,
            activeMembers,
            todayAttendance,
            weeklyAttendance,
        });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ message: 'Failed to fetch stats' });
    }
});

// GET /api/admin/members?search=&membership=&goal=&page=1&limit=10
router.get('/members', async (req, res) => {
    try {
        const { search, membership, goal, page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {
            member: {
                ...(membership ? { membershipType: membership } : {}),
                ...(goal ? { fitnessGoal: goal } : {}),
            },
            ...(search ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ]
            } : {}),
            role: 'member',
        };

        const [members, total] = await Promise.all([
            prisma.user.findMany({
                where,
                include: {
                    member: true,
                },
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.user.count({ where })
        ]);

        const membersWithoutPass = members.map(({ password, ...m }) => m);
        res.json({ members: membersWithoutPass, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (err) {
        console.error('Members error:', err);
        res.status(500).json({ message: 'Failed to fetch members' });
    }
});

// PUT /api/admin/members/:id
router.put('/members/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, age, height, weight, fitnessGoal, membershipType } = req.body;

        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { name },
            include: { member: true }
        });

        if (user.member) {
            await prisma.member.update({
                where: { userId: parseInt(id) },
                data: { age, height, weight, fitnessGoal, membershipType }
            });
        }

        res.json({ message: 'Member updated successfully' });
    } catch (err) {
        console.error('Update member error:', err);
        res.status(500).json({ message: 'Failed to update member' });
    }
});

// DELETE /api/admin/members/:id
router.delete('/members/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.user.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Member deleted successfully' });
    } catch (err) {
        console.error('Delete member error:', err);
        res.status(500).json({ message: 'Failed to delete member' });
    }
});

// GET /api/admin/trainers
router.get('/trainers', async (req, res) => {
    try {
        const trainers = await prisma.user.findMany({
            where: { role: 'trainer' },
            include: {
                trainer: {
                    include: {
                        classes: true
                    }
                }
            }
        });
        const trainersClean = trainers.map(({ password, ...t }) => t);
        res.json({ trainers: trainersClean });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch trainers' });
    }
});

// GET /api/admin/classes
router.get('/classes', async (req, res) => {
    try {
        const classes = await prisma.class.findMany({
            include: {
                trainer: {
                    include: { user: { select: { name: true, email: true } } }
                },
                _count: { select: { attendance: true } }
            },
            orderBy: { scheduleTime: 'asc' }
        });
        res.json({ classes });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch classes' });
    }
});

// POST /api/admin/classes
router.post('/classes', async (req, res) => {
    try {
        const { className, trainerId, scheduleTime, capacity } = req.body;
        const newClass = await prisma.class.create({
            data: {
                className,
                trainerId: parseInt(trainerId),
                scheduleTime: new Date(scheduleTime),
                capacity: parseInt(capacity) || 20
            }
        });
        res.status(201).json({ class: newClass });
    } catch (err) {
        console.error('Create class error:', err);
        res.status(500).json({ message: 'Failed to create class' });
    }
});

// DELETE /api/admin/classes/:id
router.delete('/classes/:id', async (req, res) => {
    try {
        await prisma.class.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Class deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete class' });
    }
});

module.exports = router;
